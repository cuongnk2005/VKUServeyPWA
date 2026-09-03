import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, PlusSquare, CheckCircle2, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPwaModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBottomBanner, setShowBottomBanner] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Kiểm tra nếu app đang chạy trong chế độ standalone (đã cài đặt)
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone);

    if (isStandaloneMode) {
      setIsInstalled(true);
      return;
    }

    // 2. Nhận biết thiết bị iOS (iPhone, iPad, iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 3. Lắng nghe sự kiện beforeinstallprompt (Android Chrome, Edge, Desktop Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault(); // Ngăn pop-up mặc định của trình duyệt để tự điều khiển UI
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Tự động hiển thị banner gợi ý nếu chưa cài đặt
      setShowBottomBanner(true);
    };

    // 4. Lắng nghe khi người dùng đã cài đặt thành công
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBottomBanner(false);
      setShowGuideModal(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Xử lý khi bấm nút "Cài đặt ngay"
  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      // Gọi prompt cài đặt gốc của hệ điều hành Android/Desktop
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBottomBanner(false);
        setShowGuideModal(false);
      }
      setDeferredPrompt(null);
    } else {
      // Nếu không có deferredPrompt (iOS Safari hoặc Desktop), mở modal hướng dẫn chi tiết
      setShowGuideModal(true);
    }
  };

  const isModalVisible = externalIsOpen !== undefined ? externalIsOpen : showGuideModal;
  const handleCloseModal = () => {
    if (externalOnClose) {
      externalOnClose();
    }
    setShowGuideModal(false);
  };

  // Nếu đã cài đặt như App thì không hiển thị banner
  if (isInstalled) return null;

  return (
    <>
      {/* 1. BOTTOM FLOATING BANNER (Gợi ý cài đặt nhanh ở góc màn hình) */}
      {showBottomBanner && !isModalVisible && (
        <aside
          aria-label="Gợi ý cài đặt ứng dụng"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-3xl shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/30">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold leading-snug">Cài đặt VKU Survey</p>
              <p className="text-[11px] text-slate-300">Hoạt động mượt mà và Offline như App gốc</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleTriggerInstall}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              Cài đặt
            </button>
            <button
              onClick={() => setShowBottomBanner(false)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* 2. MODAL HƯỚNG DẪN CÀI ĐẶT CHI TIẾT (Dành cho iOS, Android hoặc Desktop) */}
      {isModalVisible && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 text-slate-800">
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                  Cài đặt VKU Survey
                </h3>
                <p className="text-xs text-slate-500">Trải nghiệm ứng dụng không cần Internet</p>
              </div>
            </div>

            {/* Instructions based on platform */}
            {isIOS ? (
              /* Hướng dẫn riêng cho iPhone/iPad trên Safari */
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="p-3.5 bg-blue-50 rounded-2xl text-blue-900 border border-blue-100 font-medium leading-relaxed">
                  Để cài đặt trên <strong>iOS (iPhone / iPad)</strong>, vui lòng làm theo 2 bước đơn giản trên trình duyệt Safari:
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                      1
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 flex items-center gap-1.5">
                        Nhấn vào nút Chia sẻ <Share className="w-3.5 h-3.5 text-blue-600" />
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Nút biểu tượng ô vuông mũi tên lên ở thanh công cụ dưới đáy Safari.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                      2
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 flex items-center gap-1.5">
                        Chọn "Thêm vào MH chính" <PlusSquare className="w-3.5 h-3.5 text-blue-600" />
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        (Add to Home Screen) và nhấn <strong>Thêm (Add)</strong> ở góc trên bên phải.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : deferredPrompt ? (
              /* Hướng dẫn cho Android / Chrome khi đã có prompt */
              <div className="space-y-4 text-xs sm:text-sm">
                <p className="text-slate-600 leading-relaxed">
                  Ứng dụng sẽ được cài đặt trực tiếp vào màn hình chính điện thoại hoặc máy tính của bạn với biểu tượng icon VKU chính thức.
                </p>
                <div className="space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Mở app toàn màn hình không có thanh địa chỉ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Lưu trữ dữ liệu Offline ngay cả khi mất sóng hoàn toàn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Tự động cập nhật phiên bản mới nhất khi có kết nối mạng</span>
                  </div>
                </div>
                <button
                  onClick={handleTriggerInstall}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-98 flex items-center justify-center gap-2 text-sm mt-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Cài đặt ngay vào máy</span>
                </button>
              </div>
            ) : (
              /* Hướng dẫn trên Desktop Chrome / Edge khi không có prompt tự động */
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 leading-relaxed text-slate-600">
                  <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                    <Monitor className="w-4 h-4 text-blue-600" />
                    <span>Cài đặt trên Máy tính (Desktop):</span>
                  </div>
                  <p>
                    Nhìn lên góc phải thanh địa chỉ trình duyệt Chrome hoặc Edge, nhấp vào biểu tượng{' '}
                    <strong className="text-blue-600">"Cài đặt ứng dụng" (Install)</strong> để ghim app vào thanh Taskbar/Desktop.
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-colors text-xs"
                >
                  Đã hiểu
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
