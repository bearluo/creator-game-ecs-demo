/**
 * 追击者AI行为树定义
 * 将原有的硬编码追击逻辑转换为行为树
 */

import { BehaviorTreeBuilder, NodeStatus } from '@bl-framework/behaviortree';
import { Entity, IWorld, World } from '@bl-framework/ecs';
import { TransformComponent, VelocityComponent, MemberOfFaction, AIComponent, HealthComponent } from '../components';
import { SpatialIndexSystem, EntityLifecycleSystem } from '../systems';
import { GameConfig } from '../GameConfig';
import { IBlackboard, IExtendedWorld } from '../types/ECSTypes';
import { Vec2 } from 'cc';

const tmpVec2 = new Vec2();

/**
 * 创建追击者行为树
 * @param world ECS World实例
 * @param entity 实体实例
 * @returns 行为树实例
 */
export function createChaserBehaviorTree(world: IWorld, entity: Entity) {
    const builder = new BehaviorTreeBuilder();

    const tree = builder
        .selector('root')
            // 攻击逻辑分支：如果有目标且在攻击范围内且冷却时间已过则攻击
            .sequence('attackTarget')
                .condition('hasTargetAndInRange', (blackboard) => {
                    const target = blackboard.get<Entity>('nearestTarget', null);
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
                    const target = blackboard.get<Entity>('nearestTarget');
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
                            blackboard.set('nearestTarget', null);
                            
                            // 标记实体待销毁，将在帧末统一处理
                            const lifecycleSystem = world.getSystem(EntityLifecycleSystem);
                            if (lifecycleSystem) {
                                lifecycleSystem.markEntityForDestroy(target.id);
                            } else {
                                // 后备方案：直接销毁（不推荐，但确保功能正常）
                                console.warn('[ChaserBehaviorTree] EntityLifecycleSystem not found, destroying entity directly');
                                world.destroyEntity(target.id);
                            }
                        }
                        
                        // 攻击动作完成，返回成功
                        return NodeStatus.SUCCESS;
                    }
                    
                    return NodeStatus.FAILURE;
                })
            .end()

            // 追击逻辑分支：如果有目标且未在攻击范围内，则追击
            .sequence('chaseTarget')
                .condition('hasTarget', (blackboard) => {
                    const target = blackboard.get<Entity>('nearestTarget', null);
                    if (!target) return false;
                    
                    // 检查目标是否存活
                    const targetHealth = target.getComponent(HealthComponent);
                    if (targetHealth && !targetHealth.isAlive()) {
                        blackboard.set('nearestTarget', null);
                        return false;
                    }
                    
                    return true;
                })
                .action('chaseTarget', (blackboard) => {
                    const transform = entity.getComponent(TransformComponent);
                    const velocity = entity.getComponent(VelocityComponent);
                    const nearestTarget = blackboard.get<Entity>('nearestTarget');
                    if (!nearestTarget) return NodeStatus.FAILURE;
                    
                    const targetTransform = nearestTarget.getComponent(TransformComponent);
                    if (!transform || !velocity || !targetTransform) return NodeStatus.FAILURE;
                    const maxSpeed = velocity.maxSpeed ?? GameConfig.MOVEMENT.DEFAULT_MAX_SPEED;
                    const attackRange = blackboard.get<number>('attackRange', GameConfig.AI.DEFAULT_ATTACK_RANGE);

                    const direction = tmpVec2.set(
                        targetTransform.position.x - transform.position.x,
                        targetTransform.position.y - transform.position.y
                    );
                    const distance = direction.length();

                    if (distance > attackRange) {
                        // 在攻击范围外，继续追击
                        direction.normalize().multiplyScalar(maxSpeed);
                        velocity.velocity.set(direction.x, direction.y);
                        return NodeStatus.RUNNING;
                    } else {
                        // 在攻击范围内，停止移动
                        velocity.velocity.set(0, 0);
                        return NodeStatus.SUCCESS;
                    }
                })
            .end()

            // 搜索敌人逻辑分支
            .sequence('searchEnemy')
                .condition('hasEnemy', (blackboard) => {
                    const enemies = blackboard.get<Entity[]>('enemies', []);
                    return enemies.length > 0;
                })
                .action('searchNearestEnemy', (blackboard) => {
                    const enemies = blackboard.get<Entity[]>('enemies', []);
                    const transform = entity.getComponent(TransformComponent);
                    const velocity = entity.getComponent(VelocityComponent);

                    if (!transform || !velocity || enemies.length === 0) {
                        return NodeStatus.FAILURE;
                    }

                    // 找到最近的敌人
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

                        if (distance < nearestDistance) {
                            nearestDistance = distance;
                            nearestTarget = enemy;
                        }
                    }

                    if (!nearestTarget) {
                        return NodeStatus.FAILURE;
                    }

                    blackboard.set('nearestTarget', nearestTarget);
                    return NodeStatus.SUCCESS;
                })
            .end()

            // 如果没有敌人，保持静止
            .action('idle', (blackboard) => {
                const d_velocity = blackboard.get<Vec2>('d_velocity');
                const velocity = entity.getComponent(VelocityComponent);
                if (velocity) {
                    if (d_velocity) {
                        velocity.velocity.set(d_velocity.x, d_velocity.y);
                    } else {
                        velocity.velocity.set(0, 0, 0);
                    }
                }
                return NodeStatus.SUCCESS;
            })
        .end()
        .build();

    return tree;
}

/**
 * 更新行为树的黑板数据（敌人列表）
 * @param blackboard 黑板对象
 * @param world ECS World实例
 * @param entity 当前实体
 */
export function updateChaserBlackboard(blackboard: IBlackboard, world: IExtendedWorld, entity: Entity) {
    const transform = entity.getComponent(TransformComponent);
    const faction = entity.getComponent(MemberOfFaction);
    
    if (!transform || !faction) {
        blackboard.set('enemies', []);
        return;
    }

    // 获取空间索引系统
    const spatialIndexSystem = world.getSystem(SpatialIndexSystem);
    if (!spatialIndexSystem) {
        blackboard.set('enemies', []);
        return;
    }

    // 获取附近的实体
    const nearbyEntities = spatialIndexSystem.getNearbyEntities(
        transform.position.x, 
        transform.position.y, 
        GameConfig.AI.SEARCH_RADIUS
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
}

