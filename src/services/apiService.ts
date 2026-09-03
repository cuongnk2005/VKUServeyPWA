import type { Survey } from '../types/survey';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vku-survey-api.mock/api';

/**
 * Service giao tiếp với Remote REST API
 */
export const apiService = {
  /**
   * Upload một survey lên Remote Server
   */
  async uploadSurvey(survey: Survey): Promise<{ success: boolean; data?: unknown; error?: string }> {
    // Nếu thiết bị đang offline theo navigator, ngắt ngay
    if (!navigator.onLine) {
      throw new Error('Device is offline');
    }

    try {
      // Nếu có backend thật cấu hình trong VITE_API_URL, gọi thật:
      if (import.meta.env.VITE_API_URL) {
        const response = await fetch(`${API_BASE_URL}/surveys`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(survey),
        });

        if (!response.ok) {
          throw new Error(`Server returned status: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, data };
      }

      // MOCK SERVER MODE: Giả lập gửi lên server với độ trễ 600ms
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Lưu lại vào localStorage để minh chứng server đã nhận dữ liệu nếu test demo
      const serverDatabase: Survey[] = JSON.parse(
        localStorage.getItem('vku_mock_server_surveys') || '[]'
      );
      const existingIdx = serverDatabase.findIndex((s) => s.id === survey.id);
      if (existingIdx >= 0) {
        serverDatabase[existingIdx] = { ...survey, syncStatus: 'SYNCED' };
      } else {
        serverDatabase.push({ ...survey, syncStatus: 'SYNCED' });
      }
      localStorage.setItem('vku_mock_server_surveys', JSON.stringify(serverDatabase));

      return { success: true, data: { id: survey.id, message: 'Synced to mock server' } };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown network error';
      return { success: false, error: message };
    }
  },

  /**
   * Lấy danh sách survey từ remote server (nếu cần đối chiếu)
   */
  async fetchRemoteSurveys(): Promise<Survey[]> {
    if (import.meta.env.VITE_API_URL) {
      const res = await fetch(`${API_BASE_URL}/surveys`);
      return res.json();
    }
    return JSON.parse(localStorage.getItem('vku_mock_server_surveys') || '[]');
  },
};
