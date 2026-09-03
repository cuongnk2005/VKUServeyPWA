import React from 'react';
import type { Survey } from '../types/survey';
import { StatusBadge } from './StatusBadge';
import { MapPin, Calendar, User, ChevronRight, AlertTriangle, Image as ImageIcon } from 'lucide-react';

interface SurveyCardProps {
  survey: Survey;
  onClick: () => void;
}

const CONDITION_COLORS = {
  Good: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  'Minor Issue': 'bg-amber-50 text-amber-700 border-amber-200/80',
  Broken: 'bg-orange-50 text-orange-700 border-orange-200/80',
  'Needs Replacement': 'bg-rose-50 text-rose-700 border-rose-200/80',
};

export const SurveyCard: React.FC<SurveyCardProps> = ({ survey, onClick }) => {
  const formattedDate = new Date(survey.createdAt).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300/80 transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99]"
    >
      <div>
        {/* Card Header: Building - Room & Sync Badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                {survey.building} - {survey.room}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-[11px] font-bold text-slate-700">
                {survey.facilityType}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  CONDITION_COLORS[survey.condition] || 'bg-slate-50 text-slate-600'
                }`}
              >
                {survey.condition}
              </span>
            </div>
          </div>
          <StatusBadge status={survey.syncStatus} />
        </div>

        {/* Thumbnail Preview if attached */}
        {survey.imageUrl && (
          <div className="relative mb-3 rounded-xl overflow-hidden h-32 w-full bg-slate-100 border border-slate-100">
            <img
              src={survey.imageUrl}
              alt="Survey photo preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 text-white rounded-md text-[10px] font-medium flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> Đính kèm ảnh
            </span>
          </div>
        )}

        {/* Description preview */}
        {survey.description ? (
          <p className="text-xs text-slate-600 line-clamp-2 mb-3 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 italic leading-relaxed">
            "{survey.description}"
          </p>
        ) : (
          <p className="text-xs text-slate-400 italic mb-3">Chưa có ghi chú mô tả thêm.</p>
        )}
      </div>

      {/* Metadata footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[100px] sm:max-w-none">{survey.inspectorName}</span>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-600 transition-colors font-semibold">
          {survey.latitude && (
            <span title="Có vị trí GPS">
              <MapPin className="w-3.5 h-3.5 text-sky-500" />
            </span>
          )}
          {survey.syncStatus === 'FAILED' && (
            <span title="Đồng bộ gặp lỗi">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            </span>
          )}
          <span className="text-xs">Chi tiết</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
