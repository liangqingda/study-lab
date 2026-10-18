## 1. 从“宽度写了多少”到“实际占了多少”

CSS 的 `width` 不总是可见边框的宽度。页面由盒子组成，盒子从内到外有 content（内容）、padding（内边距）、border（边框）、margin（外边距）。**盒模型**描述这些尺寸如何组合；`box-sizing` 决定指定尺寸约束的是哪部分。

先熟悉四则运算与浏览器 Elements 的盒模型面板。本节所有数字以没有缩放和变换、普通水平布局为前提，浏览器的子像素计算可能产生小数。

## 2. 两种尺寸语义与计算

| 设置          | `width: 200px; padding: 20px; border: 2px solid` 的边框盒宽度 |
| ------------- | ------------------------------------------------------------- |
| `content-box` | 200 + 20×2 + 2×2 = 244px                                      |
| `border-box`  | 200px，内容区剩 156px                                         |

margin 不计入两种 width。`border-box` 不是“所有空间都包含”；当 padding 与 border 合计超过指定尺寸时，内容区不能变成负数，实际盒子仍可能超过指定 width。

百分比的参照取决于属性。普通块的百分比宽度通常参照包含块内容宽度；百分比高度通常需要可确定的参照高度。`em` 在 font-size 上相对父级字体大小，在许多其他属性上相对自身计算字体大小；`rem` 相对根元素字体大小。`vw`/`vh` 相对视口，但移动浏览器工具栏会影响可见空间，可按需求使用 `dvh` 等单位并测试。

## 3. 完整实验：算数、溢出和修复

先预测：蓝框和红框各多宽？长链接为什么能把内容撑出去？保存为 `sizing.html` 后打开：

```html
<!doctype html>
<meta charset="utf-8" />
<title>盒模型</title>
<style>
  body {
    font: 16px/1.5 sans-serif;
  }
  .host {
    width: 260px;
    border: 1px dashed #555;
  }
  .box {
    width: 200px;
    padding: 20px;
    border: 2px solid #1864ab;
    margin: 10px;
  }
  .border {
    box-sizing: border-box;
    border-color: #c92a2a;
  }
  .fluid {
    max-width: 100%;
    overflow-wrap: anywhere;
  }
  img {
    display: block;
    max-width: 100%;
    height: auto;
  }
</style>
<div class="host">
  <div class="box">content-box</div>
  <div class="box border">border-box</div>
  <p class="fluid">averyveryveryveryveryveryverylongunbrokenword.example</p>
</div>
<script>
  console.table(
    [...document.querySelectorAll('.box')].map((el) => ({
      text: el.textContent,
      borderWidth: el.getBoundingClientRect().width,
    })),
  );
</script>
```

控制台预期边框宽度分别为 244 和 200；蓝框的水平外部占用加 margin 后为 264，大于父级 260，所以会溢出。`overflow-wrap: anywhere` 允许长词在必要处断开，解决的是不可断内容的问题，不会改变已经超宽的盒模型。

## 4. 自适应尺寸不是只用百分比

`max-width` 给上界，`min-width` 给下界。它们与布局算法共同决定最终尺寸；例如最小宽度可以让元素无法继续收缩。`clamp(16px, 2vw, 24px)` 表示偏好中间值，但保持在两端之间；它不能代替测试缩放和阅读体验。

**固有尺寸**是内容自身提供的尺寸信息，例如图片天然宽高、文本最窄可断宽度。`min-content` 接近所有可断处都断开后的最小内容宽度，`max-content` 接近不做软换行的宽度；它们不是固定像素值。

Flex 项目的 `min-width: auto` 可能保留内容最小尺寸。若确实希望文本在剩余空间中收缩，常需 `min-width: 0`，再明确换行、截断或滚动策略。仅对外层设置 `width:100%` 不一定解除这层约束。

## 5. 错误驱动：用 hidden 掩盖溢出

错误版本是给整个页面加 `overflow-x:hidden`，此时页面看似整齐，按钮或正文却可能被裁掉。先检查谁超出了包含块，再分别修复盒模型、长词、图片和最小尺寸。只有产品确实需要裁切的区域才使用裁切；代码块通常应该局部水平滚动。

排查时记录元素的 CSS width、开发工具盒模型和 `getBoundingClientRect().width`。最后一个包含边框并会受 transform 影响，不等同于单纯的声明值；不要拿三种数字不加区分地比较。

## 6. 常用模式与边界

常见全局基础规则是 `*, *::before, *::after { box-sizing:border-box; }`，但引入旧组件时要检查它是否依赖 content-box。响应式图片用最大宽度和自动高度保持比例；只写固定宽高可能拉伸。正文宽度可按 `ch` 约束行长，但 ch 是字形度量，不能保证恰好容纳固定数量的汉字。

## 7. 练习与验收

1. 将实验父容器改成 220px，分别修复两种盒子的溢出；验收必须提供修改前后的宽度算式。
2. 给一个 Flex 文本项目放长 URL，比较设置 `min-width:0` 前后。提示：先看最小尺寸；验收能解释为什么父级有宽度仍会溢出。
3. 用 `clamp()` 制作标题字号，测试窄屏与 200% 缩放。验收时正文与按钮不能因缩放被裁切。

## 8. 资料链接

- [MDN：盒模型](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model)
- [MDN：box-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing)
- [MDN：CSS 值和单位](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Values_and_units)
