/* ── Config ─────────────────────────────────────────────────────────────── */
const API_BASE = '/ai';

/* ── State ──────────────────────────────────────────────────────────────── */
let activeConvId = null;
let isStreaming = false;
let sendMode = 'stream'; // 'stream' | 'normal'
let isBatchRenderEnabled = true;

const RENDER_BATCH_MAX_WAIT_MS = 50;
const SIDEBAR_REFRESH_DEBOUNCE_MS = 120;
const AUTO_SCROLL_THRESHOLD_PX = 48;

let streamBatchRafId = null;
let streamBatchTimeoutId = null;
let pendingStreamText = '';
let pendingTitleText = null;
let pendingScrollToBottom = false;
let streamBatchTargetEl = null;
let shouldAutoScroll = true;

let sidebarRefreshTimerId = null;

/* ── DOM refs ───────────────────────────────────────────────────────────── */
const messagesEl  = document.getElementById('messages');
const inputEl     = document.getElementById('input');
const sendBtn     = document.getElementById('send-btn');
const newChatBtn  = document.getElementById('new-chat-btn');
const convListEl  = document.getElementById('conv-list');
const chatTitle   = document.getElementById('chat-title');
const modeBtns    = document.querySelectorAll('.mode-btn');
const batchToggleBtn = document.getElementById('batch-toggle-btn');

/* ── Helpers ────────────────────────────────────────────────────────────── */
function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1)  return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)   return `${diffH}h ago`;
  return d.toLocaleDateString();
}

function shortId(id) {
  return id ? id.slice(0, 8) + '…' : '';
}

function scrollBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function isNearBottom() {
  const remaining = messagesEl.scrollHeight - messagesEl.clientHeight - messagesEl.scrollTop;
  return remaining <= AUTO_SCROLL_THRESHOLD_PX;
}

function clearRenderBatchSchedulers() {
  if (streamBatchRafId !== null) {
    cancelAnimationFrame(streamBatchRafId);
    streamBatchRafId = null;
  }
  if (streamBatchTimeoutId !== null) {
    clearTimeout(streamBatchTimeoutId);
    streamBatchTimeoutId = null;
  }
}

function flushRenderBatch() {
  clearRenderBatchSchedulers();

  if (streamBatchTargetEl && pendingStreamText) {
    streamBatchTargetEl.textContent += pendingStreamText;
    pendingStreamText = '';
  }

  if (pendingTitleText !== null) {
    chatTitle.textContent = pendingTitleText;
    pendingTitleText = null;
  }

  if (pendingScrollToBottom && shouldAutoScroll) {
    scrollBottom();
  }

  pendingScrollToBottom = false;
}

function scheduleRenderBatchFlush() {
  if (streamBatchRafId === null) {
    streamBatchRafId = requestAnimationFrame(flushRenderBatch);
  }

  if (streamBatchTimeoutId === null) {
    streamBatchTimeoutId = setTimeout(flushRenderBatch, RENDER_BATCH_MAX_WAIT_MS);
  }
}

function queueStreamText(targetEl, text) {
  if (!text) return;

  if (streamBatchTargetEl && streamBatchTargetEl !== targetEl) {
    flushRenderBatch();
  }

  streamBatchTargetEl = targetEl;
  pendingStreamText += text;
  scheduleRenderBatchFlush();
}

function queueTitleUpdate(titleText) {
  pendingTitleText = titleText;
  scheduleRenderBatchFlush();
}

function requestAutoScroll() {
  if (!shouldAutoScroll) return;
  pendingScrollToBottom = true;
  scheduleRenderBatchFlush();
}

function finalizeRenderBatch() {
  flushRenderBatch();
  streamBatchTargetEl = null;
  pendingStreamText = '';
}

function updateBatchToggleUI() {
  if (!batchToggleBtn) return;
  batchToggleBtn.textContent = isBatchRenderEnabled ? 'Batch ON' : 'Batch OFF';
  batchToggleBtn.classList.toggle('active', isBatchRenderEnabled);
}

function setLoading(loading) {
  isStreaming = loading;
  sendBtn.disabled = loading;
  if (batchToggleBtn) {
    batchToggleBtn.disabled = loading;
  }
}

/* ── Sidebar ────────────────────────────────────────────────────────────── */
async function loadConversations() {
  try {
    const res = await fetch(`${API_BASE}/conversations`);
    if (!res.ok) return;
    const list = await res.json();
    renderSidebar(list);
  } catch {
    // server may not be ready yet — fail silently
  }
}

function scheduleSidebarRefresh() {
  if (sidebarRefreshTimerId !== null) {
    clearTimeout(sidebarRefreshTimerId);
  }

  sidebarRefreshTimerId = setTimeout(async () => {
    sidebarRefreshTimerId = null;
    await loadConversations();
  }, SIDEBAR_REFRESH_DEBOUNCE_MS);
}

function renderSidebar(list) {
  if (!list.length) {
    convListEl.innerHTML = '<div class="conv-list-empty">No conversations yet</div>';
    return;
  }

  // Sort newest first
  const sorted = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  convListEl.innerHTML = sorted.map(c => `
    <div class="conv-item${c.id === activeConvId ? ' active' : ''}" data-id="${c.id}">
      <div class="conv-item-id">${shortId(c.id)}</div>
      <div class="conv-item-meta">
        <span>${c.messageCount} msg${c.messageCount !== 1 ? 's' : ''}</span>
        <span>${formatDate(c.createdAt)}</span>
      </div>
    </div>
  `).join('');

  convListEl.querySelectorAll('.conv-item').forEach(el => {
    el.addEventListener('click', () => selectConversation(el.dataset.id));
  });
}

/* ── Conversation selection & history ──────────────────────────────────── */
async function selectConversation(id) {
  if (id === activeConvId) return;
  activeConvId = id;
  chatTitle.textContent = `conv: ${shortId(id)}`;
  messagesEl.innerHTML = '';

  try {
    const res = await fetch(`${API_BASE}/conversations/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    data.messages.forEach(msg => {
      if (msg.role === 'system') return;
      appendMessage(msg.role === 'user' ? 'user' : 'assistant', msg.content);
    });
  } catch (err) {
    appendError(`Failed to load history: ${err.message}`);
  }

  await loadConversations();
  scrollBottom();
}

/* ── Message rendering ──────────────────────────────────────────────────── */
function appendMessage(role, text = '') {
  const el = document.createElement('div');
  el.className = `msg ${role}`;
  el.textContent = text;
  messagesEl.appendChild(el);
  shouldAutoScroll = true;
  scrollBottom();
  return el;
}

function appendError(text) {
  const el = document.createElement('div');
  el.className = 'msg error';
  el.textContent = text;
  messagesEl.appendChild(el);
  shouldAutoScroll = true;
  scrollBottom();
}

/* ── Send (stream mode) ─────────────────────────────────────────────────── */
async function sendStream(message) {
  const assistantEl = appendMessage('assistant', '');
  assistantEl.classList.add('streaming');

  try {
    const res = await fetch(`${API_BASE}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationId: activeConvId }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete line

      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const raw = line.slice(5).trim();
        let parsed;
        try { parsed = JSON.parse(raw); } catch { continue; }

        if (parsed.text !== undefined) {
          if (isBatchRenderEnabled) {
            queueStreamText(assistantEl, parsed.text);
            requestAutoScroll();
          } else {
            assistantEl.textContent += parsed.text;
            if (shouldAutoScroll) {
              scrollBottom();
            }
          }
        }

        if (parsed.conversationId) {
          activeConvId = parsed.conversationId;
          if (isBatchRenderEnabled) {
            queueTitleUpdate(`conv: ${shortId(activeConvId)}`);
          } else {
            chatTitle.textContent = `conv: ${shortId(activeConvId)}`;
          }
        }

        if (parsed.error) {
          finalizeRenderBatch();
          assistantEl.remove();
          appendError(`Stream error: ${parsed.error}`);
          return;
        }
      }
    }
  } catch (err) {
    finalizeRenderBatch();
    assistantEl.remove();
    appendError(`Error: ${err.message}`);
  } finally {
    finalizeRenderBatch();
    assistantEl.classList.remove('streaming');
  }
}

/* ── Send (normal mode) ─────────────────────────────────────────────────── */
async function sendNormal(message) {
  const assistantEl = appendMessage('assistant', '');

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationId: activeConvId }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    assistantEl.textContent = data.reply.text;

    if (data.conversationId) {
      activeConvId = data.conversationId;
      chatTitle.textContent = `conv: ${shortId(activeConvId)}`;
    }
  } catch (err) {
    assistantEl.remove();
    appendError(`Error: ${err.message}`);
  }
}

/* ── Main send handler ──────────────────────────────────────────────────── */
async function send() {
  const message = inputEl.value.trim();
  if (!message || isStreaming) return;

  setLoading(true);
  inputEl.value = '';
  inputEl.style.height = 'auto';

  appendMessage('user', message);

  if (sendMode === 'stream') {
    await sendStream(message);
  } else {
    await sendNormal(message);
  }

  setLoading(false);
  scheduleSidebarRefresh();
  inputEl.focus();
}

/* ── Mode toggle ────────────────────────────────────────────────────────── */
modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    sendMode = btn.dataset.mode;
    modeBtns.forEach(b => b.classList.toggle('active', b === btn));
  });
});

if (batchToggleBtn) {
  batchToggleBtn.addEventListener('click', () => {
    if (isStreaming) return;
    if (isBatchRenderEnabled) {
      finalizeRenderBatch();
    }
    isBatchRenderEnabled = !isBatchRenderEnabled;
    updateBatchToggleUI();
  });
}

/* ── New conversation ───────────────────────────────────────────────────── */
newChatBtn.addEventListener('click', () => {
  activeConvId = null;
  messagesEl.innerHTML = '';
  chatTitle.textContent = 'New conversation';
  // Refresh sidebar active state
  convListEl.querySelectorAll('.conv-item').forEach(el => el.classList.remove('active'));
  inputEl.focus();
});

messagesEl.addEventListener('scroll', () => {
  shouldAutoScroll = isNearBottom();
});

/* ── Input events ───────────────────────────────────────────────────────── */
sendBtn.addEventListener('click', send);

inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

// Auto-resize textarea
inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 160) + 'px';
});

/* ── Init ───────────────────────────────────────────────────────────────── */
updateBatchToggleUI();
loadConversations();
inputEl.focus();
