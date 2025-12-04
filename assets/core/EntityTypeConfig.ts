/**
 * 实体类型配置系统
 * 定义不同实体类型的组件组合和初始化逻辑
 */

import { ComponentType, Entity, World } from '@bl-framework/ecs';
import { Vec2 } from 'cc';
import { 
    TransformComponent, 
    VelocityComponent, 
    RenderComponent, 
    FaceComponent,
    AIComponent,
    HealthComponent,
    MemberOfFaction,
    TagComponent
} from './components';
import { Faction } from './Constants';
import { initializeAIBehaviorTree } from './ai/AIBehaviorTreeInitializer';

/**
 * 实体创建选项
 */
export interface EntityCreateOptions {
    /** 实体位置 */
    position?: Vec2;
    /** 实体阵营 */
    faction?: Faction;
    /** 实体标签 */
    tag?: string;
    /** 扩展选项 */
    [key: string]: any;
}

/**
 * 实体类型配置
 */
export interface EntityTypeConfig {
    /** 必需组件列表 */
    requiredComponents: ComponentType[];
    /** 可选组件列表 */
    optionalComponents?: ComponentType[];
    /** 初始化回调 */
    onInit?: (entity: Entity, world: World, options?: EntityCreateOptions) => void;
}

