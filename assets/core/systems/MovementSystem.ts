import { System, Query, system } from '@bl-framework/ecs';
import { TransformComponent, VelocityComponent } from '../components';
import { ECS_SYSTEM_PRIORITYS } from '../Constants';
import { SpatialIndexSystem } from './SpatialIndexSystem';

/**
 * 移动系统
 * 处理所有具有位置和速度组件的实体移动
 */
@system({ 
    name: 'MovementSystem',
    priority: ECS_SYSTEM_PRIORITYS.MOVEMENT // 逻辑执行阶段
})
export class MovementSystem extends System {
    /** 查询器 */
    private query!: Query;

    /** 系统初始化 */
    onInit(): void {
        // 创建查询：查找所有同时拥有 Transform 和 Velocity 组件的实体
        this.query = this.world.createQuery({
            all: [TransformComponent, VelocityComponent],
        });

        console.log('[MovementSystem] Initialized');
    }

    /** 系统更新 */
    onUpdate(dt: number): void {
        const spatialIndexSystem = this.world.getSystem(SpatialIndexSystem);
        let hasMovement = false;

        // 遍历所有符合条件的实体
        this.query.forEach((entity) => {
            // 获取组件
            const transform = this.world.getComponent(
                entity.id,
                TransformComponent
            )!;
            const velocity = this.world.getComponent(
                entity.id,
                VelocityComponent
            )!;

            // 如果组件未启用，跳过
            if (!transform.enabled || !velocity.enabled) return;

            // 限制速度
            if (velocity.velocity.length() > velocity.maxSpeed) {
                velocity.velocity.normalize().multiplyScalar(velocity.maxSpeed);
            }
            
            // 检查是否有实际移动
            const hasVelocity = velocity.velocity.length() > 0.001; // 忽略极小的速度

            // 更新位置
            if (hasVelocity) {
                transform.position.x += velocity.velocity.x * dt;
                transform.position.y += velocity.velocity.y * dt;
                transform.position.z += velocity.velocity.z * dt;
                hasMovement = true;
            }
        });

        // 如果有实体移动，标记空间索引系统为脏
        if (hasMovement && spatialIndexSystem) {
            spatialIndexSystem.markDirty();
        }
    }

    /** 系统销毁 */
    onDestroy(): void {
        console.log('[MovementSystem] Destroyed');
    }
}

