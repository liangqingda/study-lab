---
name: best-react-code
description: Client-side React performance optimization guidelines (adapted from Vercel Engineering, trimmed to client-only React/SPA — Vite/CRA/plain React). This skill should be used when writing, reviewing, or refactoring client-side React code to ensure optimal performance patterns. Triggers on tasks involving React components, client-side data fetching, bundle optimization, or performance improvements in client-rendered apps.
license: MIT
metadata:
  author: vercel (adapted)
  version: "1.0.0"
---

# Client-Side React Best Practices

Comprehensive performance optimization guide for client-side React applications (Vite / CRA / plain React SPA). Contains 45 rules across 5 categories, prioritized by impact to guide automated refactoring and code generation. Server-side / SSR-specific rules (RSC, Next.js API Routes, Server Actions, hydration) are intentionally excluded.

## When to Apply

Reference these guidelines when:
- Writing new React components or pages
- Implementing client-side data fetching
- Reviewing code for performance issues
- Refactoring existing React code
- Optimizing bundle size or load times

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Bundle Size Optimization | CRITICAL | `bundle-` |
| 2 | Re-render Optimization | MEDIUM | `rerender-` |
| 3 | Rendering Performance | MEDIUM | `rendering-` |
| 4 | JavaScript Performance | LOW-MEDIUM | `js-` |
| 5 | Advanced Patterns | LOW | `advanced-` |

## Quick Reference

### 1. Bundle Size Optimization (CRITICAL)

- `bundle-barrel-imports` - Import directly, avoid barrel files
- `bundle-analyzable-paths` - Prefer statically analyzable import and file-system paths to avoid broad bundles and traces
- `bundle-dynamic-imports` - Use React.lazy / dynamic import for heavy components
- `bundle-conditional` - Load modules only when feature is activated
- `bundle-preload` - Preload on hover/focus for perceived speed

### 2. Re-render Optimization (MEDIUM)

- `rerender-defer-reads` - Don't subscribe to state only used in callbacks
- `rerender-memo` - Extract expensive work into memoized components
- `rerender-memo-with-default-value` - Hoist default non-primitive props
- `rerender-dependencies` - Use primitive dependencies in effects
- `rerender-derived-state` - Subscribe to derived booleans, not raw values
- `rerender-derived-state-no-effect` - Derive state during render, not effects
- `rerender-functional-setstate` - Use functional setState for stable callbacks
- `rerender-lazy-state-init` - Pass function to useState for expensive values
- `rerender-simple-expression-in-memo` - Avoid memo for simple primitives
- `rerender-split-combined-hooks` - Split hooks with independent dependencies
- `rerender-move-effect-to-event` - Put interaction logic in event handlers
- `rerender-transitions` - Use startTransition for non-urgent updates
- `rerender-use-deferred-value` - Defer expensive renders to keep input responsive
- `rerender-use-ref-transient-values` - Use refs for transient frequent values
- `rerender-no-inline-components` - Don't define components inside components

### 3. Rendering Performance (MEDIUM)

- `rendering-animate-svg-wrapper` - Animate div wrapper, not SVG element
- `rendering-content-visibility` - Use content-visibility for long lists
- `rendering-hoist-jsx` - Extract static JSX outside components
- `rendering-svg-precision` - Reduce SVG coordinate precision
- `rendering-activity` - Use Activity component for show/hide
- `rendering-conditional-render` - Use ternary, not && for conditionals
- `rendering-usetransition-loading` - Prefer useTransition for loading state

### 4. JavaScript Performance (LOW-MEDIUM)

- `js-batch-dom-css` - Group CSS changes via classes or cssText
- `js-index-maps` - Build Map for repeated lookups
- `js-cache-property-access` - Cache object properties in loops
- `js-cache-function-results` - Cache function results in module-level Map
- `js-cache-storage` - Cache localStorage/sessionStorage reads
- `js-combine-iterations` - Combine multiple filter/map into one loop
- `js-length-check-first` - Check array length before expensive comparison
- `js-early-exit` - Return early from functions
- `js-hoist-regexp` - Hoist RegExp creation outside loops
- `js-min-max-loop` - Use loop for min/max instead of sort
- `js-set-map-lookups` - Use Set/Map for O(1) lookups
- `js-tosorted-immutable` - Use toSorted() for immutability
- `js-flatmap-filter` - Use flatMap to map and filter in one pass
- `js-request-idle-callback` - Defer non-critical work to browser idle time

### 5. Advanced Patterns (LOW)

- `advanced-effect-event-deps` - Don't put `useEffectEvent` results in effect deps
- `advanced-event-handler-refs` - Store event handlers in refs
- `advanced-init-once` - Initialize app once per app load
- `advanced-use-latest` - useLatest for stable callback refs

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/bundle-barrel-imports.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and references

## Full Compiled Document

For the complete guide with all rules expanded: `AGENTS.md`

## Workspace Conventions — study-fullstack（前端约定）

以下为本项目 `study-fullstack`（`apps/web`，包名 `study-react`）的代码组织约定，**优先于上方通用规则执行**。来源：仓库 `AGENTS.md`、`apps/web/AGENTS.md`、`.agents/skills/study-demo/SKILL.md`。

### 目录结构与就近放置

- 按职责适度拆分：可复用界面放组件，独立状态或副作用放 Hook，与界面无关的纯逻辑放工具函数。简单且只在一处使用的逻辑保留原处。
- 功能专用代码就近放在功能目录，仅将跨功能复用的代码提取到公共目录。
- 常量放 `constants.ts`，util 放 `utils.ts`，提取的类型放 `types.ts`，独立 hook 放 `hooks/`；就近放所属页面或组件目录下，不跨目录共享。

### 组件拆分规范

- 每个组件单独一个目录（`组件名/index.tsx` + `组件名/index.scss`），不把多个组件堆在一个 `index.tsx` 里。
- 拆出的子组件直接放父组件目录：`Demo/Demo1/index.tsx`，不要写成 `Demo/components/Demo1/`——组件目录内不嵌套 `components/` 层。pages 下拆出的组件同理（页面组件目录内直接放子组件目录，不套 `components/`）。
- 样式随组件走：每个组件目录有自己的 `index.scss`；父组件 `index.scss` 只保留父组件自身布局相关的样式。
- 公共组件（`apps/web/src/components/*`）与页面组件适用同规则。

### 别名与跨模块引用

- `src` 内跨模块引用统一使用 `@/`（`@` 指向 `src`），包括类型、样式和动态导入。
- 同一模块内部的 `components`、`hooks`、`utils`、样式等可使用相对路径。
- 跨模块导入走 `@/` 直接路径，不制造 barrel 文件。

### 注释 / JSDoc 规范

- 所有提取或共享代码（constants、utils、types、schema 契约、common 模块）必须带 JSDoc 注释。
- 类型级与函数级 JSDoc 用多行块：

```ts
/**
 * Does one thing and returns it.
 */
export const helper = () => {};
```

- 对象类型属性用单行 JSDoc，写在字段上方：

```ts
export type User = {
  /** Unique user id. */
  id: string;
};
```

- 生成文件（如 `packages/schema/types/api-types.ts`）除外。

### React 组件质量基线

- 不在组件内部定义组件（每次渲染重建、破坏子树状态）。
- 独立依赖的 hooks 分开写；昂贵初始值用函数式 `useState(() => ...)`。
- 互不依赖的请求用 `Promise.all` 并行，避免串行 waterfall。
- 条件渲染用三元而非 `&&`，避免渲染出 `0` 或空串。
