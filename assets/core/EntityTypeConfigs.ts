/**
 * 实体类型配置
 * 定义不同实体类型的组件组合和初始化逻辑
 */

import { EntityTypeConfig } from './EntityTypeConfig';
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
import { Faction, ENTITY_TAGS } from './Constants';
import { initializeAIBehaviorTree } from './ai/AIBehaviorTreeInitializer';

/**
 * 实体类型配置映射
 * 使用静态配置对象，类型安全，编译时检查
 */
export const EntityTypeConfigs = {
    /** 僵尸实体（AI单位） */
    zombie: {
        requiredComponents: [
            TransformComponent,
            VelocityComponent,
            RenderComponent,
            FaceComponent,
            AIComponent,
            MemberOfFaction,
            HealthComponent
        ],
        onInit: (entity, world, options) => {
            // 设置阵营
            if (options?.faction) {
                const factionComp = entity.getComponent(MemberOfFaction);
                if (factionComp) {
                    factionComp.setFaction(options.faction);
                }
            }
            
            // 设置标签
            if (options?.tag) {
                entity.getOrCreateComponent(TagComponent).addTag(options.tag);
            }
            
            // 初始化行为树
            initializeAIBehaviorTree(world, entity);
        }
    } as EntityTypeConfig,
    
    /** 基地1 */
    base1: {
        requiredComponents: [
            TransformComponent,
            RenderComponent,
            HealthComponent,
            MemberOfFaction
        ],
        onInit: (entity, world, options) => {
            // 设置阵营
            if (options?.faction) {
                const factionComp = entity.getComponent(MemberOfFaction);
                if (factionComp) {
                    factionComp.setFaction(options.faction);
                }
            }
            
            // 设置标签
            if (options?.tag) {
                entity.getOrCreateComponent(TagComponent).addTag(options.tag);
            }
        }
    } as EntityTypeConfig,
    
    /** 基地2 */
    base2: {
        requiredComponents: [
            TransformComponent,
            RenderComponent,
            HealthComponent,
            MemberOfFaction
        ],
        onInit: (entity, world, options) => {
            // 设置阵营
            if (options?.faction) {
                const factionComp = entity.getComponent(MemberOfFaction);
                if (factionComp) {
                    factionComp.setFaction(options.faction);
                }
            }
            
            // 设置标签
            if (options?.tag) {
                entity.getOrCreateComponent(TagComponent).addTag(options.tag);
            }
        }
    } as EntityTypeConfig,
} as const;

/**
 * 类型安全的实体类型
 */
export type EntityType = keyof typeof EntityTypeConfigs;

