import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

let subject = {};

try {
  subject = await import('../app.js');
} catch {
  subject = {};
}

const {
  validateEvenInput,
  isPrime,
  getGoldbachPairs,
  formatPairList,
  paginatePairs,
  createBatchState,
  processBatch,
  getStopButtonLabel,
} = subject;

test('validateEvenInput 接受大于 6 的偶数', () => {
  assert.equal(typeof validateEvenInput, 'function');
  assert.deepEqual(validateEvenInput('28'), {
    ok: true,
    value: 28,
    message: '',
  });
});

test('validateEvenInput 拒绝非法输入', () => {
  assert.equal(typeof validateEvenInput, 'function');
  assert.deepEqual(validateEvenInput(''), {
    ok: false,
    value: null,
    message: '请输入一个数字。',
  });
  assert.deepEqual(validateEvenInput('7'), {
    ok: false,
    value: null,
    message: '请输入大于 6 的偶数。',
  });
  assert.deepEqual(validateEvenInput('3.5'), {
    ok: false,
    value: null,
    message: '请输入整数。',
  });
});

test('isPrime 能识别素数与合数', () => {
  assert.equal(typeof isPrime, 'function');
  assert.equal(isPrime(2), true);
  assert.equal(isPrime(23), true);
  assert.equal(isPrime(1), false);
  assert.equal(isPrime(21), false);
});

test('getGoldbachPairs 返回不重复的素数对与组数', () => {
  assert.equal(typeof getGoldbachPairs, 'function');
  assert.deepEqual(getGoldbachPairs(28), [
    [5, 23],
    [11, 17],
  ]);
  assert.deepEqual(getGoldbachPairs(10), [
    [3, 7],
    [5, 5],
  ]);
});

test('formatPairList 产出适合页面展示的结果', () => {
  assert.equal(typeof formatPairList, 'function');
  assert.deepEqual(formatPairList([
    [3, 7],
    [5, 5],
  ]), [
    '3 + 7',
    '5 + 5',
  ]);
});

test('paginatePairs 只返回当前页的数据和总页数', () => {
  assert.equal(typeof paginatePairs, 'function');

  const pairs = Array.from({ length: 120 }, (_, index) => [index + 3, index + 103]);
  const page = paginatePairs(pairs, 2, 50);

  assert.equal(page.currentPage, 2);
  assert.equal(page.totalPages, 3);
  assert.deepEqual(page.items[0], [53, 153]);
  assert.deepEqual(page.items.at(-1), [102, 202]);
});

test('paginatePairs 会在数据不足时钳制页码', () => {
  assert.equal(typeof paginatePairs, 'function');

  const page = paginatePairs([[3, 7], [5, 5]], 9, 50);

  assert.equal(page.currentPage, 1);
  assert.equal(page.totalPages, 1);
  assert.deepEqual(page.items, [[3, 7], [5, 5]]);
});

test('processBatch 可以分批累计素数对直到完成', () => {
  assert.equal(typeof createBatchState, 'function');
  assert.equal(typeof processBatch, 'function');

  let state = createBatchState(28);

  assert.equal(state.checked, 0);
  assert.equal(state.done, false);
  assert.deepEqual(state.pairs, []);

  while (!state.done) {
    state = processBatch(state, 3);
  }

  assert.equal(state.done, true);
  assert.equal(state.progress, 1);
  assert.deepEqual(state.pairs, [
    [5, 23],
    [11, 17],
  ]);
});

test('getStopButtonLabel 会根据运行态返回正确文案', () => {
  assert.equal(typeof getStopButtonLabel, 'function');

  assert.equal(getStopButtonLabel({
    isRunning: true,
    done: false,
    statusText: '计算中',
  }), '停止');

  assert.equal(getStopButtonLabel({
    isRunning: false,
    done: true,
    statusText: '已完成',
  }), '已完成');

  assert.equal(getStopButtonLabel({
    isRunning: false,
    done: false,
    statusText: '已停止',
  }), '已停止');
});

test('styles.css 会在 hidden 状态下真正隐藏 empty-note', () => {
  const css = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /\.empty-note\[hidden\]\s*\{[^}]*display:\s*none/i);
});

test('index.html 会在标题下展示哥德巴赫猜想简介', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(html, /任何一个\s*(大于|>)\s*6\s*的偶数/i);
  assert.match(html, /哥德巴赫猜想/);
});

test('index.html 会预留小弹窗提示区域', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(html, /id="toast"/);
});
