import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Survey, SyncStatus } from '../types/survey';

const DB_NAME = 'vku-field-survey';
const DB_VERSION = 1;
const STORE_NAME = 'surveys';

interface SurveyDB extends DBSchema {
  surveys: {
    key: string;
    value: Survey;
    indexes: {
      'by-syncStatus': SyncStatus;
      'by-createdAt': string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<SurveyDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<SurveyDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SurveyDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
          });
          store.createIndex('by-syncStatus', 'syncStatus');
          store.createIndex('by-createdAt', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Lưu survey vào IndexedDB (mặc định hoặc cập nhật)
 */
export async function saveSurvey(survey: Survey): Promise<string> {
  const db = await getDB();
  await db.put(STORE_NAME, survey);
  return survey.id;
}

/**
 * Lấy 1 survey theo id
 */
export async function getSurvey(id: string): Promise<Survey | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

/**
 * Lấy tất cả surveys (sắp xếp mới nhất trước)
 */
export async function getAllSurveys(): Promise<Survey[]> {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);
  return all.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Lấy danh sách surveys chưa được đồng bộ (syncStatus === 'PENDING')
 */
export async function getPendingSurveys(): Promise<Survey[]> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const index = tx.store.index('by-syncStatus');
  return index.getAll('PENDING');
}

/**
 * Cập nhật một survey
 */
export async function updateSurvey(survey: Survey): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, survey);
}

/**
 * Đánh dấu survey đã đồng bộ thành công
 */
export async function markSurveyAsSynced(id: string): Promise<void> {
  const db = await getDB();
  const survey = await db.get(STORE_NAME, id);
  if (survey) {
    survey.syncStatus = 'SYNCED';
    survey.syncedAt = new Date().toISOString();
    delete survey.syncError;
    await db.put(STORE_NAME, survey);
  }
}

/**
 * Đánh dấu survey đồng bộ thất bại
 */
export async function markSurveyAsFailed(id: string, errorMessage: string): Promise<void> {
  const db = await getDB();
  const survey = await db.get(STORE_NAME, id);
  if (survey) {
    survey.syncStatus = 'FAILED';
    survey.syncError = errorMessage;
    await db.put(STORE_NAME, survey);
  }
}

/**
 * Xóa một survey theo id
 */
export async function deleteSurvey(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

/**
 * Xóa toàn bộ dữ liệu (phục vụ reset/test)
 */
export async function clearAllSurveys(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_NAME);
}
