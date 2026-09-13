import { getPendingSurveys, markSurveyAsSynced, markSurveyAsFailed } from '../db';
import { apiService } from './apiService';
import type { Survey } from '../types/survey';
import { LocalNotifications } from '@capacitor/local-notifications';


export interface SyncResult {
  totalPending: number;
  syncedCount: number;
  failedCount: number;
  errors: Array<{ id: string; error: string }>;
}

let isSyncing = false;
const listeners = new Set<(isSyncing: boolean) => void>();

export function subscribeSyncState(cb: (syncing: boolean) => void) {
  listeners.add(cb);
  cb(isSyncing);
  return () => {
    listeners.delete(cb);
  };
}

function notifySyncState(state: boolean) {
  isSyncing = state;
  listeners.forEach((cb) => cb(state));
}

/**
 * Đồng bộ toàn bộ các bản ghi khảo sát đang ở trạng thái PENDING lên server
 */
export async function syncPendingSurveys(): Promise<SyncResult> {
  // 1. Kiểm tra trạng thái mạng
  if (!navigator.onLine) {
    return { totalPending: 0, syncedCount: 0, failedCount: 0, errors: [] };
  }

  // Tránh đồng bộ song song nhiều lần cùng lúc
  if (isSyncing) {
    return { totalPending: 0, syncedCount: 0, failedCount: 0, errors: [] };
  }

  notifySyncState(true);

  const result: SyncResult = {
    totalPending: 0,
    syncedCount: 0,
    failedCount: 0,
    errors: [],
  };

  try {
    // 2. Lấy danh sách survey PENDING từ IndexedDB
    const pendingList: Survey[] = await getPendingSurveys();
    result.totalPending = pendingList.length;

    if (pendingList.length === 0) {
      notifySyncState(false);
      return result;
    }

    // 3. Tiến hành đồng bộ từng survey một
    for (const survey of pendingList) {
      // Trước mỗi request kiểm tra lại nếu rớt mạng giữa chừng thì ngắt ngay để bảo toàn dữ liệu
      if (!navigator.onLine) {
        break;
      }

      try {
        const response = await apiService.uploadSurvey(survey);

        if (response.success) {
          // 4. Thành công -> Đánh dấu SYNCED trong IndexedDB
          await markSurveyAsSynced(survey.id);
          result.syncedCount++;
        } else {
          // 5. Thất bại logic -> Đánh dấu FAILED kèm lý do
          await markSurveyAsFailed(survey.id, response.error || 'Upload error');
          result.failedCount++;
          result.errors.push({ id: survey.id, error: response.error || 'Upload error' });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Network error during sync';
        await markSurveyAsFailed(survey.id, msg);
        result.failedCount++;
        result.errors.push({ id: survey.id, error: msg });
      }
    }
  } finally {
    notifySyncState(false);
  }

  if (result.syncedCount > 0) {
    try {
      const permStatus = await LocalNotifications.checkPermissions();
      if (permStatus.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Đồng bộ hoàn tất",
            body: `Đã tải lên thành công ${result.syncedCount} phiếu khảo sát.`,
            id: new Date().getTime(),
            schedule: { at: new Date(Date.now() + 1000 * 1) }
          }
        ]
      });
    } catch (e) {
      console.warn("Could not schedule local notification", e);
    }
  }

  return result;
}
