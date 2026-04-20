const PAGE_SIZE = 50;
const BATCH_SIZE = 400;

export function validateEvenInput(rawValue) {
  const normalized = String(rawValue ?? '').trim();

  if (!normalized) {
    return { ok: false, value: null, message: '请输入一个数字。' };
  }

  const numericValue = Number(normalized);

  if (!Number.isFinite(numericValue) || Number.isNaN(numericValue)) {
    return { ok: false, value: null, message: '请输入一个数字。' };
  }

  if (!Number.isInteger(numericValue)) {
    return { ok: false, value: null, message: '请输入整数。' };
  }

  if (numericValue <= 6 || numericValue % 2 !== 0) {
    return { ok: false, value: null, message: '请输入大于 6 的偶数。' };
  }

  return { ok: true, value: numericValue, message: '' };
}

export function isPrime(value) {
  if (value < 2) {
    return false;
  }

  if (value === 2) {
    return true;
  }

  if (value % 2 === 0) {
    return false;
  }

  const limit = Math.floor(Math.sqrt(value));

  for (let factor = 3; factor <= limit; factor += 2) {
    if (value % factor === 0) {
      return false;
    }
  }

  return true;
}

export function createBatchState(evenValue) {
  const limit = Math.floor(evenValue / 2);
  const totalCandidates = Math.max(0, limit - 1);

  return {
    evenValue,
    limit,
    nextLeft: 2,
    checked: 0,
    totalCandidates,
    pairs: [],
    progress: totalCandidates === 0 ? 1 : 0,
    done: false,
  };
}

export function processBatch(state, batchSize = BATCH_SIZE) {
  const safeBatchSize = Math.max(1, Math.floor(batchSize) || 1);
  const pairs = state.pairs;
  let nextLeft = state.nextLeft;
  let checked = state.checked;
  let processed = 0;

  while (nextLeft <= state.limit && processed < safeBatchSize) {
    const right = state.evenValue - nextLeft;

    if (isPrime(nextLeft) && isPrime(right)) {
      pairs.push([nextLeft, right]);
    }

    nextLeft += 1;
    checked += 1;
    processed += 1;
  }

  const done = nextLeft > state.limit;
  const progress = state.totalCandidates === 0
    ? 1
    : Math.min(1, checked / state.totalCandidates);

  return {
    ...state,
    pairs,
    nextLeft,
    checked,
    progress,
    done,
  };
}

export function getGoldbachPairs(evenValue) {
  let state = createBatchState(evenValue);

  while (!state.done) {
    state = processBatch(state, BATCH_SIZE);
  }

  return state.pairs.slice();
}

export function formatPairList(pairs) {
  return pairs.map(([left, right]) => `${left} + ${right}`);
}

export function paginatePairs(pairs, page, pageSize = PAGE_SIZE) {
  const safePageSize = Math.max(1, Math.floor(pageSize) || PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(Math.max(1, pairs.length) / safePageSize));
  const requestedPage = Number.isFinite(page) ? Math.floor(page) : 1;
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);
  const start = (currentPage - 1) * safePageSize;

  return {
    currentPage,
    totalPages,
    pageSize: safePageSize,
    items: pairs.slice(start, start + safePageSize),
  };
}

export function getStopButtonLabel(uiState) {
  if (uiState.isRunning) {
    return '停止';
  }

  if (uiState.done) {
    return '已完成';
  }

  if (uiState.statusText === '已停止') {
    return '已停止';
  }

  return '停止';
}

function formatProgress(progress) {
  return `${Math.round(progress * 100)}%`;
}

function createInitialUiState() {
  return {
    evenValue: null,
    pairs: [],
    currentPage: 1,
    pageSize: PAGE_SIZE,
    progress: 0,
    done: false,
    isRunning: false,
    statusText: '待开始',
    pagerHint: '',
  };
}

function createDomRefs() {
  return {
    input: document.querySelector('#even-input'),
    verifyButton: document.querySelector('#verify-button'),
    stopButton: document.querySelector('#stop-button'),
    countValue: document.querySelector('#count-value'),
    progressText: document.querySelector('#progress-text'),
    statusText: document.querySelector('#status-text'),
    progressFill: document.querySelector('#progress-fill'),
    resultList: document.querySelector('#result-list'),
    emptyNote: document.querySelector('#empty-note'),
    pageStatus: document.querySelector('#page-status'),
    pageInput: document.querySelector('#page-input'),
    jumpButton: document.querySelector('#jump-button'),
    prevButton: document.querySelector('#prev-button'),
    nextButton: document.querySelector('#next-button'),
    pagerHint: document.querySelector('#pager-hint'),
    toast: document.querySelector('#toast'),
  };
}

function buildPairItems(evenValue, pageData) {
  const startIndex = (pageData.currentPage - 1) * pageData.pageSize;

  return pageData.items
    .map(([left, right], index) => `
      <li class="pair-item">
        <span class="pair-index">${startIndex + index + 1}</span>
        <div class="pair-main">
          <span class="pair-total">${evenValue}</span>
          <span class="pair-sign">=</span>
          <span>${left}</span>
          <span class="pair-sign">+</span>
          <span>${right}</span>
        </div>
      </li>
    `)
    .join('');
}

function render(uiState, refs) {
  const pageData = paginatePairs(uiState.pairs, uiState.currentPage, uiState.pageSize);

  uiState.currentPage = pageData.currentPage;
  refs.countValue.textContent = String(uiState.pairs.length);
  refs.progressText.textContent = formatProgress(uiState.progress);
  refs.statusText.textContent = uiState.statusText;
  refs.progressFill.style.width = `${uiState.progress * 100}%`;
  refs.stopButton.disabled = !uiState.isRunning;
  refs.stopButton.textContent = getStopButtonLabel(uiState);
  refs.pageStatus.textContent = `${pageData.currentPage} / ${pageData.totalPages}`;
  refs.pageInput.placeholder = String(pageData.currentPage);
  refs.prevButton.disabled = pageData.currentPage <= 1;
  refs.nextButton.disabled = pageData.currentPage >= pageData.totalPages;
  refs.jumpButton.disabled = false;
  refs.pagerHint.textContent = uiState.pagerHint;

  if (pageData.items.length > 0) {
    refs.resultList.innerHTML = buildPairItems(uiState.evenValue, pageData);
    refs.emptyNote.hidden = true;
  } else {
    refs.resultList.innerHTML = '';
    refs.emptyNote.hidden = false;
    refs.emptyNote.textContent = uiState.isRunning ? '计算中…' : uiState.statusText;
  }
}

function setupGoldbachValidator() {
  const refs = createDomRefs();

  if (!refs.input || !refs.verifyButton || !refs.stopButton) {
    return;
  }

  const uiState = createInitialUiState();
  let activeSession = null;
  let toastTimerId = null;

  const renderAll = () => {
    render(uiState, refs);
  };

  const showToast = (message) => {
    if (!refs.toast || !message) {
      return;
    }

    refs.toast.textContent = message;
    refs.toast.hidden = false;

    if (toastTimerId) {
      window.clearTimeout(toastTimerId);
    }

    toastTimerId = window.setTimeout(() => {
      refs.toast.hidden = true;
      toastTimerId = null;
    }, 2200);
  };

  const stopSession = (label = '已停止') => {
    if (activeSession?.timerId) {
      window.clearTimeout(activeSession.timerId);
    }

    if (activeSession) {
      activeSession.stopped = true;
    }

    activeSession = null;
    uiState.isRunning = false;
    uiState.statusText = label;
    renderAll();
  };

  const scheduleBatch = (session) => {
    session.timerId = window.setTimeout(() => runBatch(session), 0);
  };

  const runBatch = (session) => {
    if (!activeSession || activeSession.id !== session.id || session.stopped) {
      return;
    }

    session.batchState = processBatch(session.batchState, BATCH_SIZE);
    uiState.pairs = session.batchState.pairs.slice();
    uiState.progress = session.batchState.progress;
    uiState.statusText = session.batchState.done ? '已完成' : '计算中';
    uiState.done = session.batchState.done;
    uiState.isRunning = !session.batchState.done;
    uiState.pagerHint = '';
    renderAll();

    if (session.batchState.done) {
      activeSession = null;
      return;
    }

    scheduleBatch(session);
  };

  const startComputation = () => {
    const parsed = validateEvenInput(refs.input.value);

    if (!parsed.ok) {
      stopSession('输入有误');
      uiState.evenValue = null;
      uiState.pairs = [];
      uiState.currentPage = 1;
      uiState.progress = 0;
      uiState.done = false;
      uiState.pagerHint = parsed.message;
      refs.emptyNote.textContent = parsed.message;
      renderAll();
      showToast(parsed.message);
      return;
    }

    if (activeSession) {
      stopSession('已重置');
    }

    uiState.evenValue = parsed.value;
    uiState.pairs = [];
    uiState.currentPage = 1;
    uiState.progress = 0;
    uiState.done = false;
    uiState.isRunning = true;
    uiState.statusText = '计算中';
    uiState.pagerHint = '';

    activeSession = {
      id: Date.now() + Math.random(),
      stopped: false,
      timerId: null,
      batchState: createBatchState(parsed.value),
    };

    renderAll();
    scheduleBatch(activeSession);
  };

  const setPage = (targetPage) => {
    const pageData = paginatePairs(uiState.pairs, uiState.currentPage, uiState.pageSize);

    if (!uiState.done && targetPage > pageData.totalPages) {
      uiState.pagerHint = '该页未生成';
      renderAll();
      return;
    }

    uiState.currentPage = Math.max(1, targetPage);
    uiState.pagerHint = '';
    renderAll();
  };

  refs.verifyButton.addEventListener('click', startComputation);
  refs.stopButton.addEventListener('click', () => stopSession('已停止'));
  refs.prevButton.addEventListener('click', () => setPage(uiState.currentPage - 1));
  refs.nextButton.addEventListener('click', () => setPage(uiState.currentPage + 1));
  refs.jumpButton.addEventListener('click', () => {
    const value = Number(refs.pageInput.value);

    if (!Number.isInteger(value) || value < 1) {
      uiState.pagerHint = '页码无效';
      renderAll();
      return;
    }

    setPage(value);
  });

  refs.input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      startComputation();
    }
  });

  refs.pageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      refs.jumpButton.click();
    }
  });

  renderAll();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupGoldbachValidator, { once: true });
  } else {
    setupGoldbachValidator();
  }
}
