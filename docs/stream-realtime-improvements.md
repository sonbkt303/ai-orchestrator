# Cải thiện hiển thị Stream Response theo thời gian thực

> **Mục tiêu:** Test từng giải pháp độc lập, đánh giá độ hiệu quả thực tế trước khi tích hợp toàn bộ.  
> **Phương pháp:** Mỗi giải pháp có section riêng với: vấn đề → nguyên nhân gốc → thay đổi code → cách đo kết quả.

---

## Tổng quan pipeline stream hiện tại

```
AI Provider  →  gateway.service  →  ai.service (onChunk)  →  stream.service  →  HTTP SSE  →  app.js (frontend)
```

Độ trễ cảm nhận có thể xảy ra ở **bất kỳ mắt xích** nào trong pipeline trên.  
Các giải pháp dưới đây xử lý từng mắt xích theo thứ tự ưu tiên từ cao đến thấp.

---

## Giải pháp 1 — Bỏ `console.log("fullText", fullText)` trong onChunk

**Ưu tiên:** 🔴 Cao nhất — tác động tức thì, không rủi ro

### Vấn đề

File: `src/services/ai.service.ts`, dòng 97–98

```typescript
onChunk: (chunk) => {
  chunkCount += 1;
  fullText += chunk;
  console.log("fullText", fullText);  // ← VẤN ĐỀ
  onChunk(chunk);
},
```

`onChunk` được gọi với **mỗi token** từ AI provider (có thể là 1–5 ký tự mỗi lần).  
Mỗi lần gọi, `console.log` in ra toàn bộ `fullText` đang tích lũy — nghĩa là log này tăng kích thước theo cấp số cộng.

### Nguyên nhân gốc

- `console.log` là blocking I/O đồng bộ trong Node.js  
- Khi response dài 500 từ ≈ 700 token, log cuối cùng sẽ in ~2000–3000 ký tự  
- Tổng lượng stdout output: `n*(n+1)/2` ký tự nếu mỗi token 1 ký tự → O(n²) complexity  
- Event loop bị block nhẹ → chunk tiếp theo bị trễ → frontend thấy giật

### Thay đổi cần làm

```typescript
// TRƯỚC
onChunk: (chunk) => {
  chunkCount += 1;
  fullText += chunk;
  console.log("fullText", fullText);
  onChunk(chunk);
},

// SAU
onChunk: (chunk) => {
  chunkCount += 1;
  fullText += chunk;
  onChunk(chunk);
},
```

Nếu muốn giữ log để debug, dùng chu kỳ thay vì mỗi chunk:

```typescript
onChunk: (chunk) => {
  chunkCount += 1;
  fullText += chunk;
  if (chunkCount % 20 === 0) {
    console.log(`[ai.service] chunk #${chunkCount}, chars so far: ${fullText.length}`);
  }
  onChunk(chunk);
},
```

### Cách test và đo kết quả

1. Mở DevTools → Network → chọn request `POST /ai/chat/stream`  
2. Chuyển sang tab **Timing** hoặc dùng **EventStream** tab  
3. Quan sát khoảng cách thời gian giữa các event `chunk`  
4. Trước khi sửa: mở Terminal → chạy server → quan sát stdout output khi chat  
5. So sánh khoảng cách chunk trước và sau khi bỏ log

**Metric đo:**
- Khoảng cách trung bình giữa 2 event `chunk` (ms) trong DevTools EventStream
- Thời gian từ khi nhận chunk đầu tiên đến khi có visible text trên UI

---

## Giải pháp 2 — Tắt `responseDelayMs` cho luồng stream

**Ưu tiên:** 🔴 Cao — ảnh hưởng trực tiếp time-to-first-token

### Vấn đề

File: `src/services/ai.service.ts`, dòng 88–91 (hiện đang comment out)  
File: `src/config/index.ts`, dòng 13

```typescript
// config/index.ts
responseDelayMs: parseInt(process.env.AI_RESPONSE_DELAY_MS ?? '5000', 10),
//                                                                  ^^^^
//                                              Mặc định 5 GIÂY nếu không set env!
```

Dù code trong `chatStream` đã được comment out, **`chat` non-stream vẫn áp dụng delay** ở dòng 56–58.  
Nguy hiểm hơn: nếu ai đó bỏ comment trong chatStream → stream bị block 5s trước khi bắt đầu.

### Nguyên nhân gốc

- `AI_RESPONSE_DELAY_MS` được dùng để giả lập độ trễ khi dev/demo  
- Giá trị mặc định `5000ms` quá cao và không phân biệt stream/non-stream  
- Với stream, delay trước chunk đầu tiên làm người dùng nghĩ app bị treo

### Thay đổi cần làm

**Cách 1 — Chỉ apply delay cho non-stream (an toàn nhất):**

Không thay đổi code vì comment đã đúng. Chỉ cần đảm bảo block này không bị uncomment.

**Cách 2 — Đổi default sang 0 trong config:**

```typescript
// config/index.ts
responseDelayMs: parseInt(process.env.AI_RESPONSE_DELAY_MS ?? '0', 10),
//                                                              ^
//                                                       Mặc định 0
```

**Cách 3 — Thêm flag riêng cho stream delay:**

```typescript
// types/index.ts — thêm vào AppConfig.ai
streamDelayMs: number;  // riêng cho stream, nên luôn là 0 trong prod

// config/index.ts
streamDelayMs: parseInt(process.env.AI_STREAM_DELAY_MS ?? '0', 10),
responseDelayMs: parseInt(process.env.AI_RESPONSE_DELAY_MS ?? '0', 10),
```

### Cách test và đo kết quả

1. Set `AI_RESPONSE_DELAY_MS=5000` trong `.env` → test non-stream → xác nhận delay hoạt động  
2. Xác nhận stream **không** bị delay (block comment đang đúng)  
3. Thay đổi default thành `0` → restart server → đo lại  
4. Dùng `curl` để đo Time-to-First-Byte:

```bash
curl -X POST http://localhost:3000/ai/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}' \
  -o /dev/null \
  -w "Time to first byte: %{time_starttransfer}s\n"
```

**Metric đo:**
- `time_starttransfer` (TTFB) — thời gian đến khi nhận byte đầu tiên
- Mục tiêu: < 1s (chỉ phụ thuộc model latency, không có artificial delay)

---

## Giải pháp 3 — Batch render ở frontend với `requestAnimationFrame`

**Ưu tiên:** 🟡 Trung bình cao — ảnh hưởng visual smoothness

### Vấn đề

File: `src/frontend/app.js`, dòng 150–156

```javascript
if (parsed.text !== undefined) {
  assistantEl.textContent += parsed.text;  // ← DOM update mỗi token
  scrollBottom();                           // ← scrollTop mỗi token
}
```

AI provider gửi 10–30 token/giây. Mỗi token trigger:
1. Cộng vào `textContent` → parse + serialize toàn bộ text node  
2. Layout reflow (tính lại chiều cao element)  
3. `scrollTop` write → forced synchronous layout  

### Nguyên nhân gốc

- `textContent` assignment không phải append — nó xóa và tạo lại text node mỗi lần  
- `scrollBottom()` gọi `scrollHeight` (read) rồi `scrollTop` (write) → layout thrashing  
- Ở 30 token/s với response dài → 30 forced reflow/s → janky UI

### Thay đổi cần làm

Thay vì update DOM mỗi token, dùng buffer và flush theo animation frame (≈16ms):

```javascript
/* ── Stream render helper ───────────────────────────────────────────────── */
function createStreamRenderer(el) {
  let pendingText = '';
  let rafId = null;

  function flush() {
    if (pendingText) {
      el.textContent += pendingText;
      pendingText = '';
      scrollBottom();
    }
    rafId = null;
  }

  return {
    push(chunk) {
      pendingText += chunk;
      if (!rafId) {
        rafId = requestAnimationFrame(flush);
      }
    },
    finish() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      flush(); // flush remaining
    },
  };
}
```

Áp dụng trong `sendStream`:

```javascript
async function sendStream(message) {
  const assistantEl = appendMessage('assistant', '');
  assistantEl.classList.add('streaming');
  const renderer = createStreamRenderer(assistantEl); // ← dùng renderer

  try {
    // ... fetch setup không đổi ...

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // ... parse buffer không đổi ...

      for (const line of lines) {
        // ... parse SSE không đổi ...

        if (parsed.text !== undefined) {
          renderer.push(parsed.text);  // ← thay vì textContent +=
        }
        // ... xử lý conversationId, error không đổi ...
      }
    }
  } catch (err) {
    // ...
  } finally {
    renderer.finish();  // ← flush phần còn lại
    assistantEl.classList.remove('streaming');
  }
}
```

### Cách test và đo kết quả

1. Mở DevTools → **Performance** tab → bắt đầu record  
2. Gửi một tin nhắn dài (yêu cầu model viết 500 từ)  
3. Dừng record → xem **Frames** section  
4. So sánh số lượng layout/reflow events trước và sau khi sửa

**Metric đo:**
- FPS trong Performance tab khi đang stream (mục tiêu: stable 60fps)
- Số lượng `Layout` events trong 1 giây streaming
- Cảm quan: text có xuất hiện mượt hay từng token riêng lẻ?

> **Lưu ý:** `requestAnimationFrame` batches ở 60fps nên tối đa 60 DOM update/s thay vì 30+ update/s hiện tại.  
> Nếu browser tab không focused, rAF bị throttle xuống 1fps → dùng `setTimeout(flush, 16)` làm fallback.

---

## Giải pháp 4 — Gọi `res.flush()` sau mỗi `res.write()` trong SSE

**Ưu tiên:** 🟡 Trung bình — quan trọng khi deploy sau proxy

### Vấn đề

File: `src/services/stream.service.ts`, dòng 16–18

```typescript
export function writeChunk(res: Response, chunk: string, connectionId = 'unknown'): void {
  res.write(`event: chunk\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
  log(connectionId, 'chunk', { chars: chunk.length });
  // ← Không gọi flush() — dữ liệu có thể bị giữ trong TCP buffer
}
```

Express/Node.js HTTP có internal write buffer. Khi response nhỏ, Node.js có thể giữ data trong buffer trước khi gửi xuống socket để tối ưu TCP throughput (Nagle algorithm).

### Nguyên nhân gốc

- `res.write()` không đảm bảo data được gửi ngay lên socket  
- Express `Response` kế thừa từ Node.js `ServerResponse` — có internal buffer  
- Header `X-Accel-Buffering: no` chỉ tắt buffering ở nginx, không ảnh hưởng Node.js buffer  
- `res.flushHeaders()` chỉ flush headers, không flush body chunks  

### Thay đổi cần làm

Express `Response` có thể có method `flush()` nếu middleware compression (như `compression`) được dùng. Nếu không, cần explicit flush qua Node.js API:

```typescript
// stream.service.ts

// Helper an toàn — tương thích cả có và không có compression middleware
function flushResponse(res: Response): void {
  // Nếu dùng compression middleware (express-compression, compression)
  if (typeof (res as unknown as { flush?: () => void }).flush === 'function') {
    (res as unknown as { flush: () => void }).flush();
    return;
  }
  // Node.js native socket flush
  const socket = (res as unknown as { socket?: { cork?: () => void; uncork?: () => void } }).socket;
  if (socket?.uncork) {
    socket.uncork();
  }
}

export function writeChunk(res: Response, chunk: string, connectionId = 'unknown'): void {
  res.write(`event: chunk\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
  flushResponse(res);  // ← flush ngay sau write
  log(connectionId, 'chunk', { chars: chunk.length });
}
```

**Kiểm tra xem project có dùng compression không:**

```bash
# Trong terminal project
grep -r "compression" package.json src/
```

Nếu có, cần import type từ `compression` package.

### Cách test và đo kết quả

Test này quan trọng nhất khi chạy sau **nginx hoặc load balancer**:

1. **Local (không proxy):** Sự khác biệt có thể không rõ vì localhost không bị Nagle algorithm  
2. **Với proxy:** Dùng nginx làm reverse proxy → quan sát độ trễ chunk rõ hơn

```bash
# Dùng curl để quan sát raw SSE chunks
curl -N -X POST http://localhost:3000/ai/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message":"Count from 1 to 10 slowly"}' \
  --no-buffer
```

**Metric đo:**
- Thời gian giữa 2 dòng output trong curl (ms) — với `--no-buffer` tắt buffering phía client
- Nếu thấy chunks đến theo batch (nhiều cùng lúc) thay vì từng cái → đây là nguyên nhân

---

## Giải pháp 5 — Truyền `AbortSignal` xuống gateway để hủy stream khi client disconnect

**Ưu tiên:** 🟡 Trung bình — tiết kiệm tài nguyên, không ảnh hưởng tốc độ hiển thị

### Vấn đề

File: `src/controllers/ai.controller.ts`, dòng 46–52

```typescript
req.on('close', () => {
  console.log('[ai.controller] client disconnected', {
    streamId,
    elapsedMs: Date.now() - startedAt,
    chunkCount,
  });
  // ← Chỉ LOG, không hủy bất kỳ thứ gì!
});
```

Khi client đóng tab hoặc refresh, server **vẫn tiếp tục** gọi AI provider cho đến khi xong, vẫn lưu DB, vẫn tốn token.

### Nguyên nhân gốc

- Không có cơ chế cancel propagation từ controller xuống service xuống gateway  
- `AbortController` trong `gateway.service.ts` chỉ để timeout, không có signal từ ngoài  
- `GatewayStreamParams` không có field `signal`

### Thay đổi cần làm

**Bước 1 — Thêm `signal` vào types:**

```typescript
// types/index.ts
export interface GatewayStreamParams {
  messages: Message[];
  onChunk: ChunkCallback;
  signal?: AbortSignal;  // ← thêm optional
}

export interface ChatStreamParams extends ChatParams {
  onChunk: ChunkCallback;
  onDone: DoneCallback;
  signal?: AbortSignal;  // ← thêm optional
}
```

**Bước 2 — Gateway merge signal vào fetch:**

```typescript
// gateway.service.ts — trong hàm stream()
export async function stream({ messages, onChunk, signal }: GatewayStreamParams): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  // Nếu caller abort → forward xuống fetch
  signal?.addEventListener('abort', () => controller.abort(signal.reason));

  // ... phần còn lại không đổi
}
```

**Bước 3 — ai.service nhận và truyền signal:**

```typescript
// ai.service.ts
export async function chatStream({
  message,
  conversationId,
  onChunk,
  onDone,
  signal,  // ← nhận thêm
}: ChatStreamParams): Promise<void> {
  // ...
  await gatewayService.stream({
    messages,
    onChunk: (chunk) => {
      if (signal?.aborted) return;  // ← dừng nếu đã abort
      chunkCount += 1;
      fullText += chunk;
      onChunk(chunk);
    },
    signal,  // ← truyền xuống
  });
  // ...
}
```

**Bước 4 — Controller tạo và truyền signal:**

```typescript
// ai.controller.ts
export async function chatStream(req: Request, res: Response): Promise<void> {
  // ...
  const abortController = new AbortController();

  req.on('close', () => {
    console.log('[ai.controller] client disconnected', { streamId, elapsedMs: Date.now() - startedAt, chunkCount });
    abortController.abort('client disconnected');  // ← abort khi client rời đi
  });

  streamService.initSSE(res, streamId);

  try {
    await aiService.chatStream({
      message: message.trim(),
      conversationId,
      onChunk: (chunk) => {
        chunkCount += 1;
        streamService.writeChunk(res, chunk, streamId);
      },
      onDone: (meta) => streamService.writeDone(res, meta, streamId),
      signal: abortController.signal,  // ← truyền signal
    });
  }
  // ...
}
```

### Cách test và đo kết quả

1. Mở terminal server, quan sát logs  
2. Gửi request → **ngay lập tức** đóng tab hoặc click Stop  
3. **Trước khi sửa:** Server vẫn tiếp tục log cho đến khi xong  
4. **Sau khi sửa:** Server log "client disconnected" và dừng xử lý

**Metric đo:**
- Token tiêu thụ trên AI provider dashboard (so sánh trước/sau)
- CPU/memory của server trong quá trình bị disconnect nhiều lần liên tiếp

---

## Giải pháp 6 — Sửa timeout để bao phủ toàn bộ thời gian đọc stream

**Ưu tiên:** 🟢 Thấp hơn — fix lỗi ẩn, không ảnh hưởng speed thông thường

### Vấn đề

File: `src/services/gateway.service.ts`, dòng 40–74

```typescript
export async function stream({ messages, onChunk }: GatewayStreamParams): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(/* ... */);
  } finally {
    clearTimeout(timer);  // ← Timer bị clear sau khi nhận HEADERS
                          //   Nhưng đọc BODY (stream thật sự) chưa bắt đầu!
  }

  // ... đọc body có thể mất vài phút nếu model chậm
  for await (const rawChunk of res.body as unknown as AsyncIterable<Uint8Array>) {
    // Không còn timeout bảo vệ ở đây!
  }
}
```

### Nguyên nhân gốc

- `clearTimeout` được đặt trong `finally` của khối `fetch` → clear sau khi có response headers  
- Body stream (nhận từng token) xảy ra **sau** khi headers về  
- Nếu model bị treo giữa chừng (không gửi `[DONE]`, không đóng connection), stream sẽ hang mãi  

### Thay đổi cần làm

```typescript
export async function stream({ messages, onChunk }: GatewayStreamParams): Promise<void> {
  const controller = new AbortController();
  // ← Không đặt timer ở đây
  let timer: ReturnType<typeof setTimeout> | null = null;

  let res: Response;
  try {
    res = await fetch(`${config.ai.gatewayUrl}/chat/completions`, {
      method: 'POST',
      headers: { /* ... */ },
      body: JSON.stringify({ model: config.ai.model, messages, stream: true }),
      signal: controller.signal,
    });
  } catch (err) {
    throw err;
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gateway error ${res.status}: ${body}`);
  }

  if (!res.body) {
    throw new Error('Gateway returned empty response body');
  }

  // ← Bắt đầu timeout SAU KHI nhận được headers thành công
  //   Timeout này bảo vệ quá trình đọc body
  timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const decoder = new TextDecoder();
    let buffer = '';

    for await (const rawChunk of res.body as unknown as AsyncIterable<Uint8Array>) {
      buffer += decoder.decode(rawChunk, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') return;
        let parsed: unknown;
        try { parsed = JSON.parse(data); } catch { continue; }
        const delta = (parsed as { choices?: Array<{ delta?: { content?: string } }> })
          ?.choices?.[0]?.delta?.content;
        if (delta) onChunk(delta);
      }
    }
  } finally {
    if (timer) clearTimeout(timer);  // ← Clear khi đọc xong hoặc lỗi
  }
}
```

### Cách test và đo kết quả

Vấn đề này khó test trực tiếp nhưng có thể simulate:

```bash
# Dùng nc để simulate hung stream (gửi headers nhưng không gửi body)
# Hoặc đặt AI_TIMEOUT_MS=3000 và dùng model chậm
```

**Metric đo:**
- Nếu model bị treo: `AbortError` phải được throw đúng sau `timeoutMs` giây  
- Log trong `ai.service.ts` phải xuất hiện `status: 'timeout'` trong DB

---

## Giải pháp 7 — Heartbeat SSE để giữ connection qua proxy

**Ưu tiên:** 🟢 Thấp — chỉ cần khi deploy sau nginx/ALB/CDN

### Vấn đề

Nhiều reverse proxy (nginx, AWS ALB, Cloudflare) có **idle connection timeout** mặc định 60s.  
Khi model "nghĩ" lâu trước khi gửi token đầu tiên, proxy có thể đóng connection → client thấy error.

### Nguyên nhân gốc

- SSE connection không có activity → proxy timeout reset connection  
- Không có heartbeat → client không biết server còn sống hay bị treo

### Thay đổi cần làm

**stream.service.ts — thêm heartbeat:**

```typescript
export function startHeartbeat(res: Response, intervalMs = 10000): ReturnType<typeof setInterval> {
  return setInterval(() => {
    if (!res.writableEnded) {
      res.write(': heartbeat\n\n');  // SSE comment — client không thấy, chỉ giữ connection
    }
  }, intervalMs);
}

export function stopHeartbeat(heartbeatId: ReturnType<typeof setInterval>): void {
  clearInterval(heartbeatId);
}
```

**ai.controller.ts — dùng heartbeat:**

```typescript
export async function chatStream(req: Request, res: Response): Promise<void> {
  // ...
  streamService.initSSE(res, streamId);
  const heartbeatId = streamService.startHeartbeat(res);  // ← bắt đầu heartbeat

  try {
    await aiService.chatStream({ /* ... */ });
  } catch (err) {
    streamService.writeError(res, err instanceof Error ? err.message : 'Unknown error', streamId);
  } finally {
    streamService.stopHeartbeat(heartbeatId);  // ← dừng khi xong
    streamService.close(res, streamId);
  }
}
```

**Frontend — event `message` vs SSE comment:**

SSE comment (dòng bắt đầu bằng `:`) **không trigger** event listener nên frontend không cần thay đổi.

### Cách test và đo kết quả

1. Cấu hình nginx với `proxy_read_timeout 15s` (thấp hơn bình thường để test)  
2. Dùng model với độ trễ cao hoặc set `AI_RESPONSE_DELAY_MS=20000`  
3. **Không có heartbeat:** Connection bị đóng sau 15s kể từ khi không có data  
4. **Có heartbeat:** Connection tồn tại qua suốt thời gian chờ

---

## Thứ tự test đề xuất

| # | Giải pháp | File thay đổi | Effort | Impact |
|---|-----------|---------------|--------|--------|
| 1 | Bỏ log fullText mỗi chunk | `ai.service.ts` | 1 dòng | 🔴 Cao |
| 2 | Đổi default responseDelayMs = 0 | `config/index.ts` | 1 dòng | 🔴 Cao |
| 3 | Batch render với rAF | `frontend/app.js` | ~30 dòng | 🔴 Cao |
| 4 | Flush sau write | `stream.service.ts` | ~10 dòng | 🟡 Tùy môi trường |
| 5 | AbortSignal propagation | 4 files | ~40 dòng | 🟡 Reliability |
| 6 | Fix stream timeout | `gateway.service.ts` | ~20 dòng | 🟢 Bug fix |
| 7 | SSE Heartbeat | `stream.service.ts`, `ai.controller.ts` | ~15 dòng | 🟢 Deploy only |

### Quy trình test chuẩn cho mỗi giải pháp

```
1. Ghi baseline metrics (DevTools Timing, curl TTFB, FPS)
2. Áp dụng 1 giải pháp duy nhất
3. Restart server
4. Đo lại cùng metric
5. Ghi nhận kết quả
6. Quyết định giữ hay rollback
7. Chuyển sang giải pháp tiếp theo
```

### Công cụ đo

- **Chrome DevTools → Network → EventStream tab:** Xem từng SSE event và timestamp
- **Chrome DevTools → Performance tab:** Xem FPS, Layout events, reflow count  
- **curl với `--no-buffer -N`:** Xem raw chunks tới server như thế nào  
- **Server console:** Đếm chunk frequency, latency giữa các chunk  
- **Lighthouse:** Không phù hợp cho streaming UX

---

## Tham khảo

- [MDN — Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Node.js HTTP — res.write() buffering](https://nodejs.org/api/http.html#responsewritechunk-encoding-callback)
- [requestAnimationFrame vs setTimeout for UI updates](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [AbortController — Fetch cancellation](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
