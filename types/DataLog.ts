export interface DataLog {
  userId: string;
  action: 'create' | 'archive' | 'delete' | 'restore' | 'update';
  timestamp: number;
  trackId: string;
  originalData?: any;
  details?: {
    location?: {
      city?: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      }
    };
    temperature?: number;
    elapsedTime?: number;
    pinnedLocations?: number;
  };
}
