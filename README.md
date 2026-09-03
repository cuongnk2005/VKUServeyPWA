# VKU Field Survey PWA

Ứng dụng **Progressive Web App (PWA)** hỗ trợ khảo sát, ghi nhận và kiểm tra hiện trạng cơ sở vật chất (CSVC) trong khuôn viên **Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU)** theo kiến trúc **Offline-First**.

---

## 1. Introduction (Giới thiệu)
Khi thực hiện khảo sát cơ sở vật chất tại các giảng đường, phòng Lab, ký túc xá hay khuôn viên trường VKU, người dùng thường xuyên gặp phải tình trạng mất sóng mạng Wifi hoặc kết nối di động chập chờn. 

**VKU Field Survey PWA** được thiết kế giải quyết triệt để vấn đề này:
- Cho phép người dùng mở ứng dụng và nhập phiếu khảo sát ngay cả khi **hoàn toàn mất kết nối Internet** (`navigator.onLine === false`).
- Dữ liệu khảo sát được bảo vệ an toàn bằng việc lưu trữ cục bộ vào cơ sở dữ liệu trình duyệt (**IndexedDB**).
- Hệ thống tự động nhận biết khi có mạng Internet trở lại để đồng bộ (**Sync Queue**) dữ liệu lên hệ thống máy chủ mà không làm mất bất kỳ thông tin nào của người dùng.
- Sẵn sàng đóng gói thành ứng dụng di động **Android APK** thông qua **Capacitor**.

---

## 2. Features (Tính năng chính)
1. **Offline-First Core**: Nhập và lưu phiếu khảo sát bất kỳ lúc nào mà không phụ thuộc vào máy chủ.
2. **Quản lý phiếu khảo sát**:
   - Ghi nhận thông tin chi tiết: Tòa nhà (A, B, C, V, K...), số phòng, loại thiết bị (Điều hòa, quạt, máy tính, đèn chiếu sáng, máy chiếu...), tình trạng (Good, Minor Issue, Broken, Needs Replacement) và ghi chú mô tả.
   - Hỗ trợ định vị tọa độ GPS hiện trường.
   - Hỗ trợ chụp ảnh trực tiếp từ camera hoặc tải ảnh đính kèm.
3. **Chỉ báo mạng thời gian thực (Network Status)**:
   - Header hiển thị trực quan `🟢 Online` hoặc `🔴 Offline`.
   - Banner thông báo trạng thái ngoại tuyến và số lượng phiếu đang đợi đồng bộ.
4. **Hàng đợi đồng bộ thông minh (Sync Queue)**:
   - Tự động kích hoạt đồng bộ khi sự kiện `online` xảy ra.
   - Hỗ trợ nút kích hoạt đồng bộ thủ công.
   - Xử lý phân loại trạng thái: `PENDING` (Chờ sync), `SYNCED` (Đã lưu máy chủ), `FAILED` (Lỗi kèm nguyên nhân).
5. **Bộ lọc & Tìm kiếm nhanh**:
   - Lọc theo tab trạng thái: Tất cả, Chờ sync, Đã sync, Lỗi.
   - Tìm kiếm theo số phòng, tòa nhà, loại trang thiết bị, người khảo sát.
6. **Cài đặt như ứng dụng gốc (PWA Add to Home Screen)**:
   - Hỗ trợ cài đặt trên Android, iOS và Desktop.
   - Hoạt động toàn màn hình (Standalone display mode).

---

## 3. Technology Stack (Công nghệ sử dụng)
- **Frontend Framework**: React 19, TypeScript
- **Build Tool**: Vite 8
- **PWA & Service Worker**: `vite-plugin-pwa` (Workbox)
- **Local Storage**: IndexedDB (thông qua thư viện promise wrapper `idb`)
- **Styling**: Tailwind CSS, Lucide React Icons
- **Unique Identifier**: `uuid` (v4 sinh khóa ID tại Client)

---

## 4. Project Structure (Kiến trúc thư mục)
```
vku_servey/
├── public/
│   ├── favicon.svg
│   ├── pwa-192x192.svg
│   └── pwa-512x512.svg
├── src/
│   ├── components/
│   │   ├── InstallPwaModal.tsx     # Pop-up cài đặt PWA lên Home Screen
│   │   ├── Navbar.tsx              # Thanh điều hướng, trạng thái Online/Offline
│   │   ├── StatusBadge.tsx         # Huy hiệu trạng thái PENDING/SYNCED/FAILED
│   │   ├── SurveyCard.tsx          # Thẻ tóm tắt thông tin khảo sát
│   │   ├── SurveyDetailModal.tsx   # Modal xem chi tiết, tọa độ GPS, ảnh chụp
│   │   ├── SurveyForm.tsx          # Form khảo sát hiện trường
│   │   └── SyncBanner.tsx          # Banner cảnh báo ngoại tuyến & đồng bộ
│   ├── db/
│   │   └── index.ts                # Wrapper thao tác với IndexedDB (vku-field-survey)
│   ├── hooks/
│   │   └── useNetwork.ts           # Custom Hook theo dõi trạng thái mạng online/offline
│   ├── services/
│   │   ├── apiService.ts           # Tương tác REST API (hỗ trợ cả Remote API thật & Mock)
│   │   ├── surveyService.ts        # Điều phối luồng nghiệp vụ Offline-First
│   │   └── syncService.ts          # Xử lý hàng đợi đồng bộ Sync Queue
│   ├── types/
│   │   └── survey.ts               # Định nghĩa TypeScript interfaces & data types
│   ├── utils/
│   │   └── cn.ts                   # Helper merge Tailwind CSS classes
│   ├── App.tsx                     # Màn hình chính Dashboard & điều hướng
│   ├── index.css                   # Global styles & Tailwind directives
│   └── main.tsx                    # Entry point & đăng ký Service Worker
├── index.html                      # PWA meta tags & viewport config
├── tailwind.config.js              # Cấu hình màu sắc nhận diện thương hiệu VKU
├── vite.config.ts                  # Cấu hình Vite & VitePWA manifest/caching
└── package.json
```

---

## 5. Cài đặt và Khởi chạy

### Cài đặt dependencies:
```bash
npm install
```

### Chạy môi trường phát triển (Development):
```bash
npm run dev
```
Truy cập trình duyệt tại: `http://localhost:5173`

### Build phiên bản Production:
```bash
npm run build
```

### Xem thử bản build Production:
```bash
npm run preview
```

---

## 6. PWA Architecture & Offline-First Strategy

### Luồng xử lý dữ liệu chuẩn Offline-First:
```
[ Người dùng nhấn Gửi phiếu ]
             │
             ▼
[ Lưu phiếu vào IndexedDB ] ── (Trạng thái: PENDING)
             │
             ├──► [ Báo lưu thành công ngay cho người dùng ]
             │
      ┌──────┴────────────────────────┐
      ▼                               ▼
[ Đang Online ]                 [ Đang Offline ]
      │                               │
      ▼                               ▼
[ Gửi POST lên Server ]         [ Dữ liệu nằm an toàn trong IndexedDB ]
      │                               │
 ┌────┴────────────┐                  │ (Khi có mạng trở lại: online event)
 ▼                 ▼                  │
[Thành công]    [Thất bại]            │
 │                 │                  │
 ▼                 ▼                  ▼
[Đổi: SYNCED]   [Đổi: FAILED]   [Sync Queue kích hoạt đồng bộ]
```

### Chiến lược Caching (Service Worker Cache Strategy):
1. **App Shell (HTML, CSS, JS Bundles, Icons)**:
   - **Cache First**: Tải tài nguyên trực tiếp từ Cache lưu trữ của Service Worker để ứng dụng mở tức thì ngay cả khi hoàn toàn mất mạng.
2. **API Data**:
   - **Network First**: Thử lấy dữ liệu mới nhất từ Server, nếu mất mạng thì tự động fallback về dữ liệu cục bộ trong IndexedDB.

---

## 7. Kiểm thử kịch bản nghiệm thu (Acceptance Tests)

| Kịch bản | Thao tác kiểm tra | Kết quả kỳ vọng |
| :--- | :--- | :--- |
| **TEST 1** | Có Internet → Mở ứng dụng | Header hiện `🟢 Online`, app hoạt động mượt mà. |
| **TEST 2** | Tắt Internet (hoặc bật Offline trong DevTools) → Reload trang | Trang vẫn tải tức thì nhờ App Shell được cache bởi Service Worker. |
| **TEST 3** | Đang Offline → Điền form và Submit phiếu khảo sát | Lưu thành công, thông báo lưu cục bộ an toàn. |
| **TEST 4** | Reload trình duyệt khi vẫn đang Offline | Phiếu khảo sát vừa tạo vẫn hiển thị nguyên vẹn (chứng minh IndexedDB hoạt động). |
| **TEST 5** | Kiểm tra trạng thái phiếu vừa tạo khi offline | Badge hiển thị `PENDING` (màu vàng cam). |
| **TEST 6** | Bật lại Internet | Ứng dụng tự phát hiện sự kiện `online`, thông báo tự động đồng bộ. |
| **TEST 7** | Sau khi sync xong | Trạng thái phiếu tự động chuyển từ `PENDING` sang `SYNCED` (màu xanh lục). |
| **TEST 8** | Cài đặt ứng dụng | Thanh thông báo PWA xuất hiện, có thể "Thêm vào màn hình chính". |

---

## 8. Hướng dẫn đóng gói Android APK với Capacitor
Project đã được cấu trúc hoàn toàn tương thích với Capacitor (Mobile-first, tách riêng API URL thông qua environment variable, hỗ trợ responsive hoàn hảo).

Khi cần đóng gói thành file APK cho Android:
```bash
# 1. Cài đặt Capacitor Core & Android CLI
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Khởi tạo cấu hình Capacitor
npx cap init "VKU Field Survey" "vn.edu.vku.survey" --web-dir "dist"

# 3. Build mã nguồn web thành thư mục dist
npm run build

# 4. Thêm nền tảng Android
npx cap add android

# 5. Đồng bộ mã nguồn và assets vào dự án Android
npx cap sync

# 6. Mở Android Studio để build file APK
npx cap open android
```

---

## 9. Triển khai (Deployment)
Ứng dụng có thể triển khai lên **Vercel** hoặc **Cloudflare Pages** với giao thức bảo mật HTTPS chuẩn PWA:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18+ / 20+
