import React from 'react';
import type { Survey } from '../types/survey';
import { StatusBadge } from './StatusBadge';
import { X, MapPin, Calendar, User, Trash2, ExternalLink, Building2, Tag, Activity } from 'lucide-react';

interface SurveyDetailModalProps {
  survey: Survey | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const SurveyDetailModal: React.FC<SurveyDetailModalProps> = ({
  survey,
  onClose,
  onDelete,
}) => {
  if (!survey) return null;

  const formattedDate = new Date(survey.createdAt).toLocaleString('vi-VN', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                {survey.building} - Phòng {survey.room}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Mã phiếu: {survey.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Top Status & Facility Type */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-slate-500">Thiết bị:</span>
              <span className="text-sm font-bold text-slate-900">{survey.facilityType}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Đồng bộ:</span>
              <StatusBadge status={survey.syncStatus} size="md" />
            </div>
          </div>

          {/* Grid Layout: Photo on Left / Details on Right (on desktop) */}
          <div className={`grid grid-cols-1 ${survey.imageUrl ? 'md:grid-cols-2' : ''} gap-5`}>
            {/* Photo if exists */}
            {survey.imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shadow-inner max-h-72 md:max-h-none">
                <img
                  src={survey.imageUrl}
                  alt="Survey item detail"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Details Panel */}
            <div className="space-y-4">
              <div className="bg-slate-50/80 rounded-2xl p-4 space-y-3 border border-slate-200/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <Activity className="w-3.5 h-3.5 text-blue-500" /> Tình trạng:
                  </span>
                  <span className="font-bold text-slate-800 px-2 py-0.5 rounded-lg bg-white border border-slate-200">
                    {survey.condition}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Người khảo sát:
                  </span>
                  <span className="font-bold text-slate-800">{survey.inspectorName}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Thời gian tạo:
                  </span>
                  <span className="font-medium text-slate-700 text-[11px]">{formattedDate}</span>
                </div>

                {survey.syncedAt && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Thời gian đã sync:</span>
                    <span className="font-medium text-emerald-700 text-[11px]">
                      {new Date(survey.syncedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>

              {/* GPS Coordinates */}
              {survey.latitude && survey.longitude && (
                <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-100 flex items-center justify-between text-xs text-sky-900">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <p className="font-bold">Tọa độ GPS thực địa</p>
                      <p className="font-mono text-[11px] text-sky-700">
                        {survey.latitude}, {survey.longitude}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${survey.latitude},${survey.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-white text-sky-700 rounded-xl font-bold shadow-sm hover:bg-sky-50 flex items-center gap-1 transition-colors"
                  >
                    Xem Bản Đồ <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {survey.description && (
            <div>
              <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Ghi chú chi tiết sự cố / Đề xuất:
              </span>
              <p className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-700 leading-relaxed border border-slate-200/70 whitespace-pre-wrap">
                {survey.description}
              </p>
            </div>
          )}

          {/* Error if failed */}
          {survey.syncError && (
            <div className="p-4 bg-rose-50 rounded-2xl text-xs text-rose-700 border border-rose-200">
              <strong className="block mb-1">Lỗi trong quá trình đồng bộ:</strong>
              <p className="font-mono text-[11px]">{survey.syncError}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (confirm('Bạn có chắc muốn xóa phiếu khảo sát này khỏi IndexedDB?')) {
                onDelete(survey.id);
                onClose();
              }
            }}
            className="px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Xóa phiếu khảo sát
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
