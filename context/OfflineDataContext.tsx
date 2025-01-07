import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveData, loadData, StorageKeys } from '../utils/storage';
import NetInfo from '@react-native-community/netinfo';

type OfflineDataContextType = {
  cachedData: any;
  updateCache: (data: any) => void;
  isOffline: boolean;
};

const OfflineDataContext = createContext<OfflineDataContextType | undefined>(undefined);

export const OfflineDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [cachedData, setCachedData] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Load cached data on startup
    loadData(StorageKeys.LAST_KNOWN_DATA).then(data => {
      if (data) setCachedData(data);
    });

    // Monitor network status
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const updateCache = async (data: any) => {
    setCachedData(data);
    await saveData(StorageKeys.LAST_KNOWN_DATA, data);
  };

  return (
    <OfflineDataContext.Provider value={{ cachedData, updateCache, isOffline }}>
      {children}
    </OfflineDataContext.Provider>
  );
};

export const useOfflineData = () => {
  const context = useContext(OfflineDataContext);
  if (!context) {
    throw new Error('useOfflineData must be used within an OfflineDataProvider');
  }
  return context;
};
