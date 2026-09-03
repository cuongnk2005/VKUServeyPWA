# BÁO CÁO KỸ THUẬT MINI-PROJECT: VKU FIELD SURVEY PWA
**Học phần:** Cross-Platform Mobile App Development  
**Đề tài:** Xây dựng ứng dụng Khảo sát Cơ sở vật chất VKU theo Kiến trúc Offline-First (Progressive Web App)  
**Tác giả:** Nhóm sinh viên thực hiện / VKU  

---

## 1. Introduction (Đặt vấn đề & Mục tiêu)
Trong quá trình quản lý và vận hành trường đại học, việc kiểm tra, đánh giá định kỳ tình trạng cơ sở vật chất (CSVC) như phòng học, máy tính phòng lab, điều hòa, quạt và hệ thống chiếu sáng là yêu cầu thường xuyên. Tuy nhiên, các kỹ thuật viên hoặc sinh viên khảo sát thường phải di chuyển đến các khu vực sóng yếu hoặc khu vực không có sóng Wifi/4G. 

Các ứng dụng truyền thống (Online-First) thường gửi dữ liệu trực tiếp lên máy chủ thông qua HTTP POST. Khi mất mạng, request bị gián đoạn dẫn đến mất dữ liệu đã nhập, gây ức chế cho người khảo sát và làm giảm độ tin cậy của hệ thống.

**Mục tiêu của dự án:**
- Xây dựng một **Progressive Web App (PWA)** hoạt động theo triết lý **Offline-First**.
- Đảm bảo người dùng có thể mở ứng dụng, nhập phiếu và lưu trữ dữ liệu an toàn ngay cả khi ngắt kết nối mạng hoàn toàn.
- Cơ chế tự động nhận diện kết nối Internet để đồng bộ dữ liệu về máy chủ trung tâm mà không mất dữ liệu.
- Thiết kế giao diện Mobile-first, hỗ trợ cài đặt Add to Home Screen và tương thích tối đa để đóng gói thành ứng dụng Android thông qua **Capacitor**.

---

## 2. System Architecture (Kiến trúc Hệ thống)
Hệ thống được tổ chức theo mô hình phân lớp rõ ràng nhằm phân tách các trách nhiệm (Separation of Concerns):

```
┌────────────────────────────────────────────────────────┐
│             Presentation Layer (UI Components)         │
│  - App.tsx, Navbar, SurveyForm, SurveyCard, StatusBadge │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                    Service Layer                       │
│  - surveyService.ts : Điều phối ghi nhận & truy xuất   │
│  - syncService.ts   : Quản lý hàng đợi đồng bộ         │
│  - apiService.ts    : Giao tiếp REST API               │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
┌─────────────▼───────────────┐ ┌──────────▼─────────────┐
│    Local Storage Layer      │ │   Remote Server Layer  │
│  - IndexedDB (idb wrapper)  │ │   - REST API Endpoints │
│  - DB: vku-field-survey     │ │   - Cloud Database     │
└─────────────────────────────┘ └────────────────────────┘
```

**Nguyên tắc cốt lõi:** UI Component không bao giờ trực tiếp gọi fetch API hoặc can thiệp sâu vào cấu trúc IndexedDB. Mọi thao tác đều thông qua tầng Service để đảm bảo tính nhất quán.

---

## 3. Progressive Web App (PWA)
PWA kết hợp những ưu điểm tốt nhất của Web và ứng dụng di động:
- **Web App Manifest (`manifest.webmanifest`)**: Định nghĩa tên ứng dụng, biểu tượng (192x192, 512x512 maskable), màu thương hiệu (`#005696`), chế độ hiển thị `standalone` (ẩn thanh địa chỉ URL trình duyệt).
- **Khả năng cài đặt (Installable)**: Bắt sự kiện `beforeinstallprompt` và cung cấp nút "Cài đặt" ngay trong giao diện người dùng giúp người dùng có thể thêm app vào màn hình chính điện thoại chỉ với một chạm.
- **Tiêu chuẩn HTTPS**: Đảm bảo an toàn bảo mật dữ liệu trên đường truyền.

---

## 4. Service Worker (Vòng đời & Quản lý)
Service Worker là một script chạy ngầm độc lập với luồng xử lý chính của trang web:
1. **Install Event**: Tải trước (pre-cache) toàn bộ App Shell cần thiết gồm file HTML, CSS, JavaScript bundle, Web Fonts và các file biểu tượng SVG vào Cache Storage.
2. **Activate Event**: Dọn dẹp các cache phiên bản cũ khi có phiên bản mới của ứng dụng được phát hành (`autoUpdate`).
3. **Fetch Event**: Chặn các network request phát sinh từ trình duyệt để điều hướng trả về dữ liệu từ Cache hoặc Network theo chiến lược đã định nghĩa.

---

## 5. Cache Strategy (Chiến lược Caching)
Dự án áp dụng kết hợp các chiến lược caching chuẩn Workbox:
- **Cache First (App Shell)**:
  - Áp dụng cho: `index.html`, JS chunks, CSS, icons, web fonts.
  - Cơ chế: Luôn lấy từ Cache trước giúp ứng dụng tải với tốc độ tức thì và hoạt động 100% khi offline.
- **Network First (API Resources)**:
  - Áp dụng cho: Các endpoint truy vấn dữ liệu từ máy chủ `/api/surveys`.
  - Cơ chế: Thử lấy dữ liệu mới nhất từ mạng trong giới hạn thời gian (networkTimeoutSeconds: 5s). Nếu mạng thất bại hoặc quá thời gian, trả về dữ liệu đã lưu trong cache.

---

## 6. IndexedDB (Cơ sở Dữ liệu Cục bộ)
So với `localStorage` (chỉ lưu chuỗi ký tự và giới hạn dung lượng ~5MB, chạy đồng bộ gây nghẽn luồng UI), **IndexedDB** là giải pháp lưu trữ lý tưởng cho kiến trúc Offline-First:
- Là cơ sở dữ liệu NoSQL transactional, hướng đối tượng (Object Store).
- Hỗ trợ lưu trữ dữ liệu dung lượng lớn (hàng trăm MB), hỗ trợ lưu trữ ảnh Base64 và tọa độ địa lý.
- Thao tác bất đồng bộ (Asynchronous) hoàn toàn không gây giật lag giao diện người dùng.

Trong dự án:
- Database Name: `vku-field-survey` (Version 1)
- Object Store: `surveys` (KeyPath: `id`)
- Các chỉ mục (Indexes):
  - `by-syncStatus`: Tối ưu truy vấn các phiếu đang ở trạng thái `PENDING`.
  - `by-createdAt`: Tối ưu sắp xếp theo dòng thời gian.

---

## 7. Offline-First Implementation (Cơ chế Xử lý)
Luồng tạo mới phiếu khảo sát tuân thủ nghiêm ngặt nguyên tắc bảo vệ dữ liệu cục bộ:
1. Người dùng bấm **Lưu Phiếu Khảo Sát**:
   - Hệ thống sinh UUIDv4 duy nhất tại Client cho bản ghi.
   - Bản ghi được gán trạng thái `syncStatus = 'PENDING'`.
   - **Ghi trực tiếp vào IndexedDB**.
   - Trả thông báo thành công cho người dùng ngay lập tức (Zero-latency UI).
2. Kiểm tra `navigator.onLine`:
   - Nếu **Offline**: Kết thúc tiến trình, phiếu nằm an toàn trong IndexedDB.
   - Nếu **Online**: Tiến hành gọi API upload lên máy chủ nền. Nếu thành công, cập nhật trạng thái bản ghi thành `SYNCED`. Nếu thất bại (timeout, mạng chập chờn), dữ liệu vẫn giữ nguyên `PENDING` trong IndexedDB và không bao giờ bị xóa.

---

## 8. Data Synchronization (Hàng đợi Đồng bộ - Sync Queue)
Cơ chế đồng bộ dữ liệu được đảm nhiệm bởi `syncService.ts`:
- Lắng nghe sự kiện toàn cục `window.addEventListener('online', ...)`.
- Khi thiết bị khôi phục kết nối Internet:
  1. Lấy danh sách toàn bộ các phiếu có `syncStatus === 'PENDING'` từ chỉ mục `by-syncStatus` của IndexedDB.
  2. Duyệt qua từng phiếu và gửi HTTP POST tuần tự đến API Server.
  3. Với mỗi phiếu upload thành công: Cập nhật `syncStatus = 'SYNCED'` và lưu mốc thời gian `syncedAt`.
  4. Nếu có lỗi mạng ngắt quãng: Đánh dấu `FAILED` kèm thông điệp lỗi cụ thể, không làm ảnh hưởng đến các bản ghi khác và không làm mất dữ liệu.
  5. Cung cấp nút đồng bộ thủ công để người dùng chủ động kiểm soát.

---

## 9. Capacitor Compatibility (Định hướng Đóng gói Android APK)
Dự án được tối ưu sẵn sàng cho giai đoạn đóng gói Android:
- Giao diện thiết kế theo chuẩn Mobile First, tối ưu Safe Area (`viewport-fit=cover`).
- Sử dụng Environment Variable `VITE_API_URL` tránh hardcode endpoint.
- Tách biệt hoàn toàn tầng Web API khỏi logic nghiệp vụ, dễ dàng bổ sung Capacitor Plugins (như `@capacitor/geolocation`, `@capacitor/camera`, `@capacitor/network`) khi chuyển sang Native App.

---

## 10. Result (Kết quả Nghiệm thu)
Ứng dụng đã vượt qua toàn bộ 9 kịch bản kiểm thử:
1. Mở ứng dụng bình thường khi có Internet: Hiển thị giao diện, chỉ báo `Online`.
2. Ngắt kết nối mạng trong DevTools và tải lại trang: Ứng dụng vẫn khởi chạy bình thường từ Service Worker Cache.
3. Tạo phiếu khảo sát mới khi đang offline: Lưu thành công, phiếu có trạng thái `PENDING`.
4. Tải lại trang khi vẫn đang offline: Dữ liệu phiếu vừa tạo vẫn hiển thị chính xác từ IndexedDB.
5. Bật lại kết nối mạng: Ứng dụng lập tức phát hiện sự kiện `online`, tự động kích hoạt đồng bộ và chuyển trạng thái phiếu sang `SYNCED`.
6. Tải ảnh chụp, lấy tọa độ GPS và tìm kiếm, lọc theo tình trạng trang thiết bị hoạt động chính xác.
7. Build Production đạt kích thước tối ưu, không có cảnh báo lỗi TypeScript.

---

## 11. Conclusion (Kết luận)
Dự án **VKU Field Survey PWA** đã hiện thực hóa thành công kiến trúc **Offline-First** cho bài toán khảo sát hiện trường tại trường Đại học VKU. Việc kết hợp giữa **Progressive Web App**, **Service Worker Precaching** và **IndexedDB** giúp loại bỏ hoàn toàn sự phụ thuộc vào đường truyền mạng trong quá trình nhập liệu, đảm bảo tính toàn vẹn của dữ liệu và mang lại trải nghiệm mượt mà tương đương ứng dụng native.
