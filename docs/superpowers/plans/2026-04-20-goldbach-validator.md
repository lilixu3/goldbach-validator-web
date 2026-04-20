# Goldbach Validator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把现有哥德巴赫网页升级为简洁版分页验证器，支持 50 组/页、页码跳转、分批计算、进度条与停止按钮。

**Architecture:** 继续使用原生 HTML/CSS/JavaScript 单页结构。数学与分页逻辑集中在 `app.js` 的纯函数中，浏览器侧再用一个轻量控制器驱动分批计算与 UI 渲染；测试依旧用 Node 内置测试器验证输入校验、分页和分批计算核心逻辑。

**Tech Stack:** HTML, CSS, Vanilla JavaScript, Node.js `node:test`

---

### Task 1: 补齐分页与分批计算测试

**Files:**
- Modify: `tests/goldbach.test.js`
- Modify: `app.js`

- [ ] **Step 1: 为分页和分批计算写失败测试**

```js
test('paginatePairs 只返回当前页数据', () => {
  const pairs = Array.from({ length: 120 }, (_, index) => [index + 3, index + 103]);
  assert.deepEqual(paginatePairs(pairs, 2, 50).items[0], [53, 153]);
  assert.equal(paginatePairs(pairs, 2, 50).totalPages, 3);
});

test('processBatch 可以逐批累计素数对', () => {
  let state = createBatchState(28);
  while (!state.done) state = processBatch(state, 3);
  assert.deepEqual(state.pairs, [[5, 23], [11, 17]]);
});
```

- [ ] **Step 2: 运行测试确认先失败**

Run: `npm test`
Expected: FAIL，提示新增分页或分批函数不存在。

- [ ] **Step 3: 在 `app.js` 增加纯函数实现**

```js
export function paginatePairs(pairs, page, pageSize = 50) {
  const totalPages = Math.max(1, Math.ceil(pairs.length / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  return {
    totalPages,
    currentPage,
    items: pairs.slice((currentPage - 1) * pageSize, currentPage * pageSize),
  };
}
```

- [ ] **Step 4: 再次运行测试确认通过**

Run: `npm test`
Expected: PASS，输入校验、分页与分批逻辑测试全部通过。

### Task 2: 改造页面为简洁分页布局

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

- [ ] **Step 1: 精简页面骨架**

```html
<main class="page-shell page-shell--compact">
  <header class="topbar"><h1>哥德巴赫验证器</h1></header>
  <section class="control-panel">...</section>
  <section class="status-panel">...</section>
  <section id="result-panel"></section>
  <section id="pager-panel"></section>
</main>
```

- [ ] **Step 2: 用更紧凑的样式替换旧 hero 区**

```css
.topbar h1 {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  letter-spacing: -0.04em;
}
```

- [ ] **Step 3: 给状态区和分页区增加紧凑控件样式**

```css
.pager {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
```

- [ ] **Step 4: 本地打开页面确认整体比旧版更简洁**

Run: `python -m http.server 4173`
Expected: 顶部说明明显缩短，页面一屏内可直接看到输入、状态与结果。

### Task 3: 接入分批计算、停止与分页跳转

**Files:**
- Modify: `app.js`

- [ ] **Step 1: 创建批处理状态与步进函数**

```js
export function createBatchState(evenValue) {
  return { evenValue, nextLeft: 2, checked: 0, totalCandidates: evenValue / 2 - 1, pairs: [], done: false };
}
```

- [ ] **Step 2: 实现浏览器侧控制器，逐批调度计算**

```js
function scheduleNextBatch(session) {
  session.timerId = window.setTimeout(() => runBatch(session), 0);
}
```

- [ ] **Step 3: 实现停止按钮逻辑**

```js
stopButton.addEventListener('click', () => {
  if (activeSession) activeSession.stopped = true;
});
```

- [ ] **Step 4: 实现分页渲染与跳转校验**

```js
if (!session.done && targetPage > pageData.totalPages) {
  renderHint('该页未生成');
  return;
}
```

- [ ] **Step 5: 本地验证交互**

Run: `python -m http.server 4173`
Expected: 大数输入时进度条变化、停止可中断、分页和跳转可正常工作。

### Task 4: 最终验证与发布

**Files:**
- Modify: `app.js`
- Modify: `index.html`
- Modify: `styles.css`

- [ ] **Step 1: 运行完整测试**

Run: `npm test`
Expected: PASS。

- [ ] **Step 2: 做一次逻辑冒烟验证**

Run: `node --input-type=module -e "import { createBatchState, processBatch } from './app.js'; let state = createBatchState(28); while (!state.done) state = processBatch(state, 4); console.log(JSON.stringify({ total: state.pairs.length, pairs: state.pairs }));"`
Expected: 输出两组结果 `[[5,23],[11,17]]`。

- [ ] **Step 3: 检查公网页面**

Run: `curl -s <PUBLIC_URL> | rg '哥德巴赫验证器|开始验证|停止|跳转'`
Expected: 页面关键控件存在。

- [ ] **Step 4: 返回链接与改动摘要**

把可访问链接、分页策略、分批计算和停止能力一起告诉用户。
