/**
 * AI行为树初始化器
 * 负责为实体创建和初始化行为树组件
 */

import { Entity, IWorld, World } from '@bl-framework/ecs';
import { BehaviorTreeComponent } from '@bl-framework/behaviortree-ecs';
import { AIComponent, TransformComponent, VelocityComponent, MemberOfFaction } from '../components';
import { GameConfig } from '../GameConfig';
import { createChaserBehaviorTree } from './ChaserBehaviorTree';

/**
 * 为实体初始化行为树
 * @param world ECS World实例
 * @param entity 实体
 * @param attackRange 攻击范围（可选，从AIComponent获取）
 */
export function initializeAIBehaviorTree<T extends IWorld>(world: T, entity: Entity, attackRange?: number): void {
    // 检查实体是否已有必要的组件
    const transform = entity.getComponent(TransformComponent);
    const velocity = entity.getComponent(VelocityComponent);
    const ai = entity.getComponent(AIComponent);
    const faction = entity.getComponent(MemberOfFaction);

    if (!transform || !velocity || !faction) {
        console.warn(`[AIBehaviorTreeInitializer] Entity ${entity.id} missing required components`);
        return;
    }

    // 检查是否已有BehaviorTreeComponent
    let btComponent = entity.getComponent(BehaviorTreeComponent);
    if (!btComponent) {
        // 创建并添加BehaviorTreeComponent（使用entity.addComponent）
        btComponent = entity.addComponent(BehaviorTreeComponent);
    }

    // 创建行为树
    const tree = createChaserBehaviorTree(world, entity);
    btComponent.setBehaviorTree(tree);

    // 设置攻击范围到黑板
    const attackRangeValue = attackRange ?? ai?.attackRange ?? GameConfig.AI.DEFAULT_ATTACK_RANGE;
    if (btComponent.blackboard) {
        btComponent.blackboard.set('attackRange', attackRangeValue);
    }

    // 设置更新间隔（每帧更新）
    btComponent.updateInterval = 0;

    // 初始化Entity绑定
    if (btComponent.entityBinding) {
        // 可以在这里绑定Entity的组件属性到黑板
        // 例如：绑定TransformComponent的位置到黑板
    }

    console.log(`[AIBehaviorTreeInitializer] Behavior tree initialized for entity ${entity.id}`);
}


