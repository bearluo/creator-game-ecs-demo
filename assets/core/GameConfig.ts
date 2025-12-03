/**
 * 游戏配置
 * 集中管理所有游戏配置值，替代硬编码的魔法数字
 * 
 * 使用 as const 确保类型推导和不可变性
 * 
 * @example
 * ```typescript
 * import { GameConfig } from './GameConfig';
 * 
 * const attackRange = GameConfig.AI.DEFAULT_ATTACK_RANGE;
 * ```
 * 
 * @see ConfigValidator 配置验证器，用于验证配置值的合理性
 */
export const GameConfig = {
    /**
     * AI 配置
     */
    AI: {
        /** 默认攻击范围（像素） */
        DEFAULT_ATTACK_RANGE: 50,
        
        /** 默认攻击伤害 */
        DEFAULT_ATTACK_DAMAGE: 10,
        
        /** 默认攻击冷却时间（毫秒） */
        DEFAULT_ATTACK_COOLDOWN: 1000,
        
        /** AI 搜索敌人的半径（网格单位） */
        SEARCH_RADIUS: 400,
    },
    
    /**
     * 空间索引系统配置
     */
    SPATIAL_INDEX: {
        /** 空间网格单元大小（像素） */
        CELL_SIZE: 100,
    },
    
    /**
     * 移动系统配置
     */
    MOVEMENT: {
        /** 默认最大移动速度（像素/秒） */
        DEFAULT_MAX_SPEED: 10,
    },
} as const;

/**
 * 配置类型导出，供其他模块使用
 */
export type GameConfigType = typeof GameConfig;

