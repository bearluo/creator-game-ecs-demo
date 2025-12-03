import { System, Query, system } from '@bl-framework/ecs';
import { TransformComponent } from '../components';
import { ECS_SYSTEM_PRIORITYS } from '../Constants';
import { GameConfig } from '../GameConfig';

/**
 * 空间索引系统
 * 用于快速查找指定范围内的实体
 * 目前采用空间网格法，后续可以考虑使用四叉树、八叉树等其他空间索引算法
 */
@system({
    name: 'SpatialIndexSystem',
    priority: ECS_SYSTEM_PRIORITYS.SPATIAL_INDEX, // 数据准备阶段
})
export class SpatialIndexSystem extends System {
    /** 查询器 */
    private query!: Query;

    /** 网格大小 */
    private readonly CELL_SIZE = GameConfig.SPATIAL_INDEX.CELL_SIZE;

    /** 空间网格 */
    private grid: Map<string, Set<number>> = new Map();

    /** 实体位置缓存 */
    private entityPositions: Map<number, string> = new Map();

    /** 脏标记：true 表示需要重建网格 */
    private dirty: boolean = true;

    /** 上一帧的实体数量（用于检测实体数量变化） */
    private lastEntityCount: number = 0;

    /** 系统初始化 */
    onInit(): void {
        this.query = this.world.createQuery({
            all: [TransformComponent],
        });
        console.log('[SpatialIndexSystem] Initialized');
    }

    /**
     * 标记为脏，表示需要重建网格
     */
    markDirty(): void {
        this.dirty = true;
    }

    /**
     * 检查是否脏（需要更新）
     * @returns 是否需要更新
     */
    isDirty(): boolean {
        return this.dirty;
    }

    /** 系统更新 */
    onUpdate(): void {
        const entities = this.query.getEntities();
        const currentEntityCount = entities.length;

        // 检查实体数量是否变化（后备检查）
        if (currentEntityCount !== this.lastEntityCount) {
            this.dirty = true;
            this.lastEntityCount = currentEntityCount;
        }

        // 只在脏标记为 true 时才重建网格
        if (!this.dirty) {
            return;
        }

        // 清空网格
        this.grid.clear();
        this.entityPositions.clear();

        // 更新网格
        entities.forEach(entity => {
            const transform = this.world.getComponent(entity.id, TransformComponent)!;
            if (!transform.enabled) return;

            const cellKey = this.getCellKey(transform.position.x, transform.position.y);
            
            // 添加实体到网格
            if (!this.grid.has(cellKey)) {
                this.grid.set(cellKey, new Set());
            }
            this.grid.get(cellKey)!.add(entity.id);
            
            // 缓存实体位置
            this.entityPositions.set(entity.id, cellKey);
        });

        // 清除脏标记
        this.dirty = false;
    }

    /**
     * 获取指定范围内的实体ID
     * @param x 中心点x坐标
     * @param y 中心点y坐标
     * @param radius 搜索半径
     * @returns 实体ID数组
     */
    getNearbyEntities(x: number, y: number, radius: number): number[] {
        const result = new Set<number>();
        const cellRadius = Math.ceil(radius / this.CELL_SIZE);
        
        const centerCellX = Math.floor(x / this.CELL_SIZE);
        const centerCellY = Math.floor(y / this.CELL_SIZE);

        // 获取搜索范围内的所有网格
        for (let i = -cellRadius; i <= cellRadius; i++) {
            for (let j = -cellRadius; j <= cellRadius; j++) {
                const cellX = centerCellX + i;
                const cellY = centerCellY + j;
                const cellKey = `${cellX},${cellY}`;

                const entities = this.grid.get(cellKey);
                if (entities) {
                    entities.forEach(entityId => result.add(entityId));
                }
            }
        }

        return Array.from(result);
    }

    /**
     * 获取网格键值
     * @param x x坐标
     * @param y y坐标
     * @returns 网格键值
     */
    private getCellKey(x: number, y: number): string {
        const cellX = Math.floor(x / this.CELL_SIZE);
        const cellY = Math.floor(y / this.CELL_SIZE);
        return `${cellX},${cellY}`;
    }
}
