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

test('package.json 提供统一的 build 脚本用于云平台导入部署', () => {
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

  assert.equal(pkg.scripts.build, 'node scripts/build-static.mjs');
});

test('仓库包含 Vercel 配置，导入后无需手填输出目录', () => {
  const json = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

  assert.equal(json.framework, null);
  assert.equal(json.buildCommand, 'npm run build');
  assert.equal(json.outputDirectory, 'dist');
});

test('仓库包含 Netlify 配置，导入后无需手填发布目录', () => {
  const toml = fs.readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8');

  assert.match(toml, /\[build\]/);
  assert.match(toml, /command\s*=\s*"npm run build"/);
  assert.match(toml, /publish\s*=\s*"dist"/);
});

test('仓库包含 Cloudflare Pages 配置，导入后无需手填输出目录', () => {
  const jsonc = fs.readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8');

  assert.match(jsonc, /"pages_build_output_dir"\s*:\s*"\.\/dist"/);
});

test('仓库包含 EdgeOne 配置，导入后无需手填输出目录', () => {
  const json = JSON.parse(fs.readFileSync(new URL('../edgeone.json', import.meta.url), 'utf8'));

  assert.equal(json.buildCommand, 'npm run build');
  assert.equal(json.outputDirectory, './dist');
});

test('index.html 包含常见云平台导入部署说明区块', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(html, /导入仓库即可部署/);
  assert.match(html, /Vercel/);
  assert.match(html, /Netlify/);
  assert.match(html, /Cloudflare Pages/);
  assert.match(html, /EdgeOne/);
});

test('DEPLOY.md 提供平台默认域名与导入步骤说明', () => {
  const md = fs.readFileSync(new URL('../DEPLOY.md', import.meta.url), 'utf8');

  assert.match(md, /\.vercel\.app/);
  assert.match(md, /\.netlify\.app/);
  assert.match(md, /\.pages\.dev/);
  assert.match(md, /\.edgeone\.app/);
  assert.match(md, /默认先使用平台分配域名/);
});
