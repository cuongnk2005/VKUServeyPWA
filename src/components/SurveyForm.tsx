import React, { useState } from 'react';
import type { FacilityType, Condition } from '../types/survey';
import type { CreateSurveyInput } from '../services/surveyService';
import { MapPin, Camera, X, Check, Loader2, Sparkles, Building2 } from 'lucide-react';
import { Geolocation as CapacitorGeolocation } from '@capacitor/geolocation';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';

interface SurveyFormProps {
  onSubmit: (data: CreateSurveyInput) => Promise<void>;
  onCancel: () => void;
}

const BUILDINGS = [
  'Tòa A (Khu Hiệu Bộ)',
  'Tòa B (Giảng Đường)',
  'Tòa C (Giảng Đường)',
  'Tòa V (Viện Nghiên Cứu)',
  'Tòa K (Khu Thực Hành Lab)',
  'Khu Ký Túc Xá',
  'Thư Viện Trung Tâm',
  'Khu Thể Thao',
];

const FACILITY_TYPES: { value: FacilityType; label: string; icon: string }[] = [
  { value: 'Light', label: 'Bóng đèn / Hệ thống chiếu sáng', icon: '💡' },
  { value: 'Fan', label: 'Quạt trần / Quạt tường', icon: '🌀' },
  { value: 'Air Conditioner', label: 'Điều hòa không khí / Máy lạnh', icon: '❄️' },
  { value: 'Table', label: 'Bàn học / Bàn làm việc', icon: '🪵' },
  { value: 'Chair', label: 'Ghế ngồi sinh viên / giảng viên', icon: '🪑' },
  { value: 'Computer', label: 'Máy tính PC / Thiết bị CNTT Lab', icon: '🖥️' },
  { value: 'Projector', label: 'Máy chiếu / Màn hình tương tác', icon: '📽️' },
  { value: 'Network', label: 'Bộ phát Wifi / Cổng mạng LAN', icon: '📶' },
  { value: 'Other', label: 'Thiết bị cơ sở vật chất khác', icon: '📦' },
];

const CONDITIONS: { value: Condition; label: string; desc: string; badgeColor: string; borderActive: string }[] = [
  {
    value: 'Good',
    label: 'Tốt (Good)',
    desc: 'Thiết bị hoạt động ổn định bình thường',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    borderActive: 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-400',
  },
  {
    value: 'Minor Issue',
    label: 'Lỗi nhẹ (Minor)',
    desc: 'Có tiếng ồn, bám bụi, lỏng ốc hoặc chập chờn nhẹ',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    borderActive: 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400',
  },
  {
    value: 'Broken',
    label: 'Hỏng hóc (Broken)',
    desc: 'Không thể khởi động, hư hỏng linh kiện hoặc bể vỡ',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
    borderActive: 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-400',
  },
  {
    value: 'Needs Replacement',
    label: 'Cần thay mới (Replace)',
    desc: 'Hư hỏng hoàn toàn, không thể sửa chữa',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    borderActive: 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-400',
  },
];

export const SurveyForm: React.FC<SurveyFormProps> = ({ onSubmit, onCancel }) => {
  const [building, setBuilding] = useState('Tòa A (Khu Hiệu Bộ)');
  const [room, setRoom] = useState('');
  const [facilityType, setFacilityType] = useState<FacilityType>('Air Conditioner');
  const [condition, setCondition] = useState<Condition>('Good');
  const [description, setDescription] = useState('');
  const [inspectorName, setInspectorName] = useState(() => localStorage.getItem('vku_inspector_name') || 'Nguyễn Văn A');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Xử lý lấy vị trí GPS bằng Capacitor
  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    try {
      const permission = await CapacitorGeolocation.checkPermissions();
      if (permission.location !== 'granted') {
        const req = await CapacitorGeolocation.requestPermissions();
        if (req.location !== 'granted') {
          alert('Vui lòng cấp quyền truy cập vị trí để tiếp tục.');
          setIsGettingLocation(false);
          return;
        }
      }

      const pos = await CapacitorGeolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      setLatitude(Number(pos.coords.latitude.toFixed(6)));
      setLongitude(Number(pos.coords.longitude.toFixed(6)));
    } catch (err) {
      console.warn('Geolocation error:', err);
      // Fallback default coordinates VKU Campus
      setLatitude(15.97529);
      setLongitude(108.25324);
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Xử lý ảnh chụp / upload bằng Capacitor Camera
  const handleTakePhoto = async () => {
    try {
      const photo = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });
      
      if (photo.dataUrl) {
        setImageUrl(photo.dataUrl);
      }
    } catch (error) {
      console.warn('User cancelled or error taking photo', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room.trim()) {
      setErrorMsg('Vui lòng nhập tên/số phòng (ví dụ: A101, B205, Lab 402)');
      return;
    }
    if (!inspectorName.trim()) {
      setErrorMsg('Vui lòng nhập tên người thực hiện khảo sát');
      return;
    }

    localStorage.setItem('vku_inspector_name', inspectorName);
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        building: building.split(' (')[0], // Rút gọn tên tòa nếu cần
        room: room.trim().toUpperCase(),
        facilityType,
        condition,
        description: description.trim(),
        inspectorName: inspectorName.trim(),
        latitude,
        longitude,
        imageUrl,
      });
    } catch (err) {
      setErrorMsg('Có lỗi xảy ra khi lưu phiếu khảo sát');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-200/80 overflow-hidden mb-8 transition-all animate-in fade-in duration-200">
      {/* Form Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Tạo Phiếu Khảo Sát Cơ Sở Vật Chất
            </h2>
            <p className="text-xs text-slate-500">
              Dữ liệu sẽ được lưu cục bộ (IndexedDB) và tự động đồng bộ khi online
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {errorMsg && (
        <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Body - Responsive 2-column layout on Desktop */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CỘT TRÁI: Thông tin địa điểm & Thiết bị */}
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                1. Thông tin vị trí & Cơ sở vật chất
              </h3>
            </div>

            {/* Tòa nhà & Phòng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tòa nhà / Khuôn viên <span className="text-rose-500">*</span>
                </label>
                <select
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
                >
                  {BUILDINGS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phòng / Địa điểm cụ thể <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: A101, B205, Lab 403"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold uppercase tracking-wide transition-colors"
                />
              </div>
            </div>

            {/* Loại cơ sở vật chất */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Loại trang thiết bị khảo sát <span className="text-rose-500">*</span>
              </label>
              <select
                value={facilityType}
                onChange={(e) => setFacilityType(e.target.value as FacilityType)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
              >
                {FACILITY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tình trạng trang thiết bị */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Đánh giá tình trạng hoạt động <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CONDITIONS.map((cond) => {
                  const isSelected = condition === cond.value;
                  return (
                    <button
                      type="button"
                      key={cond.value}
                      onClick={() => setCondition(cond.value)}
                      className={`p-3 text-left rounded-2xl border text-xs transition-all flex flex-col justify-between ${
                        isSelected
                          ? cond.borderActive
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span>{cond.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        {cond.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Người kiểm tra, GPS, Hình ảnh, Mô tả */}
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                2. Bằng chứng & Chi tiết ghi nhận
              </h3>
            </div>

            {/* Người khảo sát */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Cán bộ / Sinh viên khảo sát <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                placeholder="Họ và tên người kiểm tra..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
              />
            </div>

            {/* Vị trí GPS & Chụp ảnh */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Geolocation Button */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tọa độ vị trí thực địa
                </label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    latitude && longitude
                      ? 'bg-sky-50 border-sky-300 text-sky-700'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {isGettingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                  ) : (
                    <MapPin className="w-4 h-4 text-sky-600" />
                  )}
                  <span className="truncate">
                    {latitude && longitude ? `${latitude}, ${longitude}` : 'Lấy tọa độ GPS'}
                  </span>
                </button>
              </div>

              {/* Photo Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ảnh chụp hiện trường
                </label>
                <button
                  type="button"
                  onClick={handleTakePhoto}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span>{imageUrl ? 'Chụp lại ảnh' : 'Chụp / Tải ảnh'}</span>
                </button>
              </div>
            </div>

            {/* Photo Preview if attached */}
            {imageUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-48 bg-slate-100 flex items-center justify-center">
                <img src={imageUrl} alt="Survey preview" className="object-cover w-full h-48" />
                <button
                  type="button"
                  onClick={() => setImageUrl(undefined)}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-black transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mô tả chi tiết */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Ghi chú chi tiết sự cố / Đề xuất khắc phục
              </label>
              <textarea
                rows={3}
                placeholder="Ghi chú chi tiết hiện trạng thiết bị, nguyên nhân lỗi hoặc linh kiện cần thay thế..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium resize-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t border-slate-200/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang lưu phiếu...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Lưu Phiếu Khảo Sát</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
