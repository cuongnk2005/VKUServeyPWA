export type SyncStatus = 'PENDING' | 'SYNCED' | 'FAILED';

export type FacilityType =
  | 'Light'
  | 'Fan'
  | 'Air Conditioner'
  | 'Table'
  | 'Chair'
  | 'Computer'
  | 'Projector'
  | 'Network'
  | 'Other';

export type Condition = 'Good' | 'Minor Issue' | 'Broken' | 'Needs Replacement';

export interface Survey {
  id: string; // UUID sinh tại client
  building: string;
  room: string;
  facilityType: FacilityType;
  condition: Condition;
  description: string;
  inspectorName: string;
  createdAt: string; // ISO string
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  syncStatus: SyncStatus;
  syncedAt?: string;
  syncError?: string;
}

export interface SurveyStats {
  total: number;
  pending: number;
  synced: number;
  failed: number;
}
