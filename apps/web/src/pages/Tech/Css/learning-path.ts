/* eslint-disable liangqingda-react/filename-naming-convention */
/**
 * CSS 独立技术学习大纲；阶段由知识依赖与能力目标设计，与 Demo 清单无关联。
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
      content:
        '## 学习目标\n\n会把样式应用到正确的元素，并定位规则来自哪里。\n\n## 前置知识\n\n已具备该技术所需的入门背景。\n\n## 核心知识与学习顺序\n\n1. CSS 用选择器匹配元素，再通过属性和值描述表现；先熟悉类、属性、组合选择器及状态伪类。\n\n2. 在开发工具中区分作者规则、浏览器默认样式与计算后的值；被划掉的声明没有赢得样式竞争。\n\n## 独立练习\n\n为一个包含标题、列表、链接的 HTML 页面编写样式，并给键盘焦点提供可见反馈。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n能解释每条规则匹配哪些元素；不通过反复添加 !important 掩盖冲突。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[CSS 官方学习资料](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics)\n',
    },
    {
      id: 'css-curriculum-cascade',
      kind: 'concept',
      title: '层叠、优先级与继承',
      summary: '理解多条声明如何产生最终样式。',
      content:
        '## 学习目标\n\n理解多条声明如何产生最终样式。\n\n## 前置知识\n\n先完成「语法、选择器与开发工具」，或能说明该阶段的验收要求。\n\n## 核心知识与学习顺序\n\n1. 层叠先比较来源、重要性和层，再比较选择器优先级、作用域接近度与出现顺序；不能只数 ID。\n\n2. 继承是部分属性从父元素获得默认值的机制；字体常继承，盒子尺寸通常不继承。理解 inherit、initial、unset 与自定义属性。\n\n## 独立练习\n\n为同一段文本设计三条冲突规则，先预测颜色，再用开发工具核对并移除不必要的优先级。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n能说明获胜规则的原因，区分继承值与直接命中的声明。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[CSS 官方学习资料](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics)\n',
    },
    {
      id: 'css-curriculum-sizing',
      kind: 'concept',
      title: '盒模型、单位与尺寸计算',
      summary: '能推导元素占用空间，处理内容溢出。',
      content:
        '## 学习目标\n\n能推导元素占用空间，处理内容溢出。\n\n## 前置知识\n\n先完成「层叠、优先级与继承」，或能说明该阶段的验收要求。\n\n## 核心知识与学习顺序\n\n1. 盒模型由内容、内边距、边框和外边距组成；box-sizing 决定 width 约束哪部分。\n\n2. 掌握 px、百分比、em、rem、视口单位和 min/max/clamp；百分比需要结合具体属性与包含块解释。了解 intrinsic size 与 overflow。\n\n## 独立练习\n\n制作固定宽度容器，在其中放置长单词、图片和输入框，比较 content-box 与 border-box。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n可算出占用宽度，并解释为什么发生溢出；在不截断重要内容的前提下修复。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[CSS 官方学习资料](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics)\n',
    },
    {
      id: 'css-curriculum-flow',
      kind: 'concept',
      title: '正常流、定位与层叠上下文',
      summary: '理解元素如何参与布局与覆盖。',
      content:
        '## 学习目标\n\n理解元素如何参与布局与覆盖。\n\n## 前置知识\n\n先完成「盒模型、单位与尺寸计算」，或能说明该阶段的验收要求。\n\n## 核心知识与学习顺序\n\n1. 正常流中块级和行内格式化影响尺寸与排列；display 决定外部参与方式与内部布局。\n\n2. relative、absolute、fixed、sticky 的参照和占位不同；z-index 的比较受层叠上下文约束，数值大不保证覆盖所有元素。\n\n## 独立练习\n\n实现带角标的卡片和可粘附的小标题，记录每个定位元素的参照物与滚动边界。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n能解释定位后是否占位，遇到遮挡能找到所属层叠上下文。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[CSS 官方学习资料](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics)\n',
    },
    {
      id: 'css-curriculum-flex-grid',
      kind: 'concept',
      title: 'Flexbox 与 Grid 布局',
      summary: '按一维或二维关系选择布局工具。',
      content:
        '## 学习目标\n\n按一维或二维关系选择布局工具。\n\n## 前置知识\n\n先完成「正常流、定位与层叠上下文」，或能说明该阶段的验收要求。\n\n## 核心知识与学习顺序\n\n1. Flexbox 处理主轴和交叉轴上的空间分配，学习 basis、grow、shrink、换行及 min-width 对收缩的影响。\n\n2. Grid 用行列轨道与网格区域组织二维布局，掌握 fr、minmax、gap 和自动布局；对齐能力不等同于定位。\n\n## 独立练习\n\n分别用 Flex 制作工具栏、用 Grid 制作卡片列表；添加长标题和不同数量的项目。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n能解释两种布局的选择依据，内容变化时没有意外溢出或重叠。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[CSS 官方学习资料](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics)\n',
    },
    {
      id: 'css-curriculum-responsive',
      kind: 'concept',
      title: '响应式、排版与可访问性',
      summary: '让内容适配不同空间与用户偏好。',
      content:
        '## 学习目标\n\n让内容适配不同空间与用户偏好。\n\n## 前置知识\n\n先完成「Flexbox 与 Grid 布局」，或能说明该阶段的验收要求。\n\n## 核心知识与学习顺序\n\n1. 使用流式尺寸和媒体查询响应视口变化，使用容器查询响应组件可用空间；断点由内容需求决定。\n\n2. 排版需要兼顾行长、行高与可缩放性；保留焦点、减少动态效果偏好，并避免仅靠颜色传达状态。\n\n## 独立练习\n\n将同一页面适配窄屏与宽屏，测试长文本、200% 缩放和纯键盘操作。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n关键内容可读、可操作；不通过整体缩小文字解决空间不足。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[CSS 官方学习资料](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics)\n',
    },
    {
      id: 'css-curriculum-motion-maintenance',
      kind: 'concept',
      title: '动画、组织方式与性能排查',
      summary: '在可维护性和性能约束下添加表现。',
      content:
        '## 学习目标\n\n在可维护性和性能约束下添加表现。\n\n## 前置知识\n\n先完成「响应式、排版与可访问性」，或能说明该阶段的验收要求。\n\n## 核心知识与学习顺序\n\n1. 区分 transition 的状态过渡与 keyframes 的时间序列，优先评估 transform、opacity，但仍需实测合成与绘制成本。\n\n2. 用自定义属性表达设计变量，用明确的组件边界管理选择器；理解重排、绘制、合成，并通过性能工具观察而非猜测。\n\n## 独立练习\n\n为可展开面板设计减少动态效果的替代方案，并整理重复的颜色、间距与状态规则。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n能解释动画属性的代价，关闭动画后信息与操作仍完整。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[CSS 官方学习资料](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics)\n',
    },
    {
      id: 'css-curriculum-project',
      kind: 'lab',
      title: '综合实践：跨屏内容页面',
      summary: '把样式机制整合成可复用、可调试的页面。',
      content:
        '## 学习目标\n\n把样式机制整合成可复用、可调试的页面。\n\n## 前置知识\n\n先完成「动画、组织方式与性能排查」，或能说明该阶段的验收要求。\n\n## 核心知识与学习顺序\n\n1. 先确认语义 HTML 与内容层级，再建立排版、间距和组件状态，最后选择布局与断点。\n\n2. 复盘覆盖规则、布局参照、溢出、焦点与性能；解决原因后再提取公共样式，避免过早抽象。\n\n## 独立练习\n\n从空白 HTML 完成带导航、筛选和卡片列表的页面，不依赖现成 Demo 页面。\n\n先预测行为或画出执行过程，再用自己编写的最小例子核对。\n\n## 验收标准\n\n提供宽窄屏截图、键盘操作记录和一份样式问题定位说明。\n\n尝试不看资料复述机制，并解释一个反例；能完成练习并说明结果原因后，再主动标记完成。\n\n## 延伸阅读\n\n[CSS 官方学习资料](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics)\n',
    },
  ],
} as const;
