## 1. 响应式是内容对空间的适应

响应式设计不只是给手机写一份 CSS，而是让内容在可用空间、输入方式、缩放与用户偏好变化后仍能使用。断点应出现在布局无法继续良好容纳内容的地方，不是看到设备名称就填一个固定数字。

前置知识是 Flex/Grid 与相对单位。示例适合支持容器查询的现代浏览器；对旧浏览器，应先确保基础单列可用，再渐进增强。

## 2. 视口、容器与用户偏好

| 机制            | 参照对象             | 适合的问题                             |
| --------------- | -------------------- | -------------------------------------- |
| media query     | 视口或环境特征       | 整页导航在窄屏换行                     |
| container query | 有查询能力的祖先容器 | 同一张卡片放在侧栏和主体时改变内部结构 |
| 流式尺寸        | 可用空间及上下界     | 正文宽度、图片与字号平滑变化           |
| 用户偏好查询    | 系统或用户设置       | 减少动画、暗色方案等                   |

`container-type:inline-size` 允许后代根据该容器内联方向尺寸查询；查询影响的是后代，不是让容器直接根据自己的查询规则反复修改自身。`prefers-reduced-motion` 表示用户偏好减少动态效果，不表示所有视觉反馈都应消失。

## 3. 完整实验：可复用的信息卡

先预测：同一张卡片放入 300px 与 700px 的父区域，是否可以不依赖视口大小就切换布局？

保存为 `responsive.html`，拖动浏览器宽度，并用开发工具修改宿主宽度：

```html
<!doctype html>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>响应式实验</title>
<style>
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    padding: 16px;
    font: 1rem/1.7 sans-serif;
  }
  .host {
    container-type: inline-size;
    max-width: 900px;
    margin: auto;
  }
  .card {
    display: grid;
    gap: 16px;
    border: 1px solid #777;
    padding: 16px;
  }
  .cover {
    min-height: 100px;
    background: #d0ebff;
  }
  h1 {
    font-size: clamp(1.5rem, 3vw, 2.5rem);
  }
  p {
    max-width: 65ch;
  }
  a:focus-visible {
    outline: 3px solid #1864ab;
    outline-offset: 3px;
  }
  @container (min-width: 500px) {
    .card {
      grid-template-columns: 160px minmax(0, 1fr);
    }
  }
  @media (prefers-reduced-motion: no-preference) {
    .card {
      transition: background-color 0.2s;
    }
  }
  .card:hover {
    background: #f1f3f5;
  }
</style>
<div class="host">
  <article class="card">
    <div class="cover" aria-hidden="true"></div>
    <div>
      <h1>可以缩放的内容</h1>
      <p>在窄屏、放大文字和键盘操作时，都应该能理解并使用。</p>
      <a href="#next">继续阅读</a>
    </div>
  </article>
</div>
```

容器窄于 500px 时内容单列；达到断点后成为两列。viewport meta 让移动设备按设备宽度布局，而非使用一个较宽的虚拟布局视口再缩小。用户仍应可以缩放，不设置 `user-scalable=no`。

## 4. 一张真正有用的检查表

| 条件           | 操作               | 通过标准                             |
| -------------- | ------------------ | ------------------------------------ |
| 320px 可用宽度 | 缩窄页面           | 主要内容不被裁切；代码表格可局部滚动 |
| 200% 缩放      | 浏览器放大         | 可读、可操作，不靠固定高度截断文字   |
| 键盘           | 连按 Tab 与 Enter  | 焦点可见，顺序合理，目标可激活       |
| 减少动态效果   | 模拟用户偏好       | 动画减少，状态信息仍然存在           |
| 长文本与多语言 | 替换标题和按钮文本 | 不重叠，不用省略号隐藏唯一关键说明   |

正文对比度、字号、行距和点击目标空间同样重要。不能只用红绿颜色区分错误/成功，应提供文本、图标或其他冗余标记。视觉隐藏的内容是否仍在辅助技术中可见，取决于具体隐藏方式。

## 5. 常见错误与边界

把所有尺寸改为 vw，会使小屏文字过小、大屏文字过大；使用 rem 和上下界控制，并测试缩放。`height:100vh` 也可能在移动地址栏变化时造成裁切；按需求使用最小高度、动态视口单位或让内容自然撑开。

容器查询不是媒体查询的全量替代，容器本身也需要明确的尺寸约束。只在支持时增强布局，基础单列必须能独立工作。断点处的溢出若来自不可断文本，应先修复内容约束，而不是不断新增断点。

## 6. 练习与验收

1. 将实验卡片同时放入主体与窄侧栏。验收两个实例能在同一视口下呈现不同内部布局。
2. 增加一个错误状态，验收在灰度截图中仍能理解错误含义。
3. 制作键盘与缩放测试记录，至少列出一个失败现象、定位依据和修复后结果。

## 7. 资料链接

- [MDN：响应式设计](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design)
- [MDN：容器查询](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
- [MDN：prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
