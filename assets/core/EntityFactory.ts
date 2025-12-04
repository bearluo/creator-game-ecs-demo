/**
 * 实体工厂
 * 根据实体类型配置自动创建和配置实体
 */

import { Entity, World } from '@bl-framework/ecs';
import { Node } from 'cc';
import { Vec2 } from 'cc';
import { PrefabFactory } from './PrefabFactory';
import { EntityTypeConfigs, EntityType } from './EntityTypeConfigs';
import { EntityCreateOptions } from './EntityTypeConfig';
import { TransformComponent, RenderComponent } from './components';
import { SpatialIndexSystem } from './systems';

/**
 * 实体工厂类
 * 负责根据实体类型配置创建和初始化实体
 */
export class EntityFactory {
    /**
     * 构造函数
     * @param world ECS World 实例
     * @param prefabFactory 预制体工厂
     * @param rootNode 根节点
     */
    constructor(
        private world: World,
        private prefabFactory: PrefabFactory,
        private rootNode: Node
    ) {}

    /**
     * 创建实体
     * @param type 实体类型
     * @param options 创建选项
     * @returns 创建的实体
     */
    createEntity(type: EntityType, options?: EntityCreateOptions): Entity {
        // 获取实体类型配置
        const config = EntityTypeConfigs[type];
        if (!config) {
            throw new Error(`Unknown entity type: ${type}`);
        }

        // 获取预制体节点
        const node = this.prefabFactory.getEntity(type);
        node.parent = this.rootNode;

        // 创建 ECS 实体
        const entity = this.world.createEntity(type);

        // 添加必需组件
        config.requiredComponents.forEach(ComponentType => {
            entity.addComponent(ComponentType);
        });

        // 设置 RenderComponent 的 node
        const renderComp = entity.getComponent(RenderComponent);
        if (renderComp) {
            renderComp.node = node;
        }

        // 设置位置
        if (options?.position) {
            const transform = entity.getComponent(TransformComponent);
            if (transform) {
                transform.position.set(options.position.x, options.position.y);
            }
        }

        // 执行初始化回调
        if (config.onInit) {
            config.onInit(entity, this.world, options);
        }

        // 标记空间索引系统为脏
        const spatialIndexSystem = this.world.getSystem(SpatialIndexSystem);
        if (spatialIndexSystem) {
            spatialIndexSystem.markDirty();
        }

        return entity;
    }
}

