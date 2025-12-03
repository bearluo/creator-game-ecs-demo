/**
 * 游戏自定义事件扩展示例
 * 
 * 展示如何扩展框架的事件系统
 */

import { Vec2 } from 'cc';

// ==================== 方式1: 使用声明合并扩展框架事件 ====================

/**
 * 通过模块声明合并来扩展 IFWEvents
 * 这样可以直接在框架的事件分发器中使用自定义事件
 */
declare module '../../extensions/bl-framework/assets/events/FWEvents' {
    interface IFWEvents {
        /**
         * 游戏初始化事件
         */
        'GAME_INIT': [];
    }
}

// ==================== 方式2: 创建独立的事件类型 ====================

/**
 * 游戏专属事件类型（不扩展框架）
 * 适用于完全独立的游戏事件系统
 */
export interface IGameEvents {
    // 游戏初始化事件
    'GAME_INIT': [];
}

/**
 * 事件名称常量
 * 
 * 提供类型安全的事件名称访问
 */
export const GameEventNames = {
    // 游戏初始化事件
    GAME_INIT: 'GAME_INIT' as const,
} as const;

