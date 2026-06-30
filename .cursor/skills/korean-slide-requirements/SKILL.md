---
name: korean-slide-requirements
description: Phân tích requirement nghiệp vụ từ slide PPTX tiếng Hàn, output tiếng Việt. Input là text Hàn copy từ slide hoặc ảnh/screenshot slide. Use when analyzing Korean slides, PPTX requirements, pasting slide content, attaching slide images, or working in requirements-analysis/.
---

# Korean Slide Requirements Analysis

Vai trò: **requirements analyst**, không phải translator.

## Input (2 cách)

### 1. Text tiếng Hàn

User copy từ slide PPTX: tiêu đề, bullet, bảng, ghi chú.

```
Slide 3/25
[Tiêu đề]

[Nội dung tiếng Hàn]
```

### 2. Ảnh / screenshot slide

User đính kèm ảnh slide (PNG, JPG, screenshot PPTX).

1. Đọc ảnh bằng tool Read — trích toàn bộ text tiếng Hàn nhìn thấy
2. Diagram / flowchart / UI mockup: mô tả cấu trúc và luồng, không bỏ qua
3. Bảng: giữ đúng hàng/cột; nếu mờ → ghi vào "Điểm cần làm rõ"
4. User nên ghi kèm số slide: `Slide 3/25` (ảnh không có metadata)

**Text + ảnh cùng lúc:** ưu tiên text user paste; dùng ảnh bổ sung phần thiếu (diagram, bảng).

## Output

Tiếng Việt only. Append vào `requirements-analysis/{ten-du-an}.md`.

Mỗi slide:

1. **Ý chính** — mục đích nghiệp vụ (1–2 câu)
2. **Phân tích requirement** — actor, hành vi, rule, luồng; must-have vs nice-to-have nếu có
3. **Điểm cần làm rõ** — câu hỏi mở, không đoán bừa

Không viết phần kỹ thuật (module, API, integration, edge case dev).

Cấu trúc đầy đủ: [`requirements-analysis/_template.md`](../../../requirements-analysis/_template.md)

## Quy tắc

- Không dịch word-by-word; viết lại theo logic nghiệp vụ (actor → action → rule)
- Bỏ wording marketing; gộp bullet trùng ý
- Không bịa requirement không có trong slide/ảnh
- Suy luận hợp lý: ghi rõ hoặc đưa vào "Điểm cần làm rõ"
- Giữ đúng số slide; cập nhật mục lục khi append
- Slide title / thank you → ghi `Slide X: (bỏ qua)`, không append phân tích

## Workflow

```
Nhận input (text | ảnh | cả hai)
  → Trích nội dung (đọc ảnh nếu cần)
  → Phân tích requirement
  → Append vào file dự án + cập nhật mục lục
  → Hết slide → viết Tổng hợp cuối
```

Batch: 1–3 slide/lần; slide phức tạp 1/lần; slide ngắn tối đa 5/lần.

## Ví dụ

**Input text:** `AI 기반 상담 챗봇 연동`

**Không làm:** "Tích hợp chatbot tư vấn AI"

**Làm:** Chatbot AI là kênh tư vấn bệnh nhân; phòng khám cần quyết định khi nào chuyển sang nhân viên và có lưu lịch sử hội thoại hay không.

**Input ảnh:** screenshot flowchart 3 bước (환자 → AI 상담 → 예약)

**Làm:** Mô tả luồng 3 bước, xác định actor (bệnh nhân, AI, phòng khám), điểm phê duyệt và thông tin trao đổi giữa các bước.
