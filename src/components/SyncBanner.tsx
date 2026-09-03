import React from 'react';
import { WifiOff, CloudUpload, RefreshCw } from 'lucide-react';

interface SyncBannerProps {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  onSync: () => void;
}

export const SyncBanner: React.FC<SyncBannerProps> = ({
  isOnline,
  pendingCount,
  isSyncing,
  onSync,
}) => {
  if (!isOnline) {
    return (
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-sm border-b border-amber-600/30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded-lg bg-white/20">
              <WifiOff className="w-4 h-4 shrink-0" />
            </span>
            <span>
              <strong>Chế độ Offline:</strong> Bạn đang ngắt kết nối Internet. Mọi phiếu khảo sát tạo mới sẽ được lưu trữ an toàn trong IndexedDB của trình duyệt và tự động đẩy lên server ngay khi có mạng trở lại.
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-sm border-b border-blue-700/30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-xs sm:text-sm font-medium gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded-lg bg-white/20">
              <CloudUpload className="w-4 h-4 shrink-0 animate-bounce" />
            </span>
            <span>
              Có <strong>{pendingCount}</strong> phiếu khảo sát đang chờ đồng bộ lên máy chủ.
            </span>
          </div>
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="px-3 py-1.5 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 shrink-0 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Đang gửi...' : 'Đồng bộ ngay'}</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};
