/* eslint-disable liangqingda-react/filename-naming-convention */
/**
 * CSS 独立学习路径；详细笔记位于 notes/，不依赖 Demo 清单。
 */
export const learningPath = {
  label: 'CSS',
  description:
    '从 HTML 基础出发，掌握样式计算、尺寸与布局、响应式设计和可维护样式，最终独立完成跨屏页面。',
  steps: [
    {
      id: 'css-curriculum-syntax',
      kind: 'concept',
      title: '语法、选择器与开发工具',
      summary: '会把样式应用到正确的元素，并定位规则来自哪里。',
      contentFile: 'notes/syntax.md',
    },
    {
      id: 'css-curriculum-cascade',
      kind: 'concept',
      title: '层叠、优先级与继承',
      summary: '理解多条声明如何产生最终样式。',
      contentFile: 'notes/cascade.md',
    },
    {
      id: 'css-curriculum-sizing',
      kind: 'concept',
      title: '盒模型、单位与尺寸计算',
      summary: '能推导元素占用空间，处理内容溢出。',
      contentFile: 'notes/sizing.md',
    },
    {
      id: 'css-curriculum-flow',
      kind: 'concept',
      title: '正常流、定位与层叠上下文',
      summary: '理解元素如何参与布局与覆盖。',
      contentFile: 'notes/flow.md',
    },
    {
      id: 'css-curriculum-flex-grid',
      kind: 'concept',
      title: 'Flexbox 与 Grid 布局',
      summary: '按一维或二维关系选择布局工具。',
      contentFile: 'notes/flex-grid.md',
    },
    {
      id: 'css-curriculum-responsive',
      kind: 'concept',
      title: '响应式、排版与可访问性',
      summary: '让内容适配不同空间与用户偏好。',
      contentFile: 'notes/responsive.md',
    },
    {
      id: 'css-curriculum-motion-maintenance',
      kind: 'concept',
      title: '动画、组织方式与性能排查',
      summary: '在可维护性和性能约束下添加表现。',
      contentFile: 'notes/motion-maintenance.md',
    },
    {
      id: 'css-curriculum-project',
      kind: 'lab',
      title: '综合实践：跨屏内容页面',
      summary: '把样式机制整合成可复用、可调试的页面。',
      contentFile: 'notes/project.md',
    },
  ],
} as const;
