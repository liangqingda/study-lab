/* eslint-disable liangqingda-react/filename-naming-convention */
/**
 * Redis 独立学习路径；详细笔记位于 notes/，不依赖 Demo 清单。
 */
export const learningPath = {
  label: 'Redis',
  description:
    '从数据结构与过期语义出发，学习原子操作、缓存设计、持久化、高可用和性能边界，最后设计可失败恢复的应用方案。',
  steps: [
    {
      id: 'redis-curriculum-model',
      kind: 'concept',
      title: '键空间、命令与过期语义',
      summary: '理解 Redis 的数据组织与使用边界。',
      contentFile: 'notes/model.md',
    },
    {
      id: 'redis-curriculum-structures',
      kind: 'concept',
      title: '核心数据结构与场景选择',
      summary: '按访问模式选择结构并估算复杂度。',
      contentFile: 'notes/structures.md',
    },
    {
      id: 'redis-curriculum-atomicity',
      kind: 'concept',
      title: '原子命令、流水线与脚本',
      summary: '区分减少往返与保证并发正确性。',
      contentFile: 'notes/atomicity.md',
    },
    {
      id: 'redis-curriculum-caching',
      kind: 'concept',
      title: '缓存模式、一致性与故障策略',
      summary: '把命中率优化和数据正确性分开设计。',
      contentFile: 'notes/caching.md',
    },
    {
      id: 'redis-curriculum-coordination',
      kind: 'concept',
      title: '限流、锁与消息处理',
      summary: '明确协调原语在失败和重试时的边界。',
      contentFile: 'notes/coordination.md',
    },
    {
      id: 'redis-curriculum-durability',
      kind: 'concept',
      title: 'RDB、AOF 与故障恢复',
      summary: '根据恢复目标选择持久化策略。',
      contentFile: 'notes/durability.md',
    },
    {
      id: 'redis-curriculum-scaling',
      kind: 'concept',
      title: '复制、Sentinel、Cluster 与性能',
      summary: '理解高可用和水平分片解决的不同问题。',
      contentFile: 'notes/scaling.md',
    },
    {
      id: 'redis-curriculum-project',
      kind: 'lab',
      title: '综合实践：设计可降级缓存服务',
      summary: '从业务需求验证数据、并发与运维方案。',
      contentFile: 'notes/project.md',
    },
  ],
} as const;
