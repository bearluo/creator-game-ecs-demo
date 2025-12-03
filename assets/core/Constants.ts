/**
 * 游戏相关常量
 */
export const GAME = {
    /** 2.5D视角的默认旋转角度(65度) */
    ROTATION_ANGLE: Math.PI * (65 / 180), // 使用括号提高可读性
} as const; // 使用 as const 确保类型推导更精确

/**
 * 游戏配置相关常量
 */
export const CONFIG = {
    /** 默认帧率 */
    DEFAULT_FPS: 60,
} as const;

/**
 * ECS 系统更新优先级常量
 * 数字越小优先级越高，系统按优先级顺序执行
 * 
 * 执行顺序：
 * 1. 初始化系统 (0-9)
 * 2. 数据准备系统 (10-19)
 * 3. 逻辑执行系统 (20-39)
 * 4. 渲染系统 (40-49)
 * 5. 清理系统 (50+)
 */
export const ECS_SYSTEM_PRIORITYS = {
    /** AI行为树初始化系统 - 优先级 0（最先执行） */
    AI_BEHAVIOR_TREE_INIT: 0,
    
    /** 空间索引系统 - 优先级 10（数据准备） */
    SPATIAL_INDEX: 10,
    
    /** AI黑板更新系统 - 优先级 20（在空间索引之后） */
    AI_BLACKBOARD_UPDATE: 20,
    
    /** AI行为树执行系统 - 优先级 30（逻辑执行） */
    AI_BEHAVIOR_TREE: 30,
    
    /** 移动系统 - 优先级 40（逻辑执行） */
    MOVEMENT: 40,
    
    /** 渲染系统 - 优先级 50（渲染） */
    RENDER: 50,
    
    /** 实体生命周期系统 - 优先级 60（最后执行，清理） */
    ENTITY_LIFECYCLE: 60,
} as const;

/**
 * @deprecated 使用 ECS_SYSTEM_PRIORITYS 常量对象替代
 * 保留枚举以保持向后兼容，将在未来版本中移除
 */
export enum ECS_SYSTEM_PRIORITYS_LEGACY {
    /** @deprecated 使用 ECS_SYSTEM_PRIORITYS.SPATIAL_INDEX */
    SPATIAL_INDEX_PRIORITY = ECS_SYSTEM_PRIORITYS.SPATIAL_INDEX,
    /** @deprecated 使用 ECS_SYSTEM_PRIORITYS.AI_BEHAVIOR_TREE */
    AI_PRIORITY = ECS_SYSTEM_PRIORITYS.AI_BEHAVIOR_TREE,
    /** @deprecated 使用 ECS_SYSTEM_PRIORITYS.MOVEMENT */
    MOVEMENT_PRIORITY = ECS_SYSTEM_PRIORITYS.MOVEMENT,
    /** @deprecated 使用 ECS_SYSTEM_PRIORITYS.RENDER */
    RENDER_PRIORITY = ECS_SYSTEM_PRIORITYS.RENDER,
    /** @deprecated 使用 ECS_SYSTEM_PRIORITYS.ENTITY_LIFECYCLE */
    ENTITY_LIFECYCLE_PRIORITY = ECS_SYSTEM_PRIORITYS.ENTITY_LIFECYCLE,
}

/**
 * 实体标签
 */
export const ENTITY_TAGS = {
    PLAYER_1: 'player_1',
    PLAYER_2: 'player_2',
} as const;

export enum Faction { NULL,Player_1, Player_2 }

export const FactionRelation = {
    [Faction.Player_1]:    { [Faction.Player_1]: 'ally', [Faction.Player_2]: 'enemy' },
    [Faction.Player_2]:    { [Faction.Player_1]: 'enemy', [Faction.Player_2]: 'ally' },
} as const;
