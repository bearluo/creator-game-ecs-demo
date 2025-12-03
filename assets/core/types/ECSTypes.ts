/**
 * ECS 相关类型定义
 * 用于替换 any 类型，提高类型安全
 * 基于 @bl-framework/ecs 框架的类型定义
 */

import { IWorld } from '@bl-framework/ecs';
import { GameManager } from '../GameManager';

/**
 * 黑板接口
 * 用于行为树的数据存储
 * 与 @bl-framework/behaviortree-ecs 的 BehaviorTreeComponent.blackboard 兼容
 */
export interface IBlackboard {
    /**
     * 获取值
     * @param key 键
     * @param defaultValue 默认值（可选）
     * @returns 值
     */
    get<T>(key: string, defaultValue?: T): T;

    /**
     * 设置值
     * @param key 键
     * @param value 值
     */
    set<T>(key: string, value: T): void;
}

/**
 * 扩展的 World 接口
 * 基于 IWorld，添加 GameManager 引用
 * 注意：World 类已经实现了 IWorld 接口的所有方法
 */
export interface IExtendedWorld extends IWorld {
    /**
     * GameManager 引用（可选，由 GameManager 在初始化时设置）
     * 用于系统访问 GameManager 的功能（如实体销毁和资源回收）
     */
    gameManager?: GameManager;
}

