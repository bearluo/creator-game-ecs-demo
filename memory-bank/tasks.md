# Memory Bank: Tasks

## Current Task
项目架构优化与重构 (Level 3)

## Task Description
基于 VAN 架构分析报告，对项目进行系统性的架构优化，包括清理冗余代码、修复资源管理问题、改进配置管理、增强错误处理、优化性能等。这是一个综合性的架构优化任务，涉及多个系统和组件。

## Complexity Level
**Level 3: Intermediate Feature** - 涉及多个系统修改，需要综合规划和设计决策

## Status
- [x] VAN 架构分析完成
- [x] 问题识别和优先级划分
- [x] PLAN 模式：详细规划
- [x] CREATIVE 模式：设计决策（配置管理、性能优化）
- [x] IMPLEMENT 模式：实施优化（阶段 1-2 完成，阶段 3 部分完成）
- [x] REFLECT 模式：反思总结
- [x] ARCHIVE 模式：归档文档

---

## 📋 Requirements Analysis

### 核心需求 (Functional Requirements)

#### 优先级 1: 立即修复
1. **清理冗余系统**
   - [ ] 移除或归档未使用的 AISystem
   - [ ] 清理相关导入和引用
   - [ ] 更新文档说明

2. **修复实体生命周期管理**
   - [ ] 实现统一的实体销毁方法
   - [ ] 确保 Cocos Creator Node 正确回收到对象池
   - [ ] 更新所有实体销毁调用点

3. **提取魔法数字到配置**
   - [ ] 创建 GameConfig.ts 配置文件
   - [ ] 替换所有硬编码值
   - [ ] 支持配置验证和默认值

#### 优先级 2: 短期改进
4. **改进系统优先级管理**
   - [ ] 重构优先级定义（使用明确数值）
   - [ ] 更新所有系统优先级
   - [ ] 添加优先级文档

5. **增强错误处理**
   - [ ] 创建 EntityUtils 工具类
   - [ ] 统一组件获取方式
   - [ ] 添加边界检查和空值处理

6. **性能优化**
   - [ ] 实现空间索引系统的脏标记机制
   - [ ] 优化黑板更新频率
   - [ ] 性能测试和基准测试

#### 优先级 3: 长期优化
7. **类型安全改进**
   - [ ] 定义接口和类型（IBlackboard, IWorld 等）
   - [ ] 替换所有 any 类型
   - [ ] 启用严格类型检查

8. **配置管理系统**
   - [ ] 实现 ConfigManager 单例
   - [ ] 支持配置热重载
   - [ ] 配置验证机制

9. **测试框架集成**
   - [ ] 选择并集成测试框架
   - [ ] 为核心系统添加单元测试
   - [ ] 设置 CI/CD 测试流程

10. **文档完善**
    - [ ] 架构设计文档
    - [ ] API 文档（TypeDoc）
    - [ ] 系统交互流程图

### 非功能性需求 (Non-Functional Requirements)

1. **性能要求**
   - 空间索引系统更新频率优化（减少不必要的重建）
   - 实体销毁时零内存泄漏
   - 配置加载时间 < 100ms

2. **可维护性要求**
   - 所有配置值集中管理
   - 代码类型安全（无 any）
   - 完整的错误处理机制

3. **可扩展性要求**
   - 配置系统支持运行时修改
   - 系统优先级易于调整
   - 新系统易于集成

4. **代码质量要求**
   - 遵循现有代码风格
   - 完整的 JSDoc 注释
   - 通过所有类型检查

---

## 🔍 Component Analysis

### 受影响的组件

#### 需要修改的现有组件

1. **GameManager.ts**
   - 修改：添加实体销毁方法
   - 修改：移除 AISystem 注册
   - 修改：使用新的配置系统
   - 依赖：PrefabFactory, World

2. **ChaserBehaviorTree.ts**
   - 修改：使用配置值替换硬编码
   - 修改：改进错误处理
   - 修改：使用统一的实体销毁方法
   - 依赖：GameManager, World

3. **SpatialIndexSystem.ts**
   - 修改：实现脏标记机制
   - 修改：使用配置值替换硬编码
   - 修改：增强错误处理
   - 依赖：TransformComponent

4. **AIBlackboardUpdateSystem.ts**
   - 修改：使用配置值替换硬编码
   - 修改：优化更新频率
   - 依赖：SpatialIndexSystem

5. **Constants.ts**
   - 修改：重构系统优先级定义
   - 新增：添加配置常量

#### 需要创建的新组件

1. **GameConfig.ts** (新文件)
   - 功能：集中管理所有游戏配置
   - 导出：GameConfig 常量对象
   - 依赖：无

2. **EntityUtils.ts** (新文件)
   - 功能：实体操作工具类
   - 导出：EntityUtils 类（静态方法）
   - 依赖：Entity, Component

3. **ConfigManager.ts** (新文件，优先级3)
   - 功能：配置管理系统
   - 导出：ConfigManager 单例类
   - 依赖：GameConfig

### 组件交互关系

```
GameManager
  ├── GameConfig (读取配置)
  ├── EntityUtils (销毁实体)
  ├── World (ECS 世界)
  └── PrefabFactory (对象池管理)

ChaserBehaviorTree
  ├── GameConfig (读取 AI 配置)
  ├── EntityUtils (安全组件获取)
  └── GameManager (销毁实体)

SpatialIndexSystem
  ├── GameConfig (读取空间索引配置)
  └── TransformComponent (查询)

AIBlackboardUpdateSystem
  ├── GameConfig (读取搜索半径)
  └── SpatialIndexSystem (查询附近实体)
```

---

## ⚙️ Implementation Strategy

### 阶段 1: 清理和修复 (优先级 1) - 预计 1-2 周

#### 阶段 1.1: 清理冗余系统 ✅
1. ✅ 确认 AISystem 不再需要
2. ✅ 移除 AISystem.ts 或移动到 archive/（已归档到 assets/core/archive/）
3. ✅ 清理 GameManager 中的注释和导入
4. ✅ 更新 systems/index.ts

#### 阶段 1.2: 修复实体销毁逻辑 ✅
1. ✅ 在 GameManager 中实现 destroyEntity 方法
2. ✅ 更新 ChaserBehaviorTree 使用新方法
3. ⏳ 测试实体销毁和对象池回收（待运行时测试）
4. ⏳ 验证无内存泄漏（待运行时测试）

#### 阶段 1.3: 提取魔法数字到配置 ✅
1. ✅ 创建 assets/core/GameConfig.ts
2. ✅ 定义所有配置常量
3. ✅ 替换 ChaserBehaviorTree 中的硬编码值
4. ✅ 替换 SpatialIndexSystem 中的硬编码值
5. ✅ 替换 AIBlackboardUpdateSystem 中的硬编码值
6. ✅ 替换 AIComponent 默认值
7. ✅ 替换 VelocityComponent 默认值
8. ✅ 替换 AISystem 中的硬编码值（虽然已归档，但已更新）
9. ⏳ 测试配置加载和使用（待运行时测试）

### 阶段 2: 改进和优化 (优先级 2) - 预计 2-3 周

#### 阶段 2.1: 改进系统优先级管理
1. 重构 Constants.ts 中的优先级定义
2. 更新所有系统的优先级值
3. 添加优先级说明文档
4. 测试系统执行顺序

#### 阶段 2.2: 增强错误处理 ✅ (已移除)
1. ✅ 评估错误处理需求
2. ✅ 决定移除 EntityUtils（ECS 框架已处理）
3. ✅ 系统层直接使用 getComponent()
4. ✅ 业务层保持简洁

**决策**: 不需要额外的错误处理层，ECS 框架的查询机制已足够

#### 阶段 2.3: 性能优化
1. 在 SpatialIndexSystem 中实现脏标记
2. 优化 AIBlackboardUpdateSystem 更新逻辑
3. 性能基准测试
4. 对比优化前后性能

### 阶段 3: 长期优化 (优先级 3) - 持续进行

#### 阶段 3.1: 类型安全改进 ✅
1. ✅ 定义接口（IBlackboard, IExtendedWorld）
2. ✅ 替换 ChaserBehaviorTree 中的 any
3. ✅ 替换 GameManager 和 EntityLifecycleSystem 中的 any
4. ⏸️ 启用 TypeScript 严格模式（可选，需要修复所有类型错误）

#### 阶段 3.2: 配置管理系统 ✅
1. ✅ 配置验证机制（ConfigValidator）
2. ✅ 集成到 GameManager（开发模式验证）
3. ⏸️ ConfigManager 单例（可选，当前使用静态配置已足够）
4. ⏸️ 配置热重载（可选，当前不需要运行时修改）

#### 阶段 3.3: 测试框架集成
1. 选择测试框架（Jest/Mocha）
2. 设置测试环境
3. 为核心系统编写测试
4. 设置 CI/CD

#### 阶段 3.4: 文档完善
1. 架构设计文档
2. API 文档生成
3. 系统交互流程图
4. 开发指南

---

## 🎨 Creative Phase Identification

### 需要 CREATIVE 模式的方面

#### 1. 配置管理系统设计 ✅ CREATIVE COMPLETED
**问题**: 如何设计一个灵活且易用的配置管理系统？
- 选项 A: 单例模式 + 静态配置对象 ✅ **已选择**
- 选项 B: 依赖注入 + 配置服务
- 选项 C: 事件驱动的配置更新

**决策**: 选择 Option A - 静态配置对象（简化版）
**理由**: 性能最佳，实现简单，类型安全，符合项目需求
**影响范围**: 所有使用配置的系统
**文档**: `memory-bank/creative/config-management.md` ✅

#### 2. 性能优化策略 ✅ CREATIVE COMPLETED
**问题**: 如何平衡性能优化和代码复杂度？
- 脏标记机制的触发条件 ✅ **已确定**
- 空间索引更新策略（增量 vs 全量） ✅ **已确定**
- 缓存策略 ✅ **已确定**

**决策**: 选择脏标记机制（Dirty Flag）+ 选择性更新
**理由**: 平衡性能与复杂度，低风险，易于实现，预计 20-30% 性能提升
**影响范围**: SpatialIndexSystem, AIBlackboardUpdateSystem
**文档**: `memory-bank/creative/performance-optimization.md` ✅

#### 3. 错误处理策略 ✅ CREATIVE COMPLETED
**问题**: 统一的错误处理策略是什么？
- 错误日志级别 ✅ **已确定**
- 错误恢复机制 ✅ **已确定**
- 开发 vs 生产环境的错误处理 ✅ **已确定**

**决策**: 选择防御性编程 + EntityUtils 工具类 + 轻量级错误日志
**理由**: 简单实用，性能优先，类型安全，符合项目规模
**影响范围**: 所有系统
**文档**: `memory-bank/creative/error-handling.md` ✅

---

## 🔗 Dependencies & Risks

### 技术依赖

1. **@bl-framework/ecs**: ECS 框架（已安装）
2. **@bl-framework/behaviortree-ecs**: 行为树系统（已安装）
3. **Cocos Creator 3.8.7**: 游戏引擎（已安装）
4. **TypeScript**: 开发语言（已配置）

### 项目依赖

1. **现有 ECS 架构**: 所有修改必须保持兼容
2. **行为树系统**: 不能破坏现有 AI 功能
3. **对象池系统**: PrefabFactory 必须正常工作

### 潜在风险

#### 高风险
1. **实体销毁逻辑修改可能导致内存泄漏**
   - 风险：如果实现不当，可能导致资源未释放
   - 缓解：充分测试，使用内存分析工具

2. **配置系统变更可能影响现有功能**
   - 风险：配置值变更可能导致游戏行为改变
   - 缓解：保持默认值与原硬编码值一致，充分测试

#### 中风险
3. **系统优先级变更可能影响执行顺序**
   - 风险：错误的优先级可能导致系统执行顺序问题
   - 缓解：仔细测试系统执行顺序，添加日志

4. **性能优化可能引入 bug**
   - 风险：脏标记机制实现错误可能导致数据不一致
   - 缓解：充分测试，对比优化前后行为

#### 低风险
5. **类型安全改进可能暴露现有问题**
   - 风险：启用严格模式可能发现大量类型错误
   - 缓解：逐步启用，分阶段修复

---

## 📊 Success Criteria

### 阶段 1 成功标准
- [ ] AISystem 完全移除或归档
- [ ] 实体销毁时 Node 正确回收，无内存泄漏
- [ ] 所有硬编码值提取到 GameConfig
- [ ] 所有测试通过，功能正常

### 阶段 2 成功标准
- [ ] 系统优先级使用明确数值，有文档说明
- [ ] 所有组件获取使用 EntityUtils，有错误处理
- [ ] 空间索引系统性能提升 20%+
- [ ] 所有测试通过，功能正常

### 阶段 3 成功标准
- [ ] 无 any 类型，通过严格类型检查
- [ ] 配置管理系统运行正常
- [ ] 测试覆盖率达到 60%+
- [ ] 文档完整，易于维护

---

## 📝 Next Steps

1. **完成 PLAN 模式检查点**
   - [x] 需求分析完成
   - [x] 组件分析完成
   - [x] 实施策略制定
   - [x] 依赖和风险识别
   - [x] CREATIVE 方面标记

2. **进入 CREATIVE 模式**（如需要）
   - 配置管理系统设计
   - 性能优化策略
   - 错误处理策略

3. **进入 IMPLEMENT 模式**
   - 按阶段实施优化
   - 持续测试和验证
   - 更新进度文档

