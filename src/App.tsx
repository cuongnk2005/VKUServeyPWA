import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Survey, SyncStatus } from './types/survey';
import { surveyService, type CreateSurveyInput } from './services/surveyService';
import { syncPendingSurveys, subscribeSyncState } from './services/syncService';
import { useNetwork } from './hooks/useNetwork';
import { Navbar } from './components/Navbar';
import { SyncBanner } from './components/SyncBanner';
import { SurveyCard } from './components/SurveyCard';
import { SurveyForm } from './components/SurveyForm';
import { SurveyDetailModal } from './components/SurveyDetailModal';
import { InstallPwaModal } from './components/InstallPwaModal';
import {
  PlusCircle,
  Clock,
  Layers,
  Search,
  RotateCcw,
  Sparkles,
  Inbox,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export function App() {
  const { isOnline } = useNetwork();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [filterStatus, setFilterStatus] = useState<SyncStatus | 'ALL'>('ALL');
  const [filterFacility, setFilterFacility] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Hiển thị toast thông báo
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Tải danh sách survey từ IndexedDB
  const refreshSurveys = useCallback(async () => {
    try {
      const data = await surveyService.getSurveys();
      setSurveys(data);
    } catch (err) {
      console.error('Failed to load surveys from IndexedDB:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lắng nghe trạng thái đồng bộ
  useEffect(() => {
    const unsub = subscribeSyncState((syncing) => {
      setIsSyncing(syncing);
      if (!syncing) {
        refreshSurveys();
      }
    });
    return unsub;
  }, [refreshSurveys]);

  // Khởi tạo và load dữ liệu ban đầu
  useEffect(() => {
    refreshSurveys();
  }, [refreshSurveys]);

  // Xử lý tự động đồng bộ khi có Internet trở lại (Acceptance Test 6 & 7)
  useEffect(() => {
    const handleOnlineEvent = async () => {
      showToast('Đã kết nối Internet! Đang tự động kích hoạt đồng bộ...');
      const res = await syncPendingSurveys();
      await refreshSurveys();
      if (res.syncedCount > 0) {
        showToast(`Đã đồng bộ thành công ${res.syncedCount} phiếu khảo sát!`);
      }
    };

    window.addEventListener('online', handleOnlineEvent);
    return () => window.removeEventListener('online', handleOnlineEvent);
  }, [refreshSurveys, showToast]);

  // Thực hiện đồng bộ thủ công
  const handleManualSync = async () => {
    if (!isOnline) {
      showToast('Hiện không có mạng Internet để đồng bộ');
      return;
    }
    const res = await syncPendingSurveys();
    await refreshSurveys();
    if (res.syncedCount > 0) {
      showToast(`Đồng bộ thành công ${res.syncedCount} phiếu lên server!`);
    } else if (res.totalPending === 0) {
      showToast('Tất cả dữ liệu khảo sát đã được đồng bộ');
    } else if (res.failedCount > 0) {
      showToast(`Đồng bộ thất bại ${res.failedCount} phiếu. Vui lòng thử lại!`);
    }
  };

  // Thêm khảo sát mới
  const handleCreateSurvey = async (input: CreateSurveyInput) => {
    const created = await surveyService.createSurvey(input);
    setShowForm(false);
    await refreshSurveys();

    if (created.syncStatus === 'SYNCED') {
      showToast('Tạo và gửi lên server thành công!');
    } else {
      showToast('Đã lưu an toàn vào máy (IndexedDB)!');
    }
  };

  // Xóa khảo sát
  const handleDeleteSurvey = async (id: string) => {
    await surveyService.removeSurvey(id);
    await refreshSurveys();
    showToast('Đã xóa phiếu khảo sát');
  };

  // Nạp dữ liệu mẫu để test nhanh
  const handleSeedDemoData = async () => {
    const sampleItems: CreateSurveyInput[] = [
      {
        building: 'Tòa A',
        room: 'A102',
        facilityType: 'Air Conditioner',
        condition: 'Broken',
        description: 'Điều hòa Panasonic phòng hội đồng chảy nước, remote bị hỏng.',
        inspectorName: 'Nguyễn Văn Nam',
      },
      {
        building: 'Tòa V',
        room: 'V305',
        facilityType: 'Projector',
        condition: 'Minor Issue',
        description: 'Máy chiếu Epson hình ảnh ngả vàng, quạt tản nhiệt kêu to.',
        inspectorName: 'Trần Thị Thảo',
      },
      {
        building: 'Tòa K',
        room: 'K201',
        facilityType: 'Computer',
        condition: 'Good',
        description: 'Phòng Lab 45 máy tính Dell hoạt động ổn định, mạng Gigabit tốt.',
        inspectorName: 'Lê Hoàng Anh',
      },
      {
        building: 'Tòa B',
        room: 'B104',
        facilityType: 'Light',
        condition: 'Needs Replacement',
        description: 'Bóng đèn huỳnh quang nhấp nháy liên tục, chấn lưu bị cháy khét.',
        inspectorName: 'Đặng Minh Quân',
      },
    ];

    for (const item of sampleItems) {
      await surveyService.createSurvey(item);
    }
    await refreshSurveys();
    showToast('Đã nạp 4 phiếu khảo sát mẫu!');
  };

  // Thống kê số liệu
  const stats = useMemo(() => {
    const total = surveys.length;
    const pending = surveys.filter((s) => s.syncStatus === 'PENDING').length;
    const synced = surveys.filter((s) => s.syncStatus === 'SYNCED').length;
    const failed = surveys.filter((s) => s.syncStatus === 'FAILED').length;
    return { total, pending, synced, failed };
  }, [surveys]);

  // Danh sách đã lọc & tìm kiếm
  const filteredSurveys = useMemo(() => {
    return surveys.filter((survey) => {
      const matchStatus =
        filterStatus === 'ALL' ? true : survey.syncStatus === filterStatus;
      const matchFacility =
        filterFacility === 'ALL' ? true : survey.facilityType === filterFacility;
      const matchSearch =
        searchQuery === ''
          ? true
          : survey.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
            survey.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
            survey.facilityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            survey.inspectorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            survey.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
            survey.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchFacility && matchSearch;
    });
  }, [surveys, filterStatus, filterFacility, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col justify-between text-slate-800">
      {/* Cài đặt PWA Prompt & Modal Hướng dẫn */}
      <InstallPwaModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 border border-slate-700">
          {toastMessage}
        </div>
      )}

      <div>
        {/* Responsive Navbar */}
        <Navbar
          isOnline={isOnline}
          isSyncing={isSyncing}
          pendingCount={stats.pending}
          onSync={handleManualSync}
          onOpenNewSurvey={() => setShowForm(true)}
          onSeedData={handleSeedDemoData}
          onOpenInstallModal={() => setShowInstallModal(true)}
        />

        {/* Sync & Offline Banner */}
        <SyncBanner
          isOnline={isOnline}
          pendingCount={stats.pending}
          isSyncing={isSyncing}
          onSync={handleManualSync}
        />

        {/* Responsive Main Dashboard Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Banner & Hero Title */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Khảo Sát Hiện Trường VKU
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Kiểm tra & Ghi nhận cơ sở vật chất phòng học, phòng lab theo chuẩn{' '}
                <strong className="text-blue-600 font-semibold">Offline-First</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSeedDemoData}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Nạp mẫu test</span>
              </button>

              {stats.pending > 0 && isOnline && (
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Đồng bộ ({stats.pending})</span>
                </button>
              )}

              <button
                onClick={() => setShowForm(!showForm)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 ${
                  showForm
                    ? 'bg-slate-800 text-white hover:bg-slate-900'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>{showForm ? 'Đóng Form' : 'Tạo Phiếu Mới'}</span>
              </button>
            </div>
          </div>

          {/* Form tạo mới khảo sát */}
          {showForm && (
            <SurveyForm
              onSubmit={handleCreateSurvey}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* Thống kê Dashboard 4 Cột trải rộng (Stats Grid) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {/* Card 1: Tổng số */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Tổng số phiếu
                </span>
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats.total}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Đã ghi nhận trong IndexedDB</p>
            </div>

            {/* Card 2: Chờ đồng bộ (Pending) */}
            <div className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-sm hover:shadow transition-shadow bg-gradient-to-br from-white via-white to-amber-50/40">
              <div className="flex items-center justify-between text-amber-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Chờ đồng bộ
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4 animate-pulse" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">
                {stats.pending}
              </div>
              <p className="text-[11px] text-amber-600/80 mt-1 font-medium">Sẽ tự sync khi có mạng</p>
            </div>

            {/* Card 3: Đã đồng bộ (Synced) */}
            <div className="bg-white p-5 rounded-3xl border border-emerald-200/80 shadow-sm hover:shadow transition-shadow bg-gradient-to-br from-white via-white to-emerald-50/40">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Đã đồng bộ
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                {stats.synced}
              </div>
              <p className="text-[11px] text-emerald-600/80 mt-1 font-medium">Đã lưu trên máy chủ</p>
            </div>

            {/* Card 4: Lỗi đồng bộ (Failed) */}
            <div className="bg-white p-5 rounded-3xl border border-rose-200/80 shadow-sm hover:shadow transition-shadow bg-gradient-to-br from-white via-white to-rose-50/40">
              <div className="flex items-center justify-between text-rose-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Thất bại / Lỗi
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-700">
                {stats.failed}
              </div>
              <p className="text-[11px] text-rose-600/80 mt-1 font-medium">Có thể thử lại bất kỳ lúc nào</p>
            </div>
          </div>

          {/* Thanh công cụ Tìm kiếm & Bộ lọc (Toolbar) */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm mb-6 space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Tab lọc trạng thái */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-bold">
                {(
                  [
                    { key: 'ALL', label: `Tất cả (${stats.total})` },
                    { key: 'PENDING', label: `Chờ sync (${stats.pending})` },
                    { key: 'SYNCED', label: `Đã sync (${stats.synced})` },
                    { key: 'FAILED', label: `Lỗi (${stats.failed})` },
                  ] as const
                ).map((tab) => {
                  const isActive = filterStatus === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setFilterStatus(tab.key)}
                      className={`px-4 py-2 rounded-2xl whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Lọc loại thiết bị & Tìm kiếm */}
              <div className="flex items-center gap-2.5 flex-1 md:max-w-md">
                {/* Lọc theo loại thiết bị */}
                <div className="relative shrink-0">
                  <select
                    value={filterFacility}
                    onChange={(e) => setFilterFacility(e.target.value)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200/70 border border-slate-200/60 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="ALL">Mọi thiết bị</option>
                    <option value="Light">Bóng đèn</option>
                    <option value="Fan">Quạt</option>
                    <option value="Air Conditioner">Điều hòa</option>
                    <option value="Table">Bàn</option>
                    <option value="Chair">Ghế</option>
                    <option value="Computer">Máy tính PC</option>
                    <option value="Projector">Máy chiếu</option>
                    <option value="Network">Mạng / Wifi</option>
                    <option value="Other">Khác</option>
                  </select>
                </div>

                {/* Ô tìm kiếm search box */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm theo phòng, tòa nhà, người tạo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Danh sách khảo sát - Responsive Grid (1 col mobile, 2 col tablet, 3 col desktop) */}
          {loading ? (
            <div className="p-16 text-center text-sm font-semibold text-slate-400 bg-white rounded-3xl border border-slate-200">
              Đang tải dữ liệu từ cơ sở dữ liệu IndexedDB...
            </div>
          ) : filteredSurveys.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                <Inbox className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <p className="text-base font-bold text-slate-800">
                  Không tìm thấy phiếu khảo sát nào
                </p>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Chưa có phiếu khảo sát phù hợp với bộ lọc hiện tại. Bạn có thể nạp dữ liệu mẫu
                  để thử nghiệm hoặc tạo phiếu mới ngay bây giờ.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleSeedDemoData}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Nạp 4 phiếu khảo sát mẫu</span>
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Tạo phiếu mới</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSurveys.map((survey) => (
                <SurveyCard
                  key={survey.id}
                  survey={survey}
                  onClick={() => setSelectedSurvey(survey)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Responsive Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-12 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span className="font-extrabold text-slate-800">VKU Field Survey PWA</span> • Hệ thống khảo sát cơ sở vật chất
          </div>
          <div className="flex items-center gap-4 text-[11px] font-medium text-slate-400">
            <span>Kiến trúc Offline-First</span>
            <span>•</span>
            <span>IndexedDB + Service Worker</span>
            <span>•</span>
            <span>Tương thích Capacitor</span>
          </div>
        </div>
      </footer>

      {/* Chi tiết phiếu khảo sát Modal */}
      <SurveyDetailModal
        survey={selectedSurvey}
        onClose={() => setSelectedSurvey(null)}
        onDelete={handleDeleteSurvey}
      />
    </div>
  );
}

export default App;
