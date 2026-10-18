## 1. 先理解默认排列，再选择定位

正常流是浏览器在没有额外定位要求时排列内容的方式。块级盒通常沿块方向排列，行内内容在行框中排布；“块方向”取决于书写模式，不一定永远是屏幕竖直方向。掌握正常流，才能判断为什么加了 absolute 后父元素高度突然塌掉。

`display` 可以描述外部参与方式和内部布局方式。例如 `inline-flex` 对外像行内级盒，对内使用 Flex；`display:none` 不产生布局盒，而 `visibility:hidden` 通常保留布局空间。本节用普通横排文档解释。

## 2. 定位术语对照

| 定位方式 | 是否保留正常流占位 | 参照与典型用途                                                      |
| -------- | ------------------ | ------------------------------------------------------------------- |
| static   | 是                 | 默认位置；top/left 不用于位移                                       |
| relative | 是                 | 相对自身原位置偏移；可为后代提供定位包含块                          |
| absolute | 否                 | 相对定位包含块；常由最近非 static 祖先建立，但 transform 等也可建立 |
| fixed    | 否                 | 通常相对视口；某些变换祖先会改变包含块                              |
| sticky   | 是                 | 在滚动约束内粘附；需要 top 等阈值及足够滚动空间                     |

**包含块**是百分比尺寸和定位参照的重要区域，不等同于“父元素”；**层叠上下文**是绘制覆盖时的局部排序边界，也不等同于包含块。

## 3. 完整实验：角标为什么跟着卡片

先预测：去掉 `.card` 的 relative 后，角标会在哪里？保存为 `position.html`：

```html
<!doctype html>
<meta charset="utf-8" />
<title>定位与层叠</title>
<style>
  body {
    font: 16px/1.6 sans-serif;
    margin: 24px;
  }
  .scroll {
    height: 240px;
    overflow: auto;
    border: 1px solid #777;
  }
  .heading {
    position: sticky;
    top: 0;
    background: white;
    margin: 0;
  }
  .card {
    position: relative;
    padding: 32px;
    margin: 24px;
    border: 1px solid teal;
  }
  .badge {
    position: absolute;
    right: 0;
    top: 0;
    background: #d3f9d8;
  }
  .space {
    height: 500px;
    background: #f1f3f5;
  }
</style>
<div class="scroll">
  <h2 class="heading">可粘附标题</h2>
  <article class="card">正常流中的内容<span class="badge">NEW</span></article>
  <div class="space">继续滚动</div>
</div>
```

| 操作               | 预期现象                 | 机制                                  |
| ------------------ | ------------------------ | ------------------------------------- |
| 滚动内层容器       | 标题在容器顶部粘附       | scroll 容器和 top 阈值共同约束 sticky |
| 增加卡片内容       | 卡片变高，角标仍在右上   | 正常流内容撑开父盒，absolute 不占位   |
| 移除卡片 relative  | 角标不再以卡片为参照     | 向外寻找定位包含块                    |
| 移除 sticky 的 top | 标题通常不再产生预期粘附 | 缺少该轴上的非 auto 阈值              |

## 4. z-index 为什么不是越大越在前

层叠上下文可以由根元素、特定定位配合 z-index、transform、opacity 小于 1 等条件建立。子元素只能在所属上下文内部排序。把它的 z-index 从 10 改成 999999，不能跳出低层级祖先压过更高层级的兄弟上下文。

```text
根上下文
├─ A：z-index 1
│  └─ 弹层：z-index 9999
└─ B：z-index 2
```

在这个模型中，B 作为整体仍可能盖住 A 中的弹层。修复思路包括调整祖先的层级边界、移除不必要的 transform，或将弹层挂载到适当的门户容器。浏览器的 top layer（例如原生 dialog 的模态层）又是独立机制，不能只照普通 z-index 模型推断。

## 5. 错误驱动与边界

把主体布局全写成 absolute，短文案时可以“对齐”，长文案、语言切换和缩放后却重叠。应先用正常流、Flex 或 Grid 表达内容关系，再仅对角标等真正脱离流的元素定位。

sticky 失效时检查：谁产生滚动？祖先是否设置 overflow？是否有阈值？粘附元素和父元素有没有足够的移动范围？父元素高度刚好等于自身高度时，几乎没有可粘附空间。fixed 元素若被 transform 祖先“困住”，先核实它的实际包含块，不要只改 top。

### 5.1 正常流中的外边距折叠与格式化上下文

某些块级盒的垂直 margin 会折叠：两个正外边距可能取较大值而非相加；父子 margin 也可能穿透。它受格式化环境、边框、内边距和其他条件影响，不应把这个规律套到 Flex/Grid 项目上。

在一个只有子段落的容器里观察 `p { margin-top:24px }`，父容器背景可能没有覆盖你想象中的上方空白。给父级 `display:flow-root` 建立新的块格式化上下文，能阻止该父子外边距折叠，并容纳其浮动后代；它不是全局“清除 margin”开关。若设计需要的是容器内部留白，使用 padding 通常更符合意图。

```html
<!-- 可替换上面完整实验中的 .card 内容，逐项在开发工具切换规则 -->
<div style="display:flow-root;background:#e7f5ff">
  <p style="margin-top:24px">父级的新格式化上下文限制 margin 折叠。</p>
</div>
```

## 6. 使用模式

卡片角标适合 relative 父级加 absolute 子级；页内章节工具栏可以考虑 sticky；全局弹窗优先使用语义明确、具备焦点与关闭行为的组件。视觉层级还必须考虑键盘焦点与辅助技术，不能把背景盖住就当作实现了模态交互。

## 7. 练习与验收

1. 在卡片外添加 `transform:translateZ(0)` 的祖先，观察 fixed 子元素。验收指出它实际跟随哪个区域。
2. 搭建上述 A/B 层级并复现遮挡，使用两种不同策略修复。验收说明改变的是祖先边界还是局部数值。
3. 用正常流重新实现一个原来全 absolute 的图文卡片；验收以两倍文案和 200% 缩放测试无重叠。

## 8. 资料链接

- [MDN：正常流](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Introduction)
- [MDN：position](https://developer.mozilla.org/en-US/docs/Web/CSS/position)
- [MDN：层叠上下文](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context)
