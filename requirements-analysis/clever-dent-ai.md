# Clever Dent AI — Phân tích requirement

| Trường | Giá trị |
|--------|---------|
| Nguồn | PPTX tiếng Hàn |
| Ngày phân tích | 2026-06-30 |
| Tổng số slide | 17 |
| Trạng thái | Hoàn thành |

## Mục lục

- [Clever Dent AI — Phân tích requirement](#clever-dent-ai--phân-tích-requirement)
  - [Mục lục](#mục-lục)
  - [Slide 4: AI Agent sinh homepage](#slide-4-ai-agent-sinh-homepage)
    - [Ý chính](#ý-chính)
    - [Phân tích requirement](#phân-tích-requirement)
    - [Điểm cần làm rõ](#điểm-cần-làm-rõ)
  - [Slide 5: Chính sách đặt lịch (Clever Dent)](#slide-5-chính-sách-đặt-lịch-clever-dent)
    - [Ý chính](#ý-chính-1)
    - [Phân tích requirement](#phân-tích-requirement-1)
    - [Điểm cần làm rõ](#điểm-cần-làm-rõ-1)
  - [Slide 6: Gợi ý đặt lịch AI](#slide-6-gợi-ý-đặt-lịch-ai)
    - [Ý chính](#ý-chính-2)
    - [Phân tích requirement](#phân-tích-requirement-2)
    - [Điểm cần làm rõ](#điểm-cần-làm-rõ-2)
  - [Slide 7: Test case gợi ý đặt lịch AI](#slide-7-test-case-gợi-ý-đặt-lịch-ai)
    - [Ý chính](#ý-chính-3)
    - [Phân tích requirement](#phân-tích-requirement-3)
    - [Điểm cần làm rõ](#điểm-cần-làm-rõ-3)
  - [Slide 8: Tạo và vận hành homepage AI](#slide-8-tạo-và-vận-hành-homepage-ai)
    - [Ý chính](#ý-chính-4)
    - [Phân tích requirement](#phân-tích-requirement-4)
    - [Điểm cần làm rõ](#điểm-cần-làm-rõ-4)
  - [Slide 9: AI Homepage Template 1](#slide-9-ai-homepage-template-1)
    - [Ý chính](#ý-chính-5)
    - [Phân tích requirement](#phân-tích-requirement-5)
    - [Điểm cần làm rõ](#điểm-cần-làm-rõ-5)
  - [Slide 10: Template 1 — Chính sách sinh nội dung AI](#slide-10-template-1--chính-sách-sinh-nội-dung-ai)
    - [Ý chính](#ý-chính-6)
    - [Phân tích requirement](#phân-tích-requirement-6)
    - [Điểm cần làm rõ](#điểm-cần-làm-rõ-6)
  - [Slide 11: Template 1 — Chính sách nội dung (Đặt lịch, Vị trí, Footer)](#slide-11-template-1--chính-sách-nội-dung-đặt-lịch-vị-trí-footer)
    - [Ý chính](#ý-chính-7)
    - [Phân tích requirement](#phân-tích-requirement-7)
    - [Điểm cần làm rõ](#điểm-cần-làm-rõ-7)
  - [Slide 12–17: Giao diện Template 1 (mockup UI)](#slide-1217-giao-diện-template-1-mockup-ui)
    - [Ý chính](#ý-chính-8)
    - [Phân tích requirement](#phân-tích-requirement-8)
    - [Điểm cần làm rõ](#điểm-cần-làm-rõ-8)
  - [Tổng hợp cuối](#tổng-hợp-cuối)
    - [Phạm vi hệ thống](#phạm-vi-hệ-thống)
    - [Actor / vai trò người dùng](#actor--vai-trò-người-dùng)
    - [Chức năng chính](#chức-năng-chính)
    - [Luồng nghiệp vụ quan trọng](#luồng-nghiệp-vụ-quan-trọng)
    - [Ràng buộc nghiệp vụ \& phi chức năng](#ràng-buộc-nghiệp-vụ--phi-chức-năng)
    - [Giả định \& rủi ro](#giả-định--rủi-ro)
    - [Câu hỏi cần confirm với khách hàng](#câu-hỏi-cần-confirm-với-khách-hàng)

---

## Slide 4: AI Agent sinh homepage

**Loại slide:** bối cảnh | luồng

### Ý chính

Slide mô tả bài toán thị trường (phòng khám nha thiếu kênh đặt lịch online), mục tiêu sản phẩm (AI tự tạo homepage + đồng bộ đặt lịch vào Clever Dent), và luồng end-to-end giữa phòng khám — AI Agent — bệnh nhân. Mọi nội dung AI và xác nhận lịch đều cần phê duyệt cuối từ phòng khám.

### Phân tích requirement

- **Ai làm gì:**
  - **Phòng khám (Clinic):** nhập thông tin cơ bản (tên PK, bác sĩ, chuyên khoa); preview & publish homepage; vào Clever Dent xem thông báo đặt lịch; duyệt gợi ý AI và xác nhận lịch cuối cùng
  - **AI Agent:** sinh text/hình theo section; cấu hình layout từ template; phát hành domain; phân tích yêu cầu đặt lịch và gợi ý khung giờ + hạng mục điều trị; gửi tin xác nhận (SMS/WhatsApp)
  - **Bệnh nhân (Patient):** xem homepage; gửi yêu cầu đặt lịch (họ tên, liên hệ, ngày/giờ mong muốn, ghi chú); nhận tin xác nhận

- **Hệ thống phải:**
  - Tự động tạo homepage responsive từ thông tin phòng khám và publish URL/domain
  - Đồng bộ đặt lịch từ homepage vào Clever Dent — một màn hình quản lý, không rời rạc email/app riêng
  - Gợi ý AI cho slot thời gian và treatment item trước khi phòng khám confirm
  - Human-in-the-loop: nội dung AI và xác nhận lịch **không** final cho đến khi phòng khám duyệt
  - Layout mobile-first / responsive (đa số bệnh nhân tìm nha khoa qua Google/Maps trên mobile)

- **Điều kiện / ràng buộc:**
  - Khác biệt so với AI homepage builder chung (vd. Durable): tích hợp đặt lịch thống nhất, không phân mảnh kênh
  - Bệnh nhân discover site qua Google Search / Google Maps
  - Kênh thông báo: SMS hoặc WhatsApp

- **Must-have / nice-to-have:**
  - **Must-have:** tạo homepage + publish URL, đặt lịch online, sync Clever Dent, gợi ý AI slot/điều trị, phê duyệt phòng khám, tin xác nhận, mobile responsive
  - **Nice-to-have (chưa nêu rõ mức ưu tiên):** cả SMS lẫn WhatsApp (cần xác định market nào dùng kênh nào)

- **Luồng nghiệp vụ (5 bước trên slide):**
  1. Phòng khám nhập thông tin → AI sinh nội dung và cấu hình site
  2. Phòng khám preview & publish → domain tự cấp
  3. Bệnh nhân tìm qua Google/Maps → xem thông tin → đặt lịch
  4. Phòng khám vào Clever Dent → thấy thông báo → xem gợi ý AI (slot + điều trị)
  5. Phòng khám xác nhận → gửi tin xác nhận cho bệnh nhân

### Điểm cần làm rõ

- ~~Domain tự động: subdomain platform hay custom domain?~~ → Slide 8: `{tên-pk}.cleverdent.ai`, PK sửa phần tên; không custom domain khác
- Khi phòng khám từ chối/sửa gợi ý AI — quy trình liên hệ lại bệnh nhân thế nào?
- Đặt lịch trùng slot — ai quyết định slot cuối cùng?
- SMS vs WhatsApp: market target và kênh bắt buộc từng region
- Google Search/Maps: chỉ tìm kiếm tự nhiên hay có hồ sơ doanh nghiệp Google? (Slide 8: PK tự đăng ký URL lên Google Business Profile)
- Ngôn ngữ homepage và tin nhắn — đa ngôn ngữ?
- Quyền trong Clever Dent: ai được xác nhận lịch?

---

## Slide 5: Chính sách đặt lịch (Clever Dent)

**Loại slide:** ràng buộc | luồng

### Ý chính

Slide định nghĩa quy tắc nghiệp vụ quản lý đặt lịch trong Clever Dent: hai kênh tạo lịch (phòng khám trực tiếp vs bệnh nhân qua homepage), trạng thái **Requested** mới cho yêu cầu từ web chưa được xác nhận, và các chính sách hiển thị, trùng lặp, hủy, ghép bệnh nhân cũ. Mọi yêu cầu từ homepage đều cần phòng khám duyệt thủ công; AI chỉ hỗ trợ gợi ý khi duyệt.

### Phân tích requirement

- **Ai làm gì:**
  - **Phòng khám:** tạo lịch trực tiếp trong Clever Dent; xem yêu cầu **Requested** trên lịch; kiểm tra 7 tiêu chí trước khi duyệt; chuyển Requested → Confirmed hoặc Canceled; quyết định cuối về trùng lặp; hủy lịch thay bệnh nhân; chọn liên kết hoặc không liên kết hồ sơ bệnh nhân cũ
  - **Bệnh nhân:** gửi yêu cầu đặt lịch qua homepage (không được xác nhận ngay); muốn hủy phải liên hệ phòng khám trực tiếp — **không** hủy qua homepage trong phạm vi giai đoạn này
  - **Hệ thống / AI:** gợi ý đặt lịch dựa trên thông tin yêu cầu (chi tiết ở slide sau); tìm ứng viên khớp bệnh nhân cũ theo tên + SĐT; hiển thị **매칭 후보** (ứng viên khớp) nhưng không tự liên kết

- **Hệ thống phải:**
  - Hỗ trợ hai kênh tạo lịch: Clever Dent (nội bộ) và homepage (yêu cầu bệnh nhân)
  - Thêm trạng thái **Requested** — bệnh nhân đã gửi yêu cầu qua homepage, chưa được phòng khám duyệt
  - Sau khi duyệt hoặc hủy, Requested chuyển sang **Confirmed** hoặc **Canceled** — cùng luồng với lịch nội bộ thông thường
  - Hiển thị Requested trên lịch Clever Dent nhưng **phân biệt rõ** với lịch đã xác nhận
  - Requested **không chiếm slot** thực tế — chỉ mang tính tham khảo; slot đó vẫn có thể đặt lịch khác cho đến khi phòng khám chuyển sang Confirmed
  - Phát hiện trùng lặp: cùng SĐT + cùng ngày + cùng giờ = trùng; cùng SĐT + cùng ngày + khác giờ = cho phép
  - Ghép bệnh nhân cũ: khớp theo **Họ tên + SĐT**; hiển thị danh sách ứng viên; nhân viên chọn Liên kết / Không liên kết; nhiều ứng viên → chọn thủ công

- **Luồng nghiệp vụ — duyệt lịch (7 tiêu chí kiểm tra):**
  1. Thông tin cơ bản bệnh nhân
  2. Ngày/giờ mong muốn
  3. Hạng mục điều trị
  4. Có phải bệnh nhân cũ không
  5. Trạng thái đặt lịch hiện tại
  6. Lịch nhân viên được phân công
  7. Ghế / phòng điều trị còn trống

- **Điều kiện / ràng buộc:**
  - Homepage không yêu cầu đăng nhập → khó ngăn trùng lặp hoàn toàn tự động; quyết định cuối thuộc nhân viên phòng khám
  - Requested không block slot → có thể có nhiều yêu cầu hoặc lịch khác cùng khung giờ cho đến khi confirm
  - Hủy lịch từ phía bệnh nhân qua web: **ngoài phạm vi** giai đoạn phát triển hiện tại
  - Không tự động liên kết hồ sơ bệnh nhân cũ — luôn cần xác nhận nhân viên

- **Must-have / nice-to-have:**
  - **Must-have:** trạng thái Requested, hiển thị phân biệt trên lịch, không chiếm slot, rule trùng SĐT+ngày+giờ, checklist 7 mục khi duyệt, ghép bệnh nhân cũ (tên+SĐT) với lựa chọn thủ công, hủy chỉ qua phòng khám
  - **Nice-to-have / slide sau:** chi tiết gợi ý AI khi duyệt lịch

### Điểm cần làm rõ

- Requested hiển thị trên lịch bằng cách nào (màu, icon, layer riêng)?
- Khi nhiều Requested cùng slot và phòng khám confirm một — xử lý các Requested còn lại thế nào?
- Trùng lặp: hệ thống cảnh báo tự động hay chỉ để nhân viên tự phán đoán?
- Ghép bệnh nhân: khớp tên chính xác hay fuzzy (viết tắt, dấu)?
- Bệnh nhân không liên kết hồ sơ cũ — tạo hồ sơ mới hay lưu dạng khách vãng lai?
- Sau Confirmed/Canceled — bệnh nhân có nhận thông báo tự động không (slide trước đề cập SMS/WhatsApp)?
- AI gợi ý khi duyệt: nội dung và mức can thiệp — ~~chờ slide tiếp theo~~ (xem Slide 6)

---

## Slide 6: Gợi ý đặt lịch AI

**Loại slide:** chức năng | luồng | ràng buộc

### Ý chính

Slide mô tả logic gợi ý đặt lịch AI trong Clever Dent: phân tích yêu cầu từ homepage cùng tình trạng vận hành phòng khám để đề xuất khung giờ, bác sĩ và lịch phù hợp. Kết quả AI chỉ mang tính tham khảo — phòng khám xem xét, điều chỉnh thủ công nếu cần, phối hợp với bệnh nhân rồi mới xác nhận. Phiên bản này **không** gợi ý giờ cho bệnh nhân ngay lúc gửi yêu cầu trên homepage.

### Phân tích requirement

- **Ai làm gì:**
  - **AI:** phân tích thông tin yêu cầu homepage + trạng thái vận hành PK; đề xuất giờ, bác sĩ, lịch tổng thể và giờ thay thế; xử lý trường hợp không có kết quả hoặc lỗi
  - **Phòng khám:** xem gợi ý AI khi duyệt yêu cầu Requested; chỉnh sửa thủ công bất kỳ đề xuất nào; kiểm tra lịch tổng thể; phối hợp với bệnh nhân; xác nhận lịch cuối cùng
  - **Bệnh nhân:** gửi yêu cầu qua homepage (không nhận gợi ý giờ realtime từ AI trong phiên bản này)

- **Hệ thống phải:**
  - Gợi ý theo thứ tự ưu tiên 7 tiêu chí (cao → thấp):
    1. Trong giờ hoạt động phòng khám
    2. Lịch khả dụng của bác sĩ được phân công
    3. Hạng mục điều trị có thể thực hiện
    4. Ghế / phòng điều trị còn trống
    5. Đủ thời lượng ước tính cho điều trị
    6. Gần với giờ bệnh nhân mong muốn nhất
    7. Trùng lịch với lịch hiện có — Clever Dent **cho phép** đặt trùng, nên **không loại** slot khỏi gợi ý vì lý do này
  - Đầu ra gợi ý: **Giờ đề xuất**, **Bác sĩ đề xuất**, **Lịch đề xuất** (cân nhắc lịch hiện tại + trạng thái điều trị), **Giờ thay thế** (khi giờ mong muốn không khả dụng)
  - Cho phép phòng khám sửa thủ công — thông tin sau khi sửa là **kết quả cuối cùng**, ưu tiên hơn gợi ý AI
  - Phân biệt hai nhóm tình huống ngoại lệ:
    - **Gợi ý thất bại** (lỗi hệ thống/dữ liệu): thiếu dữ liệu vận hành (giờ PK, lịch bác sĩ); xung đột dữ liệu realtime (dữ liệu đổi trong lúc AI tính); lỗi AI/engine
    - **Không có kết quả gợi ý** (AI chạy OK nhưng không có slot phù hợp): hết slot; bác sĩ nghỉ/không khả dụng; không đủ block thời gian liên tục; ngoài giờ hoạt động; không khớp giờ mong muốn (vd. muốn sáng, chỉ còn chiều)
  - Khi không có kết quả: vẫn có thể gợi ý thay thế; nếu không có thay thế → thông báo không có lịch khả dụng, phòng khám tự phối hợp với bệnh nhân

- **Luồng nghiệp vụ — xác nhận lịch (4 bước):**
  1. Bệnh nhân gửi yêu cầu qua homepage
  2. Phòng khám xem yêu cầu — AI gợi ý giờ / bác sĩ
  3. Phòng khám kiểm tra kết quả AI và lịch tổng thể, phối hợp với bệnh nhân
  4. Xác nhận đặt lịch

- **Điều kiện / ràng buộc:**
  - AI là công cụ hỗ trợ quyết định nội bộ cho nhân viên PK — **không** thay thế xác nhận thủ công
  - Gợi ý giờ cho bệnh nhân **trong lúc đặt** trên homepage: **ngoài phạm vi** phiên bản này
  - Clever Dent cho phép đặt lịch trùng → AI vẫn có thể gợi ý slot đã có lịch khác
  - Dữ liệu vận hành (giờ PK, lịch bác sĩ, ghế, thời lượng điều trị) là điều kiện tiên quyết để AI hoạt động

- **Must-have / nice-to-have:**
  - **Must-have:** gợi ý giờ + bác sĩ + lịch + giờ thay thế; 7 tiêu chí ưu tiên; chỉnh sửa thủ công override AI; xử lý gợi ý thất bại vs không có kết quả; luồng 4 bước xác nhận
  - **Out of scope (phiên bản này):** gợi ý giờ realtime cho bệnh nhân trên homepage khi đặt lịch

### Điểm cần làm rõ

- Khi gợi ý thất bại — UI hiển thị gì cho nhân viên? có fallback thủ công ngay không?
- "Xung đột dữ liệu realtime" — AI tự chạy lại hay nhân viên phải refresh?
- Thứ tự ưu tiên 7 tiêu chí: cố định hay phòng khám cấu hình được?
- Gợi ý nhiều phương án (top N) hay chỉ một đề xuất tốt nhất?
- Giờ thay thế: hiển thị bao nhiêu lựa chọn? có giới hạn khoảng ngày không?
- Phối hợp với bệnh nhân (bước 3): qua điện thoại thủ công hay có kênh/tin nhắn trong hệ thống?
- Thời lượng điều trị ước tính — lấy từ đâu, ai cập nhật?
- Trùng lịch được phép — có giới hạn số lịch trùng một slot không? (Slide 8 Case 3: vẫn gợi ý BS phụ trách dù đã có lịch)

---

## Slide 7: Test case gợi ý đặt lịch AI

**Loại slide:** ràng buộc | luồng

### Ý chính

Slide cụ thể hóa logic gợi ý AI bằng dữ liệu mẫu (giờ PK, lịch 3 bác sĩ) và 5 kịch bản chấp nhận (acceptance). Bổ sung quy tắc ưu tiên bác sĩ phụ trách (assigned doctor) và làm rõ: ghế **không** là điều kiện gợi ý; mục đích khám có thể thiếu vẫn gợi ý được; không auto-confirm trong mọi case.

### Phân tích requirement

- **Dữ liệu nền (ví dụ trên slide):**
  - Giờ PK: T2–T6 09:00–19:00; T7–CN đóng
  - BS1: T2–T6 09:00–19:00 (T6 đã có lịch 16:00–19:00)
  - BS2: T2 & T4 10:00–14:00
  - BS3: T6 14:00–19:00

- **Tiền đề / quy tắc bổ sung:**
  - AI kiểm tra khả dụng theo: giờ PK + lịch từng BS + trạng thái lịch hiện có
  - Tham chiếu **mục đích khám** (bệnh nhân nhập hoặc có sẵn trong hệ thống) — nhưng **không bắt buộc** để vẫn sinh gợi ý (Case 4)
  - **Ghế (chair):** không phải trường bắt buộc trong Clever Dent → **loại khỏi** tiêu chí gợi ý AI (khác với Slide 6)
  - Ghép bệnh nhân cũ: Tên + SĐT; không auto-link → chỉ gắn nhãn **Ứng viên khớp (매칭 후보)**
  - **Thứ tự ưu tiên gợi ý bác sĩ** (cao → thấp):
    1. BS phụ trách + giờ mong muốn (khả dụng)
    2. BS phụ trách + giờ thay thế (khả dụng)
    3. BS khác + giờ mong muốn (khả dụng)
    4. BS khác + giờ thay thế (khả dụng)

- **Kịch bản chấp nhận (5 case):**

| Case | Tình huống | Kết quả mong đợi (nghiệp vụ) |
|------|------------|------------------------------|
| **1** | BN cũ (Kim Minsoo, 010-1234-5679), T2 10:00, Cleaning. Khớp tên+SĐT, BS phụ trách BS2, BS2 làm T2 10–14h, không trùng lịch | Requested; Ứng viên khớp; AI gợi ý BS2; PK xác nhận thủ công |
| **2** | BN cũ cùng người, T6 16:00, Implant. BS phụ trách BS2 nhưng BS2 không làm T6; BS1 & BS3 đang làm | Requested; Ứng viên khớp; không gợi ý BS phụ trách; AI gợi ý BS1 hoặc BS3; không auto-confirm |
| **3** | BN cũ (Park Jisung), T6 16:00, Check-up. BS phụ trách BS1; BS1 T6 đã có lịch 16–19h | Requested; Ứng viên khớp; ưu tiên kiểm tra BS1 trước; **cho phép double-booking** → vẫn coi BS1 khả dụng; AI gợi ý BS1 |
| **4** | BN mới (Lee Junhyung), T2 20:00 (ngoài giờ), không nhập mục đích khám | Requested; BN mới (không hiện ứng viên khớp); giờ mong muốn không khả dụng; AI gợi ý giờ thay thế trong giờ mở cửa; gợi ý được dù thiếu mục đích khám |
| **5** | Tên trùng (Kim Minsoo) nhưng SĐT khác (010-7777-9999), T4 11:00, Check-up | Requested; coi là BN mới; không auto-link hồ sơ cũ; vẫn gắn **Ứng viên khớp**; AI gợi ý BS khả dụng; PK tự quyết BN mới hay cũ |

- **Điều kiện / ràng buộc (rút từ test case):**
  - Mọi case đều bắt đầu ở trạng thái **Requested** — không auto-confirm
  - BS phụ trách (assigned doctor) được ưu tiên trước BS khác, kể cả khi BS phụ trách đã có lịch (nếu double-booking được phép)
  - Ngoài giờ hoạt động → gợi ý giờ thay thế, không từ chối thẳng
  - Khớp tên nhưng khác SĐT → không auto-link; vẫn cảnh báo ứng viên khớp; PK quyết định thủ công

- **Must-have / nice-to-have:**
  - **Must-have:** logic 4 mức ưu tiên BS; loại ghế khỏi gợi ý; gợi ý khi thiếu mục đích khám; gợi ý giờ thay thế khi ngoài giờ; double-booking cho phép gợi ý BS đã có lịch; 5 kịch bản trên là tiêu chí chấp nhận
  - **Làm rõ so với Slide 6:** tiêu chí ghế (ưu tiên #4 Slide 6) **không áp dụng** trong Clever Dent hiện tại

### Điểm cần làm rõ

- Case 2: gợi ý BS1 **hoặc** BS3 — tiêu chí chọn giữa hai BS khi cùng khả dụng?
- Case 3 vs Slide 5: double-booking chỉ áp dụng gợi ý AI hay cả khi PK confirm thủ công?
- Case 5: "BN mới" + "Ứng viên khớp" cùng lúc — UI hiển thị thế nào để PK không nhầm?
- Assigned doctor lấy từ đâu — hồ sơ BN cũ hay cấu hình PK?
- Thiếu mục đích khám (Case 4): gợi ý BS theo tiêu chí nào (round-robin, ít lịch nhất)?
- Test case chỉ có 5 case — còn case BS không ai khả dụng, hoặc toàn bộ PK đóng cửa nhiều ngày?

---

## Slide 8: Tạo và vận hành homepage AI

**Loại slide:** chức năng | ràng buộc | UI/UX

### Ý chính

Slide chi tiết hóa chính sách tạo và vận hành homepage AI: **layout cố định theo template**, AI chỉ sinh **nội dung** từ thông tin cơ bản phòng khám; phòng khám chỉnh sửa bản nháp rồi publish ngay. Bổ sung quy tắc URL, ảnh, template MVP, SEO tự động, và hai mức tắt (toàn site hoặc chỉ chức năng đặt lịch).

### Phân tích requirement

- **Ai làm gì:**
  - **Phòng khám:** cung cấp thông tin cơ bản; xem/chỉnh sửa bản nháp homepage; chọn template (trong giới hạn MVP); upload ảnh hoặc dùng thư viện; publish URL; quản lý nội dung sau khi live; tắt site hoặc chỉ tắt đặt lịch; **tự đăng ký** URL lên Google Business Profile (Google Maps)
  - **AI:** sinh nội dung text (và gợi ý ảnh) cho các section được đánh dấu; tạo khung khu vực liên hệ, địa chỉ, giờ mở cửa; **không** thiết kế layout hay đổi thứ tự section
  - **Bệnh nhân:** truy cập homepage sau publish; dùng chức năng đặt lịch (nếu chưa bị tắt)
  - **Hệ thống:** kiểm tra URL trùng và gợi ý tên thay thế; tự sinh metadata SEO cơ bản; đồng bộ dữ liệu đặt lịch và thông tin phòng khám với Clever Dent

- **Phạm vi tạo homepage (bản nháp → chỉnh sửa → publish):**

| Hạng mục | AI sinh nội dung? | Phòng khám chỉnh sửa |
|----------|-------------------|----------------------|
| Tên phòng khám | Không (lấy từ thông tin cơ bản) | — |
| Giới thiệu phòng khám | Có (text + ảnh) | Text và ảnh |
| Hạng mục điều trị | Có (text + ảnh) | Text và ảnh |
| Thông tin bác sĩ | Có (text + ảnh) | Text và ảnh |
| Liên hệ | Tạo khu vực | Chỉ text |
| Địa chỉ / bản đồ | Tạo khu vực (địa chỉ + map) | Chỉ text |
| Giờ hoạt động | Tạo khu vực | Chỉ text |
| Đặt lịch | Không sinh nội dung — cung cấp **chức năng** | — |

- **Chính sách ảnh:**
  - AI có thể tự sinh hoặc gợi ý ảnh cơ bản
  - Phạm vi hiện tại: ưu tiên **thư viện ảnh cơ bản** + **upload trực tiếp** từ phòng khám

- **Chính sách template (MVP):**
  - Chỉ cung cấp **số lượng template hạn chế**
  - Tối ưu cho phòng khám nha, **mobile-first** mặc định
  - Phòng khám **không** được: tự sửa template, tạo layout tùy ý, đổi thứ tự/vị trí section

- **Publish & URL:**
  - Publish **ngay** sau khi sẵn sàng
  - URL mặc định: `{tên-pk}.cleverdent.ai` — domain `cleverdent.ai` **cố định**
  - Trùng tên → hệ thống gợi ý phương án thay thế (tên PK + quận/thành phố/quốc gia/số)
  - Phòng khám được sửa phần `{tên-pk}`; không đổi domain
  - Sau publish: URL hoạt động, bệnh nhân truy cập được, chức năng đặt lịch kích hoạt

- **Vận hành sau publish:**
  - Homepage gắn với Clever Dent — đồng bộ đặt lịch và dữ liệu phòng khám
  - Phòng khám tự quản lý; chỉnh sửa sau publish **có hiệu lực ngay** khi lưu
  - Hai mức tắt:
    1. **Tắt toàn bộ site** — bệnh nhân không truy cập được
    2. **Chỉ tắt đặt lịch** — site vẫn hiển thị, không nhận yêu cầu đặt lịch

- **SEO:**
  - Hệ thống tự sinh: meta title, meta description, OG image, sitemap, robots.txt

- **Điều kiện / ràng buộc:**
  - AI = content generator, **không** phải page builder tự do (khác với Durable — Slide 4)
  - Google Maps: **trách nhiệm phòng khám**, không tự động từ hệ thống
  - Template/layout bị khóa trong MVP — chỉ chỉnh nội dung trong khung có sẵn

- **Must-have / nice-to-have:**
  - **Must-have:** sinh nội dung AI theo bảng phạm vi; editor chỉnh text/ảnh theo quyền từng section; template cố định mobile-first; publish ngay; URL subdomain cleverdent.ai + xử lý trùng; đồng bộ Clever Dent; tắt site / tắt riêng đặt lịch; SEO cơ bản tự động
  - **Nice-to-have / ngoài MVP:** AI sinh ảnh hoàn toàn tự động (hiện ưu tiên thư viện + upload); tùy chỉnh layout/template; custom domain

- **Làm rõ so với Slide 4:**
  - Slide 4 nói AI "cấu hình layout từ template" — Slide 8 làm rõ: layout **không** do AI tự do thiết kế, chỉ chọn template có sẵn và điền nội dung
  - Slide 4: human-in-the-loop cho nội dung AI — Slide 8: PK chỉnh sửa bản nháp trước publish; sau publish vẫn chỉnh được trực tiếp

### Điểm cần làm rõ

- Bản nháp vs publish: có bước preview/duyệt nội dung AI bắt buộc trước khi live không, hay PK tự quyết?
- Thư viện ảnh cơ bản: nội dung, số lượng, phân loại theo chuyên khoa nha?
- AI sinh ảnh: có trong roadmap hay hoàn toàn out of scope giai đoạn này?
- Số template MVP: bao nhiêu? PK chọn khi nào (trước/sau sinh nội dung)?
- URL gợi ý khi trùng: thứ tự ưu tiên quận/thành phố/số? PK có bắt buộc chọn trong danh sách gợi ý?
- Tắt đặt lịch nhưng giữ site: UI homepage hiển thị gì cho bệnh nhân (ẩn form, thông báo, số điện thoại)?
- Đồng bộ Clever Dent: thông tin nào một chiều (PK → homepage) vs hai chiều (giờ mở cửa, bác sĩ)?
- SEO tự động: PK có override meta title/description không?
- Khu vực bản đồ: ~~chỉ hiển thị địa chỉ text hay embed Google Maps?~~ → Slide 11: Google Maps embed tự động theo địa chỉ Clever Dent (ghi chú slide: cần kiểm tra khả thi)
- Sau khi tắt toàn site: URL còn truy cập được không? có trang "đang bảo trì"?

---

## Slide 9: AI Homepage Template 1

**Loại slide:** UI/UX | ràng buộc | chức năng

### Ý chính

Slide mô tả **Template 1** — template homepage duy nhất trong MVP: AI tự sinh site từ thông tin phòng khám theo **cấu trúc 7 section cố định**; phòng khám chỉnh sửa nội dung đã sinh nhưng **không** đổi thứ tự hay bố cục section. Template bắt buộc responsive mobile.

### Phân tích requirement

- **Ai làm gì:**
  - **AI:** sinh homepage tự động từ thông tin cơ bản phòng khám; điền nội dung (text, ảnh) vào từng section theo thứ tự Template 1
  - **Phòng khám:** chỉnh sửa và vận hành nội dung đã sinh trong khung template cố định
  - **Bệnh nhân:** duyệt homepage; dùng menu điều hướng, CTA đặt lịch, form yêu cầu đặt lịch

- **Cấu trúc Template 1 (thứ tự cố định, không đổi được):**

| # | Section | Nội dung chính (từ mockup) |
|---|---------|------------------------------|
| 1 | **Header** | Logo; menu (Home, Services, Our Team, Appointment, Location); số điện thoại nổi bật |
| 2 | **Hero (Giới thiệu PK)** | Tiêu đề; đoạn giới thiệu ngắn; 2 CTA ("Book an Appointment", "Our Services"); đánh giá sao/số review; ảnh nội thất phòng khám |
| 3 | **Services (Hạng mục điều trị)** | Tiêu đề section; lưới **6** dịch vụ — mỗi card: icon, tên, mô tả ngắn (vd. điều trị sâu răng, tẩy trắng, implant, chỉnh nha, nha khoa trẻ em, nha chu) |
| 4 | **Doctors (Đội ngũ bác sĩ)** | Tiêu đề section; profile từng bác sĩ — ảnh, tên, thông tin chuyên môn ngắn |
| 5 | **Reservation (Đặt lịch)** | Trái: SĐT, giờ mở cửa, địa chỉ. Phải: form yêu cầu — Họ tên, SĐT, Dịch vụ (chọn), Ngày mong muốn, Giờ mong muốn, Ghi chú, nút "Submit Request" |
| 6 | **Location / Contact** | Khu vực bản đồ; thẻ thông tin phòng khám; nút "Get Directions" |
| 7 | **Footer** | Logo; mạng xã hội; liên hệ; giờ mở cửa; link Privacy Policy, Terms of Use |

- **Chính sách template (từ slide):**
  - MVP chỉ cung cấp **một** template (Template 1)
  - Layout **cố định** — không đổi vị trí/thứ tự section
  - Chi tiết từng khu vực được mô tả thêm ở **slide tiếp theo**
  - **Mobile responsive** bắt buộc — phù hợp bệnh nhân tìm PK và đặt lịch trên mobile

- **Luồng nghiệp vụ (liên kết Slide 8):**
  1. PK cung cấp thông tin cơ bản
  2. AI sinh nội dung vào Template 1
  3. PK chỉnh sửa nội dung trong từng section
  4. Publish → bệnh nhân truy cập và gửi yêu cầu đặt lịch qua form Reservation

- **Điều kiện / ràng buộc:**
  - Template = khung cố định + nội dung có thể sửa — không phải page builder tự do
  - Form đặt lịch nằm trong section Reservation — submit tạo yêu cầu **Requested** (Slide 5), không xác nhận ngay
  - Menu header anchor tới các section tương ứng trên cùng một trang (one-page layout)
  - Số lượng dịch vụ trên mockup: 6 card; số bác sĩ: 3 profile — cần xác nhận giới hạn min/max

- **Must-have / nice-to-have:**
  - **Must-have:** 7 section đúng thứ tự; header + nav + SĐT; hero + 2 CTA + review; grid dịch vụ; profile bác sĩ; form đặt lịch đủ trường; location + directions; footer pháp lý; responsive mobile
  - **Nice-to-have / chưa nêu:** đánh giá sao/review — nguồn dữ liệu thật hay placeholder; mạng xã hội footer — PK cấu hình hay cố định

- **Làm rõ so với Slide 8:**
  - Slide 8: chính sách tạo/vận hành, URL, SEO, tắt site — **cấp hệ thống**
  - Slide 9: **cụ thể hóa** Template 1 — section nào, thứ tự nào, form đặt lịch gồm trường gì

### Điểm cần làm rõ

- ~~Slide tiếp theo mô tả chi tiết từng khu vực~~ → Slide 10–11: đủ 7 section Template 1
- Hero: đánh giá sao và số review — lấy từ Google/review thật hay AI placeholder? (chưa thấy trên Slide 10)
- ~~Services: luôn đúng 6 card hay PK thêm/bớt trong giới hạn?~~ → Slide 10: tối thiểu 1, tối đa 6; tên dịch vụ từ Clever Dent
- ~~Doctors: tối thiểu/tối đa bao nhiêu profile hiển thị?~~ → Slide 10: tối thiểu 1, tối đa 4; layout tự điều chỉnh theo số lượng
- Form Reservation: "Service" dropdown lấy từ danh sách Services trên homepage hay từ Clever Dent?
- "Preferred Date/Time" — có validate theo giờ mở cửa PK không? (Slide 6: không gợi ý giờ realtime cho BN)
- ~~Location: "Get Directions" mở Google Maps hay chỉ hiển thị địa chỉ?~~ → Slide 11: bản đồ Google Maps embed tự động theo địa chỉ (cần xác minh khả thi)
- Footer Privacy Policy / Terms of Use — nội dung mẫu platform hay PK tự soạn?
- CTA Hero "Book an Appointment" — scroll tới form Reservation hay mở trang riêng?
- MVP chỉ Template 1 — khi có thêm template sau này, PK đổi template có migrate nội dung không?

---

## Slide 10: Template 1 — Chính sách sinh nội dung AI

**Loại slide:** ràng buộc | chức năng | UI/UX

### Ý chính

Slide chi tiết hóa **nguồn dữ liệu, phạm vi AI sinh nội dung, và quyền chỉnh sửa** cho 4 section đầu của Template 1 (Header, Hero, Services, Our Team). Dữ liệu hành chính lấy từ Clever Dent; AI chỉ sinh copy marketing (tiêu đề, mô tả, bio bác sĩ) theo **phong cách template** (Warm / Clinical); thành phần hệ thống (menu, CTA) bị khóa.

### Phân tích requirement

- **Ai làm gì:**
  - **Hệ thống / Clever Dent:** cung cấp tên PK, SĐT, tên dịch vụ đã đăng ký, tên bác sĩ, chuyên khoa, lịch sử nghề nghiệp
  - **AI:** sinh Hero title/description, tiêu đề section Services, bio bác sĩ; có thể sinh ảnh Hero; ưu tiên dữ liệu chuyên môn khi có
  - **Phòng khám:** chỉnh sửa hầu hết nội dung đã sinh; upload ảnh Hero và ảnh bác sĩ; **không** sửa menu nav hay nút CTA

- **Chính sách theo section:**

| Section | Thành phần | Nguồn | AI sinh? | PK chỉnh sửa? |
|---------|------------|-------|----------|---------------|
| **Header** | Tên phòng khám | Clever Dent | Không | — |
| | Menu điều hướng | Hệ thống cố định (Home, Services, Our Team, Appointment, Location) | Không | **Không** |
| | Số điện thoại | Clever Dent | Không | — |
| **Hero** | Tiêu đề | AI | Có | Có |
| | Mô tả | AI | Có | Có |
| | Ảnh | AI sinh **hoặc** PK upload / ảnh mặc định | Có (tùy chọn) | Có |
| | Nút CTA | Hệ thống | Không | **Không** |
| **Services** | Tiêu đề section | AI | Có | Có |
| | Tên dịch vụ | Clever Dent (đăng ký PK) | Không | Có |
| **Our Team** | Tên bác sĩ | Clever Dent | Không | Có |
| | Bio / chi tiết | AI | Có | Có |
| | Ảnh bác sĩ | PK upload | Không | Có |

- **Đầu vào AI (Hero title & description):**
  - Tên phòng khám
  - Hạng mục điều trị
  - Địa chỉ
  - **Phong cách template:** Warm hoặc Clinical

- **Logic AI — Our Team:**
  - Chỉ có tên bác sĩ → AI sinh giới thiệu chung
  - Có chuyên khoa / lịch sử nghề nghiệp → AI **ưu tiên** dữ liệu đó khi viết bio

- **Ràng buộc hiển thị:**

| Section | Số lượng | Layout |
|---------|----------|--------|
| Services | Tối thiểu **1**, tối đa **6** | **Cố định** — không đổi bố cục |
| Our Team | Tối thiểu **1**, tối đa **4** | **Tự điều chỉnh** theo số bác sĩ |

- **Điều kiện / ràng buộc:**
  - Services: mặc định từ thông tin PK đã đăng ký Clever Dent; **chỉ tiêu đề section** do AI sinh — tên dịch vụ không qua AI
  - Ảnh bác sĩ: **chỉ upload** — AI không sinh ảnh profile
  - Menu nav và CTA Hero: thành phần hệ thống, PK không tùy chỉnh
  - Slide **chưa** mô tả chính sách Reservation, Location, Footer — có thể ở slide tiếp theo

- **Must-have / nice-to-have:**
  - **Must-have:** đồng bộ Clever Dent cho tên PK, SĐT, dịch vụ, bác sĩ; AI sinh copy Hero + tiêu đề Services + bio BS theo style Warm/Clinical; PK sửa được nội dung đã sinh; giới hạn 1–6 dịch vụ, 1–4 bác sĩ; layout BS động theo số lượng
  - **Nice-to-have / chưa nêu:** mô tả ngắn từng dịch vụ (card icon + mô tả trên Slide 9) — AI sinh hay PK nhập?; ảnh Hero AI vs thư viện mặc định — tiêu chí chọn

- **Làm rõ so với Slide 8 & 9:**
  - Slide 8 (bảng phạm vi): nói AI sinh text + ảnh cho giới thiệu PK, dịch vụ, bác sĩ — Slide 10 **thu hẹp:** tên dịch vụ và tên BS **không** do AI; ảnh BS **không** do AI
  - Slide 9: mockup 6 dịch vụ, 3 bác sĩ — Slide 10: số lượng **linh hoạt** trong khoảng cho phép
  - Slide 9: 2 CTA Hero — Slide 10: chỉ nêu CTA là hệ thống, không sửa được (chi tiết 1 hay 2 nút chưa rõ)

### Điểm cần làm rõ

- Phong cách Warm / Clinical — PK chọn khi nào? có đổi sau khi AI đã sinh không?
- Tên PK, SĐT trên Header — PK chỉnh trên homepage hay chỉ qua Clever Dent?
- Services: mô tả ngắn / icon trên mỗi card (Slide 9) — nguồn và quyền sửa?
- Hero ảnh: thứ tự ưu tiên AI sinh vs thư viện vs upload? PK bắt buộc chọn một?
- CTA Hero: một nút hay hai ("Book an Appointment", "Our Services") như mockup Slide 9?
- Chỉnh sửa tên dịch vụ trên homepage — có đồng bộ ngược Clever Dent không?
- Bio bác sĩ chỉnh trên homepage — có cập nhật hồ sơ Clever Dent không?
- ~~Reservation, Location, Footer — chính sách sinh nội dung ở slide nào?~~ → Slide 11
- Giới hạn ký tự cho tiêu đề Hero, mô tả, bio?
- Khi PK có >6 dịch vụ hoặc >4 bác sĩ trong Clever Dent — chọn thủ công hay tự cắt?

---

## Slide 11: Template 1 — Chính sách nội dung (Đặt lịch, Vị trí, Footer)

**Loại slide:** ràng buộc | chức năng | UI/UX

### Ý chính

Slide bổ sung chính sách sinh nội dung cho **3 section cuối** Template 1: Appointment (đặt lịch), Location (vị trí), Footer. AI chỉ viết tiêu đề và mô tả khu vực đặt lịch; form đặt lịch và bản đồ là thành phần hệ thống cố định; thông tin footer lấy từ Clever Dent, không qua AI.

### Phân tích requirement

- **Ai làm gì:**
  - **AI:** sinh tiêu đề và mô tả section Appointment (khuyến khích đặt lịch)
  - **Clever Dent / hệ thống:** cung cấp tên PK, địa chỉ, liên hệ, giờ mở cửa; cung cấp form đặt lịch chuẩn; hiển thị bản đồ Google Maps theo địa chỉ
  - **Phòng khám:** chỉnh sửa copy AI (tiêu đề/mô tả đặt lịch), text địa chỉ hiển thị, liên hệ, giờ, địa chỉ footer; **không** sửa cấu trúc form, tên PK, bản đồ
  - **Bệnh nhân:** đọc thông tin vị trí; điền form đặt lịch cố định → tạo yêu cầu **Requested** (Slide 5)

- **Chính sách theo section:**

| Section | Thành phần | Nguồn | AI sinh? | PK chỉnh sửa? |
|---------|------------|-------|----------|---------------|
| **Appointment** | Tiêu đề section | AI | Có | Có |
| | Mô tả | AI | Có | Có |
| | Form đặt lịch | Hệ thống | Không | **Không** |
| **Location** | Tên phòng khám | Clever Dent | Không | **Không** |
| | Địa chỉ (text hiển thị) | Clever Dent | Không | Có |
| | Bản đồ | Google Maps | Không | **Không** |
| **Footer** | Tên phòng khám | Clever Dent | Không | **Không** |
| | Thông tin liên hệ | Clever Dent | Không | Có |
| | Giờ mở cửa | Clever Dent | Không | Có |
| | Địa chỉ | Clever Dent | Không | Có |

- **Đầu vào AI — Appointment:**
  - **Tiêu đề:** tên phòng khám, hạng mục điều trị (vd. "Schedule your appointment with Smile Dental Clinic")
  - **Mô tả:** text khuyến khích đặt lịch (예약 유도 텍스트)

- **Đầu vào — Location (địa chỉ text):**
  - Địa chỉ, thành phố, quốc gia từ Clever Dent
  - Ví dụ hiển thị: "Conveniently located in Gangnam, Seoul" — PK có thể chỉnh text hiển thị

- **Ràng buộc nghiệp vụ:**
  - Form đặt lịch: **cấu trúc cố định** — không thêm/bớt/sửa trường form; AI **chỉ** sinh title + description xung quanh form
  - Bản đồ: tự động hiển thị theo thông tin địa chỉ — slide ghi **cần kiểm tra khả thi** (feasibility)
  - Footer: **không** dùng AI — toàn bộ dữ liệu gốc từ Clever Dent; PK chỉnh được liên hệ, giờ, địa chỉ nhưng không đổi tên PK

- **Luồng nghiệp vụ (liên kết slide trước):**
  1. Clever Dent cung cấp dữ liệu PK (tên, địa chỉ, SĐT, giờ…)
  2. AI sinh copy khu vực Appointment
  3. Hệ thống render form cố định + embed Google Maps
  4. PK chỉnh copy và thông tin liên hệ/địa chỉ/giờ nếu cần
  5. Bệnh nhân submit form → Requested trong Clever Dent

- **Điều kiện / ràng buộc:**
  - Chiến lược nội dung **bảo thủ:** AI cho copy thuyết phục; dữ liệu thực tế (tên PK, form, bản đồ) khóa theo hệ thống
  - Chỉnh địa chỉ/liên hệ/giờ trên homepage vs Clever Dent — slide không nêu đồng bộ hai chiều
  - Privacy Policy / Terms of Use (Slide 9 mockup) — **chưa** có trong slide này

- **Must-have / nice-to-have:**
  - **Must-have:** AI title + description Appointment; form hệ thống không sửa; Google Maps theo địa chỉ; footer đồng bộ Clever Dent; PK sửa copy AI và liên hệ/giờ/địa chỉ footer
  - **Nice-to-have / rủi ro:** auto-map từ địa chỉ — cần confirm khả thi; nút "Get Directions" (Slide 9) — chưa nêu rõ trên slide này

- **Làm rõ so với Slide 8–10:**
  - Slide 8: "Đặt lịch — cung cấp chức năng, không sinh nội dung" — Slide 11: AI **có** sinh copy quanh form, nhưng form vẫn hệ thống cố định
  - Slide 8: "Địa chỉ / bản đồ — PK chỉnh text" — Slide 11: text địa chỉ Location **sửa được**; bản đồ Google Maps **không** sửa; tên PK Location **không** sửa
  - Slide 10: thiếu 3 section cuối — Slide 11 **hoàn thiện** chính sách Template 1
  - Slide 9: form gồm Họ tên, SĐT, Dịch vụ, Ngày, Giờ, Ghi chú — Slide 11 xác nhận form **cố định**, không tùy chỉnh trường

### Điểm cần làm rõ

- Form đặt lịch: danh sách "Service" dropdown lấy từ Clever Dent hay từ section Services trên homepage?
- Validate ngày/giờ mong muốn theo giờ mở cửa PK?
- Auto Google Maps từ địa chỉ — điều kiện thành công/thất bại? fallback khi geocode lỗi?
- "Get Directions" (Slide 9) — có trong scope không? hành vi khi click?
- Text địa chỉ Location vs địa chỉ thực Clever Dent — hai trường riêng hay cùng nguồn?
- Chỉnh liên hệ/giờ/địa chỉ trên homepage — có đồng bộ ngược Clever Dent không?
- Footer: Privacy Policy, Terms of Use, mạng xã hội (Slide 9) — nguồn và quyền sửa?
- PK tắt chức năng đặt lịch (Slide 8) — section Appointment hiển thị gì? ẩn form hay chỉ ẩn submit?
- Giới hạn ký tự tiêu đề/mô tả Appointment?

---

## Slide 12–17: Giao diện Template 1 (mockup UI)

**Loại slide:** UI/UX (tham chiếu trực quan)

**Trạng thái:** User xác nhận slide 12–17 **chỉ là giao diện template** — không có nội dung requirement nghiệp vụ bổ sung.

### Ý chính

Các slide này minh họa giao diện Template 1 (layout, màu sắc, bố cục section) để tham chiếu thiết kế. Chính sách nghiệp vụ liên quan template đã được mô tả đầy đủ ở **Slide 8–11** (cấu trúc 7 section, nguồn dữ liệu, quyền chỉnh sửa, form đặt lịch, bản đồ, footer).

### Phân tích requirement

- **Không phân tích riêng từng slide** — không có rule, actor, hay luồng nghiệp vụ mới ngoài Slide 8–11
- **Tham chiếu chéo:** mockup UI trên slide 12–17 phục vụ implement/visual QA; khi mâu thuẫn với chính sách Slide 8–11 thì **ưu tiên slide chính sách**
- **Slide 9** đã mô tả cấu trúc và thành phần từng section dựa trên mockup — đủ cho phân tích nghiệp vụ

### Điểm cần làm rõ

- Không có — phần UI chi tiết (màu, font, spacing) nằm ngoài phạm vi phân tích requirement nghiệp vụ từ PPTX

---

## Tổng hợp cuối

### Phạm vi hệ thống

**Clever Dent AI** gồm hai mảng chính:

1. **Homepage AI** — tự tạo website phòng khám nha từ thông tin cơ bản, publish URL `{tên-pk}.cleverdent.ai`, tích hợp form đặt lịch online
2. **Quản lý đặt lịch trong Clever Dent** — nhận yêu cầu từ homepage (trạng thái **Requested**), gợi ý AI khi duyệt, xác nhận thủ công, đồng bộ với vận hành phòng khám

**MVP:** một template homepage (Template 1), layout cố định 7 section, mobile-first. AI sinh nội dung marketing; dữ liệu hành chính từ Clever Dent; human-in-the-loop cho nội dung và xác nhận lịch.

**Ngoài phạm vi (phiên bản này):** gợi ý giờ realtime cho bệnh nhân trên homepage; hủy lịch qua web; custom domain; tùy chỉnh layout/template; page builder tự do.

### Actor / vai trò người dùng

| Actor | Vai trò chính |
|-------|----------------|
| **Phòng khám (PK)** | Nhập thông tin cơ bản; chỉnh sửa/publish homepage; quản lý nội dung sau publish; tắt site hoặc tắt đặt lịch; đăng ký Google Business Profile; duyệt yêu cầu đặt lịch Requested; xác nhận/hủy lịch; quyết định ghép bệnh nhân cũ |
| **Bệnh nhân (BN)** | Tìm PK qua Google/Maps; xem homepage; gửi yêu cầu đặt lịch (không xác nhận ngay); nhận tin xác nhận sau khi PK duyệt; muốn hủy phải liên hệ PK trực tiếp |
| **AI** | Sinh nội dung homepage theo template; gợi ý giờ/bác sĩ/lịch khi PK duyệt Requested — chỉ tham khảo, không quyết định cuối |
| **Hệ thống / Clever Dent** | Cung cấp dữ liệu PK (tên, SĐT, dịch vụ, bác sĩ, địa chỉ, giờ); form đặt lịch cố định; đồng bộ yêu cầu; trạng thái lịch; SEO cơ bản |

### Chức năng chính

**Homepage AI**
- Sinh homepage từ thông tin PK → bản nháp → chỉnh sửa → publish ngay
- Template 1: Header, Hero, Services (1–6), Doctors (1–4), Reservation, Location, Footer
- AI sinh copy (Hero, tiêu đề section, bio bác sĩ, copy đặt lịch) theo style Warm/Clinical
- Dữ liệu Clever Dent: tên PK, SĐT, tên dịch vụ, tên bác sĩ — không qua AI
- Ảnh: AI gợi ý Hero hoặc upload; ảnh bác sĩ chỉ upload
- URL `{tên-pk}.cleverdent.ai`, xử lý trùng tên
- Tắt toàn site hoặc chỉ tắt đặt lịch
- SEO tự động (meta, OG, sitemap, robots.txt)

**Đặt lịch**
- Form homepage → trạng thái **Requested** (không chiếm slot)
- PK duyệt theo checklist 7 tiêu chí → **Confirmed** hoặc **Canceled**
- Rule trùng: cùng SĐT + ngày + giờ = trùng; cùng SĐT + ngày + khác giờ = cho phép
- Ghép BN cũ: khớp Tên + SĐT → hiển thị ứng viên, PK chọn liên kết thủ công
- AI gợi ý: giờ, bác sĩ, lịch, giờ thay thế — ưu tiên BS phụ trách; cho phép double-booking trong gợi ý
- Tin xác nhận SMS/WhatsApp sau khi PK xác nhận

### Luồng nghiệp vụ quan trọng

**Luồng 1 — Tạo và vận hành homepage**
1. PK cung cấp thông tin cơ bản (Clever Dent)
2. AI sinh nội dung vào Template 1
3. PK chỉnh sửa bản nháp
4. Publish → URL live, form đặt lịch kích hoạt
5. PK tự đăng ký URL lên Google Business Profile

**Luồng 2 — Đặt lịch end-to-end**
1. BN tìm PK (Google/Maps) → xem homepage → điền form
2. Hệ thống tạo **Requested** trong Clever Dent
3. PK mở yêu cầu → AI gợi ý giờ/BS/lịch
4. PK kiểm tra, phối hợp BN nếu cần, chỉnh thủ công
5. PK xác nhận → **Confirmed** → gửi tin cho BN

### Ràng buộc nghiệp vụ & phi chức năng

- **Human-in-the-loop:** nội dung AI và xác nhận lịch đều cần PK duyệt/chỉnh trước khi hiệu lực
- **Layout khóa:** PK không đổi thứ tự section, menu nav, CTA, cấu trúc form
- **Requested không block slot** — có thể nhiều yêu cầu cùng khung giờ cho đến khi confirm
- **Double-booking** được Clever Dent cho phép — AI vẫn gợi ý BS đã có lịch
- **Mobile-first** — đa số BN tìm nha khoa trên mobile
- **Đồng bộ Clever Dent** — đặt lịch và dữ liệu PK; chiều đồng bộ chỉnh sửa homepage ↔ Clever Dent chưa rõ
- **Google Maps:** embed theo địa chỉ (cần xác minh khả thi); đăng ký Business Profile là trách nhiệm PK

### Giả định & rủi ro

| Giả định | Rủi ro nếu sai |
|----------|----------------|
| PK có đủ dữ liệu vận hành (giờ, lịch BS) trong Clever Dent | AI gợi ý thất bại — PK phải xử lý thủ công |
| BN chấp nhận đặt lịch không xác nhận ngay | Trải nghiệm kém nếu PK phản hồi chậm |
| Homepage không đăng nhập | Khó ngăn trùng lặp/spam — phụ thuộc PK khi duyệt |
| Chỉ một template MVP | Hạn chế branding; PK không tùy biến layout |
| Geocode địa chỉ → Google Maps tự động | Có thể lỗi địa chỉ → cần fallback |
| SMS/WhatsApp theo market | Cần xác định kênh bắt buộc từng region |

### Câu hỏi cần confirm với khách hàng

**Đặt lịch & AI**
- Khi PK từ chối/sửa gợi ý AI — quy trình liên hệ lại BN?
- Nhiều Requested cùng slot — xử lý các yêu cầu còn lại khi confirm một?
- Gợi ý nhiều phương án (top N) hay một đề xuất?
- Phối hợp BN (bước duyệt): điện thoại thủ công hay kênh trong hệ thống?
- SMS vs WhatsApp: market nào, kênh bắt buộc?
- Ai trong Clever Dent có quyền xác nhận lịch?

**Homepage & nội dung**
- Đồng bộ hai chiều homepage ↔ Clever Dent khi PK chỉnh liên hệ/giờ/địa chỉ?
- Phong cách Warm/Clinical — PK chọn khi nào, đổi sau khi sinh được không?
- Hero review/sao — dữ liệu thật hay placeholder?
- Mô tả ngắn từng dịch vụ (card) — AI sinh hay PK nhập?
- Form Service dropdown — từ Clever Dent hay từ section Services homepage?
- PK tắt đặt lịch — UI hiển thị gì?
- Footer Privacy Policy, Terms, mạng xã hội — nguồn và quyền sửa?
- Ngôn ngữ homepage và tin nhắn — đa ngôn ngữ?

**Vận hành & SEO**
- Bản nháp: bắt buộc preview trước publish?
- Số template MVP (hiện chỉ Template 1) — roadmap thêm template?
- PK override meta SEO?
- Tắt toàn site — trang bảo trì hay 404?
