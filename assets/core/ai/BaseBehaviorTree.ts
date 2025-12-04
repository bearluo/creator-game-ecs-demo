/**
 * 基地AI行为树定义
 * 基地是静态防御单位，负责检测并攻击进入攻击范围的敌人
 */

import { BehaviorTreeBuilder, Blackboard, NodeStatus } from '@bl-framework/behaviortree';
import { Entity, World } from '@bl-framework/ecs';
import { TransformComponent, MemberOfFaction, CombatComponent, HealthComponent } from '../components';
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

