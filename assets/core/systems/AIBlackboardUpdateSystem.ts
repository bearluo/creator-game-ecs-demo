/**
 * AI黑板更新系统
 * 负责更新所有AI实体的行为树黑板数据（如敌人列表等）
 */

import { Entity, Query, system, System } from '@bl-framework/ecs';
import { BehaviorTreeComponent } from '@bl-framework/behaviortree-ecs';
import { TransformComponent, MemberOfFaction } from '../components';
import { SpatialIndexSystem } from './SpatialIndexSystem';
import { ECS_SYSTEM_PRIORITYS } from '../Constants';
import { GameConfig } from '../GameConfig';

@system({
    name: 'AIBlackboardUpdateSystem',
    priority: ECS_SYSTEM_PRIORITYS.AI_BLACKBOARD_UPDATE, // 在空间索引系统之后执行
})
export class AIBlackboardUpdateSystem extends System {
    /** 查询器 */
    private query!: Query;

    /** 系统初始化 */
    onInit(): void {
        // 创建查询：查找所有拥有BehaviorTreeComponent和必要组件的实体
        this.query = this.world.createQuery({
            all: [BehaviorTreeComponent, TransformComponent, MemberOfFaction],
        });

        console.log('[AIBlackboardUpdateSystem] Initialized');
    }

    /**
     * 更新系统
     */
    onUpdate(dt: number): void {
        const entities = this.query.getEntities();
        const spatialIndexSystem = this.world.getSystem(SpatialIndexSystem);

        if (!spatialIndexSystem) {
            return;
        }

        for (const entity of entities) {
            const btComponent = entity.getComponent(BehaviorTreeComponent);
            const transform = entity.getComponent(TransformComponent);
            const faction = entity.getComponent(MemberOfFaction);

            if (!btComponent || !btComponent.blackboard || !transform || !faction) {
                continue;
            }

            // 获取附近的实体
            const nearbyEntities = spatialIndexSystem.getNearbyEntities(
                transform.position.x,
                transform.position.y,
                GameConfig.AI.SEARCH_RADIUS
            )
                .map(id => this.world.getEntity(id))
                .filter((e): e is Entity => e !== undefined);

            // 过滤出敌人
            const enemies = nearbyEntities.filter((other: Entity) => {
                const otherFaction = other.getComponent(MemberOfFaction)?.getFaction();
                if (!otherFaction) return false;
                return faction.getRelationWith(otherFaction) === 'enemy';
            });

            // 更新黑板中的敌人列表
            btComponent.blackboard.set('enemies', enemies);
        }
    }
}

