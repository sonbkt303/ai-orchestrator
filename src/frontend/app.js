/* ── Config ─────────────────────────────────────────────────────────────── */
const API_BASE = 'http://localhost:3000/ai';

/* ── State ──────────────────────────────────────────────────────────────── */
let activeConvId = null;
let isStreaming = false;
let sendMode = 'stream'; // 'stream' | 'normal'

/* ── DOM refs ───────────────────────────────────────────────────────────── */
const messagesEl  = document.getElementById('messages');
const inputEl     = document.getElementById('input');
const sendBtn     = document.getElementById('send-btn');
const newChatBtn  = document.getElementById('new-chat-btn');
const convListEl  = document.getElementById('conv-list');
const chatTitle   = document.getElementById('chat-title');
const modeBtns    = document.querySelectorAll('.mode-btn');

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

function setLoading(loading) {
  isStreaming = loading;
  sendBtn.disabled = loading;
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
  scrollBottom();
  return el;
}

function appendError(text) {
  const el = document.createElement('div');
  el.className = 'msg error';
  el.textContent = text;
  messagesEl.appendChild(el);
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
          assistantEl.textContent += parsed.text;
          scrollBottom();
        }

        if (parsed.conversationId) {
          activeConvId = parsed.conversationId;
          chatTitle.textContent = `conv: ${shortId(activeConvId)}`;
        }

        if (parsed.error) {
          assistantEl.remove();
          appendError(`Stream error: ${parsed.error}`);
          return;
        }
      }
    }
  } catch (err) {
    assistantEl.remove();
    appendError(`Error: ${err.message}`);
  } finally {
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
  await loadConversations();
  inputEl.focus();
}

/* ── Mode toggle ────────────────────────────────────────────────────────── */
modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    sendMode = btn.dataset.mode;
    modeBtns.forEach(b => b.classList.toggle('active', b === btn));
  });
});

/* ── New conversation ───────────────────────────────────────────────────── */
newChatBtn.addEventListener('click', () => {
  activeConvId = null;
  messagesEl.innerHTML = '';
  chatTitle.textContent = 'New conversation';
  // Refresh sidebar active state
  convListEl.querySelectorAll('.conv-item').forEach(el => el.classList.remove('active'));
  inputEl.focus();
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
loadConversations();
inputEl.focus();
