# 错误处理策略设计决策

📌 CREATIVE PHASE START: 错误处理策略
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1️⃣ PROBLEM

**Description**: 设计统一的错误处理策略，确保系统在遇到错误时能够优雅地处理，不会崩溃，同时提供足够的调试信息。

**Requirements**:
- 统一的错误处理机制
- 开发环境提供详细错误信息
- 生产环境优雅降级，不崩溃
- 错误日志记录和分类
- 易于调试和定位问题
- 不影响正常功能性能

**Constraints**:
- 必须与现有 ECS 架构兼容
- 不能显著影响性能（错误处理应该是轻量级的）
- 需要支持 TypeScript 类型系统
- 错误处理不应掩盖真正的 bug

## 2️⃣ OPTIONS

**Option A: 防御性编程 + 工具类**
- 创建 EntityUtils 工具类，提供安全的组件获取方法
- 所有组件获取都通过工具类，统一处理 null/undefined
- 简单直接，易于使用

**Option B: 错误处理中间件**
- 创建错误处理中间件系统，统一捕获和处理错误
- 支持错误分类、日志记录、恢复机制
- 更完善但更复杂

**Option C: 异常处理 + 错误边界**
- 使用 try-catch 包装关键操作
- 定义错误边界，防止错误传播
- 传统方式，但需要大量 try-catch

## 3️⃣ ANALYSIS

| Criterion | Option A | Option B | Option C |
|-----------|----------|----------|----------|
| **实现复杂度** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **代码侵入性** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **性能影响** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **可维护性** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **调试友好** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **类型安全** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

**Key Insights**:
- Option A 最简单实用，性能最好，适合当前项目规模
- Option B 功能最完善，但实现复杂，可能过度设计
- Option C 传统方式，但需要大量 try-catch，代码侵入性强
- Option A 可以逐步演进：先实现工具类，未来可以添加错误处理中间件
- 项目当前主要是组件获取的 null 检查问题，Option A 最直接有效

## 4️⃣ DECISION

**Selected**: **Option A: 防御性编程 + 工具类**，结合**轻量级错误日志**

**Rationale**: 
1. **简单实用**: 实现成本低，直接解决当前主要问题（组件获取的 null 检查）
2. **性能优先**: 工具类方法可以内联优化，性能影响最小
3. **类型安全**: TypeScript 可以完美支持，提供编译时类型检查
4. **渐进式**: 可以逐步扩展，未来如果需要可以添加错误处理中间件
5. **符合项目规模**: 当前项目不需要复杂的错误处理系统

**实现策略**:
- **阶段 1**: 创建 EntityUtils 工具类，提供 safeGetComponent 方法
- **阶段 2**: 逐步替换所有组件获取调用
- **阶段 3**: 添加轻量级错误日志（开发环境详细，生产环境简化）

## 5️⃣ IMPLEMENTATION NOTES

### EntityUtils 工具类设计

```typescript
// assets/core/utils/EntityUtils.ts
export class EntityUtils {
    /**
     * 安全获取组件，如果组件不存在返回 null
     * @param entity 实体
     * @param componentClass 组件类
     * @returns 组件实例或 null
     */
    static safeGetComponent<T extends Component>(
        entity: Entity,
        componentClass: new() => T
    ): T | null {
        try {
            const component = entity.getComponent(componentClass);
            if (!component) {
                if (__DEV__) {
                    console.warn(
                        `[EntityUtils] Component ${componentClass.name} not found on entity ${entity.id}`
                    );
                }
                return null;
            }
            return component;
        } catch (error) {
            if (__DEV__) {
                console.error(
                    `[EntityUtils] Failed to get component ${componentClass.name} from entity ${entity.id}`,
                    error
                );
            }
            return null;
        }
    }
    
    /**
     * 安全获取多个组件
     * @param entity 实体
     * @param componentClasses 组件类数组
     * @returns 组件数组，缺失的组件为 null
     */
    static safeGetComponents<T extends Component>(
        entity: Entity,
        componentClasses: (new() => T)[]
    ): (T | null)[] {
        return componentClasses.map(cls => this.safeGetComponent(entity, cls));
    }
}
```

### 使用方式

```typescript
// 旧方式（不安全）
const transform = entity.getComponent(TransformComponent);
if (!transform) return; // 可能为 null

// 新方式（安全）
const transform = EntityUtils.safeGetComponent(entity, TransformComponent);
if (!transform) return; // 明确处理 null
```

### 错误日志策略

#### 开发环境（__DEV__ = true）
- 详细错误信息：组件名、实体 ID、调用栈
- 警告信息：缺失组件、无效操作
- 性能警告：频繁的错误操作

#### 生产环境（__DEV__ = false）
- 最小日志：只记录严重错误
- 优雅降级：错误时返回默认值或跳过操作
- 不中断游戏流程

### 实施步骤

1. **创建 EntityUtils 工具类**
   - 实现 safeGetComponent 方法
   - 添加 JSDoc 注释
   - 添加类型定义

2. **逐步替换组件获取**
   - 优先替换关键系统（AI、移动、渲染）
   - 确保每次替换后测试通过
   - 保持向后兼容

3. **添加错误日志**
   - 实现开发/生产环境区分
   - 添加错误分类和统计
   - 性能监控

### 边界情况处理

1. **实体已销毁**: 检查实体有效性，避免访问已销毁的实体
2. **组件已移除**: 安全获取返回 null，调用方处理
3. **并发访问**: ECS 系统是单线程的，不需要考虑并发
4. **性能影响**: 工具类方法应该内联，性能影响 < 1%

### 未来扩展

如果未来需要更完善的错误处理：
- 可以添加错误处理中间件（Option B）
- 可以添加错误恢复机制
- 可以添加错误上报系统

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 CREATIVE PHASE END

**VERIFICATION**:
- [x] 问题清晰定义
- [x] 多个选项已考虑
- [x] 决策已做出并说明理由
- [x] 实施指导已提供

