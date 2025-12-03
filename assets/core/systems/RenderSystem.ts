import { System, Query, Entity, system } from '@bl-framework/ecs';
import { Node } from 'cc';
import { TransformComponent, RenderComponent, VelocityComponent, FaceComponent } from '../components';
import { Utils } from '../Utils';
import { ECS_SYSTEM_PRIORITYS } from '../Constants';

/**
 * 渲染系统
 * 同步 ECS 实体的位置到 Cocos Creator 节点
 */
@system({
    name: 'RenderSystem',
    priority: ECS_SYSTEM_PRIORITYS.RENDER, // 渲染阶段
})
export class RenderSystem extends System {
    /** 查询器 */
    private query!: Query;
    private faceQuery!: Query;

    /** 帧计数器 */
    private _frameCount: number = 0;

    /** 系统初始化 */
    onInit(): void {
        this.query = this.world.createQuery({
            all: [TransformComponent, RenderComponent],
        });
        this.faceQuery = this.world.createQuery({
            all: [RenderComponent,VelocityComponent, FaceComponent],
        });

        console.log('[RenderSystem] Initialized');
    }

    /** 系统更新 */
    onUpdate(dt: number): void {
        let entities = this.query.getEntities();
        entities.forEach((entity) => {
            const render = this.world.getComponent(
                entity.id,
                RenderComponent
            )!;

            const node = render.node;
            if (!node || !node.isValid) return;

            const transform = this.world.getComponent(
                entity.id,
                TransformComponent
            )!;

            if (!transform.enabled) return;

            /**
             * 转成2.5D坐标
             */
            let [x, y, scale] = Utils.logicToRender(transform.position.x, transform.position.y);
            // 同步位置、旋转、缩放到节点
            node.setPosition(x, y, 0);
            node.setRotationFromEuler(transform.rotation);
            node.setScale(transform.scale.x * scale, transform.scale.y * scale, 1);
        });

        this.faceQuery.forEach((entity) => {
            const render = this.world.getComponent(
                entity.id,
                RenderComponent
            )!;
            
            const node = render.node;
            if (!node || !node.isValid) return;

            const face = this.world.getComponent(
                entity.id,
                FaceComponent
            )!;
            const velocity = this.world.getComponent(
                entity.id,
                VelocityComponent
            )!;

            if (velocity.velocity.x < 0) {
                face.direction = -1;
            } else if (velocity.velocity.x > 0) {
                face.direction = 1;
            }
            
            node.setScale(node.scale.x * face.direction, node.scale.y, 1);
        });
        
        /**
         * 更新实体2.5D排序渲染
         */
        // 每隔一段时间(10帧)才进行一次排序,降低排序频率
        if (this._frameCount >= 10) {
            this._frameCount = 0;
            this.sortEntities(entities);
        }
        this._frameCount++;
    }

    /**
     * 调整节点渲染顺序
     */
    sortEntities(entities: Entity[]) {
        // 根据实体的Y坐标进行排序，Y坐标大的在前面，实现2.5D的遮挡效果
        entities.sort((a, b) => {
            const transform1 = this.world.getComponent(
                a.id,
                TransformComponent
            );
            const transform2 = this.world.getComponent(
                b.id,
                TransformComponent
            );
            
            // 检查组件是否存在
            if (!transform1 || !transform2) return 0;
            
            return transform2.position.y - transform1.position.y;
        });
            
        for (let i = entities.length - 1; i >= 0; i--) {
            const entity = entities[i];
            const render = this.world.getComponent(
                entity.id,
                RenderComponent
            )!;
            const node = render.node;
            if (!node || !node.isValid) return;
            node.setSiblingIndex(i);
        }
    }

    /** 系统销毁 */
    onDestroy(): void {
        console.log('[RenderSystem] Destroyed');
    }
}

