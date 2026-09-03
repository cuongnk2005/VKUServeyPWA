import React from 'react';
import { Wifi, WifiOff, RefreshCw, ClipboardCheck, Plus, Sparkles, Download } from 'lucide-react';

interface NavbarProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  onSync: () => void;
  onOpenNewSurvey?: () => void;
  onSeedData?: () => void;
  onOpenInstallModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isOnline,
  isSyncing,
  pendingCount,
  onSync,
  onOpenNewSurvey,
  onSeedData,
  onOpenInstallModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* VKU Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-blue-700 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                VKU Survey
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                PWA Offline-First
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden xs:block">
              Hệ thống khảo sát cơ sở vật chất khuôn viên VKU
            </p>
          </div>
        </div>

        {/* Right Actions & Status */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick seed data for testing (visible on desktop/tablet) */}
          {onSeedData && (
            <button
              onClick={onSeedData}
              title="Nạp dữ liệu mẫu để test"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Dữ liệu mẫu</span>
            </button>
          )}

          {/* Nút Cài đặt App */}
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              title="Cài đặt ứng dụng về máy"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-xl transition-all active:scale-95 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Cài đặt App</span>
            </button>
          )}

          {/* Quick New Survey button on Navbar for desktop */}
          {onOpenNewSurvey && (
            <button
              onClick={onOpenNewSurvey}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo phiếu mới</span>
            </button>
          )}

          {/* Online/Offline Status Indicator */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-sm ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                : 'bg-rose-50 text-rose-700 border border-rose-200/80 animate-pulse'
            }`}
          >
            {isOnline ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Wifi className="w-3.5 h-3.5" />
                <span className="font-bold">Online</span>
              </>
            ) : (
              <>
                <span className="inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                <WifiOff className="w-3.5 h-3.5" />
                <span className="font-bold">Offline</span>
              </>
            )}
          </div>

          {/* Manual Sync Button */}
          {pendingCount > 0 && isOnline && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              title="Đồng bộ ngay lên máy chủ"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/80 transition-colors text-xs font-semibold disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
