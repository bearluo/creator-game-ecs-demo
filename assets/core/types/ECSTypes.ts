/**
 * ECS 相关类型定义
 * 用于替换 any 类型，提高类型安全
 * 基于 @bl-framework/ecs 框架的类型定义
 * 
 * 使用 TypeScript 声明合并（Declaration Merging）来扩展类型
 * 这种方式不需要类型断言，直接扩展原始类型定义
 */

import { GameManager } from '../GameManager';

/**
 * 使用 TypeScript 声明合并扩展 World 类
 * 添加 GameManager 引用，用于系统访问 GameManager 的功能
 * 
 * 注意：这需要在 @bl-framework/ecs 模块的上下文中声明
 */
declare module '@bl-framework/ecs' {
    /**
     * 扩展 World 类，添加 GameManager 引用
     * 使用接口声明合并来扩展类的实例类型
     */
    interface World {
        /**
         * GameManager 引用（可选，由 GameManager 在初始化时设置）
         * 用于系统访问 GameManager 的功能（如实体销毁和资源回收）
         */
        gameManager?: GameManager;
    }
}

