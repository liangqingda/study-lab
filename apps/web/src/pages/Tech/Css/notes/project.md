## 1. 综合任务：从空文件交付跨屏内容页

本任务不是复刻某个现有 Demo，而是用前七节的方法独立完成一页文章列表：有标题、导航、筛选按钮和卡片；宽屏多列，窄屏单列；键盘可操作，长文本不溢出。

**验收对象是内容与交互是否稳健**，不是是否使用了所有学过的属性。先写语义 HTML，再设置布局，最后考虑表现增强。

## 2. 先做结构与约束设计

| 区域         | 结构职责           | 布局选择与理由                     |
| ------------ | ------------------ | ---------------------------------- |
| header/nav   | 页面标题与位置入口 | Flex 可换行，避免长菜单互相覆盖    |
| filters      | 表达用户筛选状态   | 原生 button，aria-pressed 表达状态 |
| main/article | 独立内容项目       | Grid 维护跨行列关系                |
| status       | 解释结果数量       | 文本反馈，避免只有颜色变化         |

前置知识包括选择器、层叠、盒模型、正常流、Flex/Grid、响应式与基础 JS。这里的筛选操作仅作用于本页样例数据，不包含服务端搜索、分页与路由。

## 3. 完整可运行基线

先预测：点击“CSS”后哪些卡片被隐藏？隐藏后键盘还能聚焦卡片链接吗？保存为 `project.html`：

```html
<!doctype html>
<html lang="zh-CN">
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>技术文章</title>
  <style>
    * {
      box-sizing: border-box;
    }
    :root {
      --line: #adb5bd;
      --ink: #212529;
    }
    body {
      margin: 0;
      padding: 24px;
      color: var(--ink);
      font: 16px/1.6 sans-serif;
    }
    .shell {
      max-width: 1000px;
      margin: auto;
    }
    header,
    nav,
    .filters {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    header {
      justify-content: space-between;
    }
    button {
      font: inherit;
      padding: 8px 16px;
    }
    button[aria-pressed='true'] {
      background: #d3f9d8;
      border: 2px solid #087f5b;
    }
    :focus-visible {
      outline: 3px solid #1864ab;
      outline-offset: 3px;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
      gap: 16px;
    }
    article {
      border: 1px solid var(--line);
      padding: 16px;
      overflow-wrap: anywhere;
    }
    [hidden] {
      display: none;
    }
  </style>
  <div class="shell">
    <header>
      <h1>技术文章</h1>
      <nav aria-label="页面导航">
        <a href="#content">浏览文章</a><a href="#filters">筛选</a>
      </nav>
    </header>
    <div id="filters" class="filters" role="group" aria-label="分类筛选">
      <button type="button" data-filter="all" aria-pressed="true">全部</button>
      <button type="button" data-filter="css" aria-pressed="false">CSS</button>
    </div>
    <p id="status" role="status">共 3 篇</p>
    <main id="content" class="cards">
      <article data-topic="css">
        <h2><a href="#content">理解盒模型</a></h2>
        <p>从尺寸推导开始学习布局。</p>
      </article>
      <article data-topic="http">
        <h2><a href="#content">理解缓存</a></h2>
        <p>从一次条件请求开始。</p>
      </article>
      <article data-topic="css">
        <h2><a href="#content">长标题averyveryverylongword</a></h2>
        <p>用内容压力测试而不是只看短文案。</p>
      </article>
    </main>
  </div>
  <script>
    const buttons = [...document.querySelectorAll('[data-filter]')];
    const cards = [...document.querySelectorAll('[data-topic]')];
    for (const button of buttons)
      button.addEventListener('click', () => {
        const filter = button.dataset.filter;
        for (const item of buttons)
          item.setAttribute('aria-pressed', String(item === button));
        for (const card of cards)
          card.hidden = filter !== 'all' && card.dataset.topic !== filter;
        document.querySelector('#status').textContent =
          `共 ${cards.filter((card) => !card.hidden).length} 篇`;
      });
  </script>
</html>
```

## 4. 运行结果与设计解释

| 场景         | 预期结果                                 | 说明                             |
| ------------ | ---------------------------------------- | -------------------------------- |
| 初始         | 3 篇文章，全部处于按下状态               | 初始 DOM 与状态说明一致          |
| 点击 CSS     | 2 篇，HTTP 卡片不产生布局盒              | hidden 不只是视觉透明            |
| 缩窄到 320px | 单列，按钮可换行                         | 轨道下限不会超过 100% 宽度       |
| 键盘操作     | 焦点清晰，隐藏卡片链接不进入正常焦点序列 | 原生元素配合 hidden 提供基础行为 |

示例的链接使用页内占位锚点，是布局实验而不是完整站点导航；正式页面应指向真实文章。筛选后不强制把焦点移到列表，避免打断连续筛选。

## 5. 故障注入与排查

把 `[hidden]` 改为 `opacity:0`：卡片仍占位，内部链接仍可能被键盘访问。恢复 hidden 或实现完整的隐藏/交互管理策略。把 Grid 轨道改成固定 400px：窄屏产生溢出，应从尺寸约束修复，而不是全局隐藏横向内容。

若新增样式让筛选状态不可辨，使用开发工具查获胜规则，记录来源、层、优先级和顺序。布局和交互分开验证，不能把“截图看起来正确”当作全部验收。

## 6. 练习与交付标准

1. 增加 HTTP 筛选与空结果状态。验收按钮状态、计数和实际可见文章必须一致。
2. 提交 320px、768px、1440px 与 200% 缩放记录，长标题、中文和英文均不裁切关键内容。
3. 添加一个可访问的详情展开区域，尊重减少动态效果偏好。验收键盘、状态文本与视觉表现一致。
4. 写一份排错复盘：原始现象、证据、原因、修复与回归条件。必须至少包含一次层叠问题和一次尺寸问题。

## 7. 资料链接

- [MDN：CSS 学习课程](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics)
- [MDN：响应式设计](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design)
