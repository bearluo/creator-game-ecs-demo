import { _decorator, assert, Color, color, Component, Graphics, JsonAsset, Node, Pool, Prefab } from 'cc';
import { PrefabFactory } from './PrefabFactory';
import { Utils } from './Utils';
import { GameEventNames } from './GameEvents';
import { Entity, Query, World } from '@bl-framework/ecs';
import { BehaviorTreeSystem } from '@bl-framework/behaviortree-ecs';
import { MovementSystem, RenderSystem, SpatialIndexSystem, EntityLifecycleSystem } from './systems';
import { TransformComponent,RenderComponent,TagComponent, VelocityComponent, FaceComponent } from './components';
import { GameConfig } from './GameConfig';
import { ConfigValidator } from './ConfigValidator';
import { EntityFactory } from './EntityFactory';
import { EntityType } from './EntityTypeConfigs';
import { EntityCreateOptions } from './EntityTypeConfig';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    _prefabFactory: PrefabFactory = new PrefabFactory();
    
    /** 实体工厂 */
    private _entityFactory: EntityFactory | null = null;

    world:World = new World();

    /**
     * 配置文件
     */
    @property(JsonAsset)
    _config:JsonAsset = null;

    /**
     * 根节点
     */
    @property(Node)
    rootNode: Node = null;

    private _init: boolean = false;

    isInit(): boolean {
        return this._init;
    }

    @property({
        type: JsonAsset,
        displayName: '配置文件',
    })
    get config():JsonAsset {
        return this._config;
    }
    set config(value:JsonAsset) {
        this._config = value;
    }

    onLoad() {
    }


    start() {
        assert(this._config !== null, '配置文件不能为空');
        // 加载配置
        this.loadConfig();
    }

    lateUpdate(deltaTime: number) {
        if (!this._init) {
            return;
        }
        this.world.update(deltaTime);
    }

    /**
     * 创建实体
     * @param entityName 实体名称
     * @param options 创建选项（位置、阵营、标签等）
     * @returns 创建的实体
     */
    createEntity(entityName: string, options?: EntityCreateOptions): Entity {
        // 使用 EntityFactory 创建实体
        return this._entityFactory.createEntity(entityName as EntityType, options);
    }

    /**
     * 标记实体待销毁（将在帧末统一处理）
     * @param entity 要销毁的实体
     */
    markEntityForDestroy(entity: Entity): void {
        if (!entity) {
            console.warn('[GameManager] Attempted to mark null entity for destroy');
            return;
        }

        // 获取实体生命周期系统
        const lifecycleSystem = this.world.getSystem(EntityLifecycleSystem);
        if (lifecycleSystem) {
            // 标记实体待销毁，将在帧末统一处理
            lifecycleSystem.markEntityForDestroy(entity.id);
        } else {
            // 后备方案：如果系统不存在，立即销毁（不推荐）
            console.warn('[GameManager] EntityLifecycleSystem not found, destroying entity immediately');
            this.destroyEntityImmediate(entity);
        }
    }

    /**
     * 立即销毁实体并回收相关资源（内部方法，由 EntityLifecycleSystem 调用）
     * @param entity 要销毁的实体
     */
    destroyEntity(entity: Entity): void {
        this.destroyEntityImmediate(entity);
    }

    /**
     * 立即销毁实体并回收相关资源（内部实现）
     * @param entity 要销毁的实体
     */
    private destroyEntityImmediate(entity: Entity): void {
        if (!entity) {
            console.warn('[GameManager] Attempted to destroy null entity');
            return;
        }

        // 获取渲染组件，回收 Node 到对象池
        const renderComp = entity.getComponent(RenderComponent);
        if (renderComp?.node) {
            const entityName = entity.name || entity.id.toString();
            try {
                // 将 Node 回收到对象池
                this._prefabFactory.putEntity(entityName, renderComp.node);
            } catch (error) {
                // 如果对象池不存在，直接销毁 Node
                console.warn(`[GameManager] Failed to recycle node for entity ${entityName}, destroying instead:`, error);
                renderComp.node.destroy();
            }
        }

        // 销毁 ECS 实体
        this.world.destroyEntity(entity.id);

        // 实体销毁后，标记空间索引系统为脏
        const spatialIndexSystem = this.world.getSystem(SpatialIndexSystem);
        if (spatialIndexSystem) {
            spatialIndexSystem.markDirty();
        }
    }

    async loadConfig() {
        const config = this._config.json as IConfig;
        if (!config) {
            throw new Error('配置文件加载失败');
        }
        /**
         * 加载实体预制体
         */
        let {entities} = config;
        for (const entity of entities) {
            let {prefab_path} = entity;
            await app.manager.asset.load(prefab_path, Prefab);
        }

        entities.forEach((entity: IPrefabConfig) => {
            this._prefabFactory.registerPrefabFactory(entity);
        });
        this._init = true;

        this.initWorld();
        
        // 初始化 EntityFactory
        this._entityFactory = new EntityFactory(
            this.world,
            this._prefabFactory,
            this.rootNode
        );

        app.manager.event.emit(GameEventNames.GAME_INIT);
    }

    
    /**
     * 初始化 ECS World
     */
    private initWorld(): void {
        // 在开发模式下验证配置
        // 注意：在 Cocos Creator 中，可以通过 debug 模式判断
        try {
            ConfigValidator.validateInDev(GameConfig);
        } catch (error) {
            console.warn('[GameManager] Config validation failed:', error);
        }

        // 创建 World，启用调试模式
        this.world = new World({
            initialEntityPoolSize: 1000,
            componentPoolSize: 100,
            debug: true,
        });

        // 在 World 上存储 GameManager 引用，以便其他系统访问
        // 使用声明合并扩展，无需类型断言
        this.world.gameManager = this;

        // 注册系统（按优先级顺序执行）
        // 优先级 10: 数据准备系统
        this.world.registerSystem(SpatialIndexSystem); // 空间索引
        
        // 优先级 30: 逻辑执行系统
        this.world.registerSystem(BehaviorTreeSystem); // 执行行为树
        // AISystem 已移除，AI逻辑已完全迁移到行为树系统
        this.world.registerSystem(MovementSystem); // 移动系统
        
        // 优先级 50: 渲染系统
        this.world.registerSystem(RenderSystem); // 渲染系统
        
        // 优先级 60: 清理系统
        this.world.registerSystem(EntityLifecycleSystem); // 实体生命周期管理（最后执行）

        console.log('[ECSExample] World initialized');
    }
}
    
interface IConfig {
    entities: IPrefabConfig[];
}

interface IPrefabConfig {
    name: string;
    prefab_path: string;
    pool_size?: number;
    shrink_threshold?: number;
}


