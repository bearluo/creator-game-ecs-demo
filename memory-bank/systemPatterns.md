# Memory Bank: System Patterns

## Architecture Patterns
- ECS架构（Entity-Component-System）
- 行为树模式用于AI决策

## Design Patterns
- 行为树模式：将AI逻辑从硬编码转换为可配置的行为树
- 系统优先级模式：通过ECS_SYSTEM_PRIORITYS控制系统执行顺序

## Code Patterns
- 系统注册顺序：初始化系统 → 数据更新系统 → 执行系统 → 渲染系统
- 行为树构建：使用BehaviorTreeBuilder链式API构建行为树
- 黑板模式：使用Blackboard存储AI决策所需的数据

## Best Practices
- 系统按优先级顺序注册和执行
- 行为树初始化在实体创建后自动完成
- 黑板数据在每帧更新，确保AI决策基于最新信息

