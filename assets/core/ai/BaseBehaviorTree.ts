/**
 * 基地AI行为树定义
 * 基地是静态防御单位，负责检测并攻击进入攻击范围的敌人
 */

import { BehaviorTreeBuilder, Blackboard, NodeStatus } from '@bl-framework/behaviortree';
import { Entity, World } from '@bl-framework/ecs';
import { TransformComponent, MemberOfFaction, AIComponent, HealthComponent } from '../components';
import { SpatialIndexSystem, EntityLifecycleSystem } from '../systems';
import { GameConfig } from '../GameConfig';
import { Vec2 } from 'cc';

const tmpVec2 = new Vec2();

/**
 * 创建基地行为树
 * @param world ECS World实例
 * @param entity 实体实例
 * @returns 行为树实例
 */
export function createBaseBehaviorTree(world: World, entity: Entity) {
    const builder = new BehaviorTreeBuilder();

    const tree = builder
        .selector('root')
            // 攻击逻辑分支：如果有目标且在攻击范围内且冷却时间已过则攻击
            .sequence('attackTarget')
                .condition('hasTargetAndInRange', (blackboard) => {
                    const targetId = blackboard.get<number>('nearestTarget', NaN);
                    if (isNaN(targetId)) return false;
                    const target = world.getEntity(targetId);
                    if (!target) return false;
                    
                    // 检查目标是否存活
                    const targetHealth = target.getComponent(HealthComponent);
                    if (targetHealth && !targetHealth.isAlive()) {
                        return false;
                    }
                    
                    const transform = entity.getComponent(TransformComponent);
                    const targetTransform = target.getComponent(TransformComponent);
                    if (!transform || !targetTransform) return false;
                    
                    const attackRange = blackboard.get<number>('attackRange', GameConfig.AI.DEFAULT_ATTACK_RANGE);
                    const dx = targetTransform.position.x - transform.position.x;
                    const dy = targetTransform.position.y - transform.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    return distance <= attackRange;
                })
                .condition('canAttack', (blackboard) => {
                    // 检查攻击冷却时间
                    const ai = entity.getComponent(AIComponent);
                    if (!ai) return false;
                    return ai.canAttack();
                })
                .action('attack', (blackboard) => {
                    const targetId = blackboard.get<number>('nearestTarget');
                    if (isNaN(targetId)) return NodeStatus.FAILURE;
                    const target = world.getEntity(targetId);
                    if (!target) return NodeStatus.FAILURE;
                    
                    const ai = entity.getComponent(AIComponent);
                    if (!ai) return NodeStatus.FAILURE;
                    
                    // 获取目标的生命值组件
                    const targetHealth = target.getComponent(HealthComponent);
                    if (targetHealth && targetHealth.isAlive()) {
                        // 造成伤害
                        const damage = ai.attackDamage;
                        targetHealth.takeDamage(damage);
                        
                        // 记录攻击时间
                        ai.recordAttack();
                        
                        // 如果目标死亡，清除目标
                        if (!targetHealth.isAlive()) {
                            blackboard.set('nearestTarget', NaN);
                            
                            // 标记实体待销毁，将在帧末统一处理
                            const lifecycleSystem = world.getSystem(EntityLifecycleSystem);
                            if (lifecycleSystem) {
                                lifecycleSystem.markEntityForDestroy(target.id);
                            } else {
                                // 后备方案：直接销毁（不推荐，但确保功能正常）
                                console.warn('[BaseBehaviorTree] EntityLifecycleSystem not found, destroying entity directly');
                                world.destroyEntity(target.id);
                            }
                        }
                        
                        // 攻击动作完成，返回成功
                        return NodeStatus.SUCCESS;
                    }
                    
                    return NodeStatus.FAILURE;
                })
            .end()

            // 搜索敌人逻辑分支：搜索攻击范围内的敌人
            .sequence('searchEnemy')
                .condition('hasEnemy', (blackboard) => {
                    const enemies = blackboard.get<Entity[]>('enemies', []);
                    return enemies.length > 0;
                })
                .action('searchNearestEnemy', (blackboard) => {
                    const enemies = blackboard.get<Entity[]>('enemies', []);
                    const transform = entity.getComponent(TransformComponent);
                    const ai = entity.getComponent(AIComponent);

                    if (!transform || !ai || enemies.length === 0) {
                        return NodeStatus.FAILURE;
                    }

                    const attackRange = blackboard.get<number>('attackRange', GameConfig.AI.DEFAULT_ATTACK_RANGE);

                    // 找到攻击范围内最近的敌人
                    let nearestTarget: Entity | null = null;
                    let nearestDistance = Infinity;

                    for (const enemy of enemies) {
                        const enemyTransform = enemy.getComponent(TransformComponent);
                        if (!enemyTransform) continue;
                        
                        // 只选择存活的敌人作为目标
                        const enemyHealth = enemy.getComponent(HealthComponent);
                        if (enemyHealth && !enemyHealth.isAlive()) continue;

                        const distance = tmpVec2.set(
                            transform.position.x,
                            transform.position.y
                        ).subtract2f(
                            enemyTransform.position.x,
                            enemyTransform.position.y
                        ).length();

                        // 只考虑攻击范围内的敌人
                        if (distance <= attackRange && distance < nearestDistance) {
                            nearestDistance = distance;
                            nearestTarget = enemy;
                        }
                    }

                    if (!nearestTarget) {
                        // 没有找到攻击范围内的敌人，清除目标
                        blackboard.set('nearestTarget', NaN);
                        return NodeStatus.FAILURE;
                    }

                    blackboard.set('nearestTarget', nearestTarget.id);
                    return NodeStatus.SUCCESS;
                })
            .end()

            // 自动修复逻辑分支（可选）：如果生命值不满，自动修复
            .sequence('autoRepair')
                .condition('needsRepair', (blackboard) => {
                    const health = entity.getComponent(HealthComponent);
                    if (!health) return false;
                    // 如果生命值不满，需要修复
                    return health.current < health.max;
                })
                .condition('canRepair', (blackboard) => {
                    // 检查修复冷却时间（如果有的话）
                    const lastRepairTime = blackboard.get<number>('lastRepairTime', 0);
                    const repairCooldown = blackboard.get<number>('repairCooldown', 1000); // 默认1秒修复一次
                    return (Date.now() - lastRepairTime) >= repairCooldown;
                })
                .action('repair', (blackboard) => {
                    const health = entity.getComponent(HealthComponent);
                    if (!health) return NodeStatus.FAILURE;
                    
                    // 每次修复恢复一定生命值
                    const repairAmount = blackboard.get<number>('repairAmount', 1); // 默认每次修复1点
                    health.heal(repairAmount);
                    
                    // 记录修复时间
                    blackboard.set('lastRepairTime', Date.now());
                    
                    return NodeStatus.SUCCESS;
                })
            .end()

            // 空闲状态：基地保持静止
            .action('idle', (blackboard) => {
                // 基地是静态的，不需要移动
                // 可以在这里添加其他空闲状态的处理逻辑
                return NodeStatus.SUCCESS;
            })
        .end()
        .build();

    return tree;
}

/**
 * 更新基地行为树的黑板数据（敌人列表）
 * @param blackboard 黑板对象（来自 BehaviorTreeComponent.blackboard）
 * @param world ECS World实例
 * @param entity 当前实体
 */
export function updateBaseBlackboard(blackboard: Blackboard, world: World, entity: Entity) {
    const transform = entity.getComponent(TransformComponent);
    const faction = entity.getComponent(MemberOfFaction);
    const ai = entity.getComponent(AIComponent);
    
    if (!transform || !faction || !ai) {
        blackboard.set('enemies', []);
        return;
    }

    // 获取空间索引系统
    const spatialIndexSystem = world.getSystem(SpatialIndexSystem);
    if (!spatialIndexSystem) {
        blackboard.set('enemies', []);
        return;
    }

    // 基地的搜索范围应该基于攻击范围，而不是固定的搜索半径
    // 使用攻击范围的2倍作为搜索范围，确保能找到所有可能的敌人
    const searchRadius = ai.attackRange * 2;

    // 获取附近的实体
    const nearbyEntities = spatialIndexSystem.getNearbyEntities(
        transform.position.x, 
        transform.position.y, 
        searchRadius
    )
        .map(id => world.getEntity(id))
        .filter((e): e is Entity => e !== undefined);

    // 过滤出敌人
    const enemies = nearbyEntities.filter((other: Entity) => {
        const otherFaction = other.getComponent(MemberOfFaction)?.getFaction();
        if (!otherFaction) return false;
        return faction.getRelationWith(otherFaction) === 'enemy';
    });

    blackboard.set('enemies', enemies);
    
    // 确保攻击范围在黑板中
    if (!blackboard.has('attackRange')) {
        blackboard.set('attackRange', ai.attackRange);
    }
}

