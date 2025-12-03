/**
 * AI行为树初始化系统
 * 自动为拥有AIComponent的实体初始化行为树
 */

import { Entity, Query, system, System } from '@bl-framework/ecs';
import { BehaviorTreeComponent } from '@bl-framework/behaviortree-ecs';
import { AIComponent, TransformComponent, VelocityComponent, MemberOfFaction } from '../components';
import { initializeAIBehaviorTree } from '../ai/AIBehaviorTreeInitializer';
import { ECS_SYSTEM_PRIORITYS } from '../Constants';

@system({
    name: 'AIBehaviorTreeInitSystem',
    priority: ECS_SYSTEM_PRIORITYS.AI_BEHAVIOR_TREE_INIT // 最先执行，初始化AI行为树
})
export class AIBehaviorTreeInitSystem extends System {
    /** 查询器：查找有AIComponent但没有BehaviorTreeComponent的实体 */
    private query!: Query;

    /** 系统初始化 */
    onInit(): void {
        // 创建查询：查找所有有AIComponent但还没有BehaviorTreeComponent的实体
        this.query = this.world.createQuery({
            all: [AIComponent, TransformComponent, VelocityComponent, MemberOfFaction],
            none: [BehaviorTreeComponent]
        });

        console.log('[AIBehaviorTreeInitSystem] Initialized');
    }

    /**
     * 更新系统
     */
    onUpdate(dt: number): void {
        const entities = this.query.getEntities();

        for (const entity of entities) {
            const ai = entity.getComponent(AIComponent);
            if (!ai) continue;

            // 初始化行为树
            initializeAIBehaviorTree(this.world, entity, ai.attackRange);
        }
    }
}

