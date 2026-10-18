## 1. 一维关系和二维关系

Flexbox 以一条主轴分配空间，换行后每条 Flex 行各自分配；Grid 同时定义行列轨道，适合跨行对齐。二者不是互斥：页面可用 Grid 分栏，卡片内部用 Flex 排按钮。

前置要求是理解盒模型与正常流。本节在现代浏览器运行。重点不是背所有属性，而是先回答“空间由谁提供、谁可以伸缩、需要对齐哪些关系”。

## 2. 术语与关键算法

| 术语              | 解释                                             | 示例结果                                    |
| ----------------- | ------------------------------------------------ | ------------------------------------------- |
| 主轴/交叉轴       | 由 flex-direction 决定的排列方向及其垂直方向     | row 下 justify-content 沿行方向分配剩余空间 |
| basis/grow/shrink | 初始主轴尺寸、正剩余空间增长因子、负空间收缩因子 | basis 不等于最终宽度                        |
| 轨道 track        | Grid 的一行或一列                                | `1fr 2fr` 按可分配空间比例建立两列          |
| gap               | 项目之间的间距                                   | 不在容器两端自动加间距                      |
| minmax            | 轨道下限与上限                                   | `minmax(0,1fr)` 允许轨道最小值为零          |

Flex 收缩不是简单地按 shrink 数字平分：还要结合基础尺寸和最小/最大约束。Grid 的 fr 分配也受固定轨道、gap 和最小内容尺寸约束，不能把 `1fr 1fr` 永远理解为各占容器宽度一半。

## 3. 完整实验：工具栏与卡片列表

先预测：窄屏时长标题会挤出按钮吗？删除 `min-width:0` 与 `overflow-wrap:anywhere` 试试。

保存为 `layout.html` 并打开：

```html
<!doctype html>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Flex 与 Grid</title>
<style>
  * {
    box-sizing: border-box;
  }
  body {
    margin: 20px;
    font: 16px/1.5 sans-serif;
  }
  .toolbar {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  .title {
    flex: 1 1 160px;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .toolbar button {
    flex: 0 0 auto;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
    gap: 16px;
  }
  article {
    padding: 16px;
    border: 1px solid #777;
    overflow-wrap: anywhere;
  }
</style>
<header class="toolbar">
  <h1 class="title">averyveryveryveryverylongtitle</h1>
  <button type="button">新增</button>
</header>
<main class="cards">
  <article>短卡片</article>
  <article>内容更长的卡片，观察同行高度。</article>
  <article>第三项</article>
  <article>第四项</article>
</main>
```

| 宽度变化   | 预期结果                       | 决定因素                                    |
| ---------- | ------------------------------ | ------------------------------------------- |
| 足够宽     | 卡片多列，工具栏标题占剩余空间 | Grid 自动填入可容纳轨道；标题 grow 为 1     |
| 逐渐缩窄   | 卡片减少列数                   | 每列偏好最小 220px，加上 gap 后判断能放几列 |
| 小于 220px | 单列随容器继续缩小             | `min(100%,220px)` 避免固定下限撑破容器      |
| 标题很长   | 标题可缩并换行，按钮仍可见     | 解除自动最小尺寸并允许长词断行              |

## 4. 两种布局各自怎样对齐

Flex 的 `align-items` 调整交叉轴上单个项目，`align-content` 在存在多条行且有额外交叉轴空间时分配行；只有一条行时不能靠 align-content 期待项目垂直居中。Grid 中也有 items 和 content，但分别作用于项目与整个轨道集合。

`auto-fit` 会在适用情况下折叠空轨道，`auto-fill` 保留能容纳的空轨道。因此卡片很少时二者可能有不同宽度。跨两列可用 `grid-column:span 2`，但窄屏应重新评估，不能让一个跨度强行制造额外列。

## 5. 失败案例与修复

错误写法是两列各 `width:50%` 再加 gap。总宽超过 100%，产生溢出。用 Grid 的 `repeat(2,minmax(0,1fr))` 或 Flex 的增长分配，让布局算法扣除 gap 后分配剩余空间。

另一个错误是用 `order` 大幅改变阅读顺序。视觉顺序与 DOM 顺序分离后，Tab 焦点和读屏可能显得跳跃。正确做法优先让 HTML 本身具有合理阅读顺序，布局只改变表现。

## 6. 练习与验收

1. 把卡片改为始终两列，窄于 500px 改为一列。提示：媒体查询；验收任意列内长词都不撑出水平滚动。
2. 在工具栏增加搜索输入与按钮组。验收注明哪个项目增长、哪个收缩、窄屏选择换行还是隐藏次要功能。
3. 用 Flex 和 Grid 各完成三张不同高度卡片，说明每行独立分配与跨行列对齐的区别，提供截图证据。

复习时先画轴与轨道，再写属性；判断问题是“剩余空间分配”还是“内容最小尺寸约束”。

## 7. 资料链接

- [MDN：Flexbox 基础](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox)
- [MDN：Grid 基础](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Basic_concepts_of_grid_layout)
