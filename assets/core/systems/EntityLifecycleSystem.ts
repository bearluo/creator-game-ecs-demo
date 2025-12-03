/**
 * 实体生命周期管理系统
 * 负责在每帧的最后统一处理实体销毁，确保资源正确回收
 * 优先级最低，在所有其他系统之后执行
 */

import { Entity, system, System } from '@bl-framework/ecs';
import { ECS_SYSTEM_PRIORITYS } from '../Constants';

@system({
    name: 'EntityLifecycleSystem',
    priority: ECS_SYSTEM_PRIORITYS.ENTITY_LIFECYCLE, // 最后执行，清理阶段
})
export class EntityLifecycleSystem extends System {
    /** 待销毁的实体队列 */
    private pendingDestroyEntities: Set<number> = new Set();

    /** 系统初始化 */
    onInit(): void {
        console.log('[EntityLifecycleSystem] Initialized');
    }

    /**
     * 标记实体待销毁
     * @param entityId 实体ID
     */
    markEntityForDestroy(entityId: number): void {
        this.pendingDestroyEntities.add(entityId);
    }

    /**
     * 系统更新 - 在每帧最后统一处理实体销毁
     */
    onUpdate(dt: number): void {
        if (this.pendingDestroyEntities.size === 0) {
            return;
        }

        // 获取 GameManager 引用
        // 使用声明合并扩展，无需类型断言
        const gameManager = this.world.gameManager;
        if (!gameManager) {
            console.warn('[EntityLifecycleSystem] GameManager not found, cannot destroy entities properly');
            // 后备方案：直接销毁实体（不推荐）
            this.pendingDestroyEntities.forEach(entityId => {
                this.world.destroyEntity(entityId);
            });
            this.pendingDestroyEntities.clear();
            return;
        }

        // 统一处理所有待销毁的实体
        this.pendingDestroyEntities.forEach(entityId => {
            const entity = this.world.getEntity(entityId);
            if (entity) {
                // 通过 GameManager 销毁实体，确保资源正确回收
                gameManager.destroyEntity(entity);
            } else {
                // 实体已不存在，直接清理
                console.warn(`[EntityLifecycleSystem] Entity ${entityId} not found, skipping destroy`);
            }
        });

        // 清空待销毁队列
        this.pendingDestroyEntities.clear();
    }
}

