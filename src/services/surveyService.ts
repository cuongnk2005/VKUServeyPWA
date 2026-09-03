import { v4 as uuidv4 } from 'uuid';
import type { Survey, FacilityType, Condition } from '../types/survey';
import { saveSurvey, getAllSurveys, getSurvey, deleteSurvey, markSurveyAsSynced } from '../db';
import { apiService } from './apiService';

export interface CreateSurveyInput {
  building: string;
  room: string;
  facilityType: FacilityType;
  condition: Condition;
  description: string;
  inspectorName: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
}

export const surveyService = {
  /**
   * Tạo một survey mới theo chuẩn Offline-First
   */
  async createSurvey(input: CreateSurveyInput): Promise<Survey> {
    const newSurvey: Survey = {
      id: uuidv4(),
      ...input,
      createdAt: new Date().toISOString(),
      syncStatus: 'PENDING',
    };

    // 1. Luôn lưu vào IndexedDB trước tiên (Offline protection)
    await saveSurvey(newSurvey);

    // 2. Nếu đang online, thử upload lên server ngay
    if (navigator.onLine) {
      try {
        const res = await apiService.uploadSurvey(newSurvey);
        if (res.success) {
          await markSurveyAsSynced(newSurvey.id);
          newSurvey.syncStatus = 'SYNCED';
          newSurvey.syncedAt = new Date().toISOString();
        }
      } catch {
        // Nếu lỗi mạng ngầm, survey vẫn an toàn ở IndexedDB với status = 'PENDING'
      }
    }

    return newSurvey;
  },

  /**
   * Lấy tất cả surveys từ local IndexedDB
   */
  async getSurveys(): Promise<Survey[]> {
    return getAllSurveys();
  },

  /**
   * Lấy chi tiết 1 survey
   */
  async getSurveyById(id: string): Promise<Survey | undefined> {
    return getSurvey(id);
  },

  /**
   * Xóa một survey
   */
  async removeSurvey(id: string): Promise<void> {
    return deleteSurvey(id);
  },
};
