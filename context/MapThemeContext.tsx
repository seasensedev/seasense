import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MapTheme, mapThemes } from '../constants/mapStyles';

type MapThemeContextType = {
  currentTheme: MapTheme;
  setMapTheme: (theme: MapTheme) => Promise<void>;
};

const MapThemeContext = createContext<MapThemeContextType | undefined>(undefined);

export function MapThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<MapTheme>('default');

  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('mapTheme');
      if (savedTheme && Object.keys(mapThemes).includes(savedTheme)) {
        setCurrentTheme(savedTheme as MapTheme);
      }
    } catch (error) {
      console.error('Error loading map theme:', error);
    }
  };

  const setMapTheme = async (theme: MapTheme) => {
    try {
      await AsyncStorage.setItem('mapTheme', theme);
      setCurrentTheme(theme);
    } catch (error) {
      console.error('Error saving map theme:', error);
    }
  };

  return (
    <MapThemeContext.Provider value={{ currentTheme, setMapTheme }}>
      {children}
    </MapThemeContext.Provider>
  );
}

export function useMapTheme() {
  const context = useContext(MapThemeContext);
  if (!context) {
    throw new Error('useMapTheme must be used within a MapThemeProvider');
  }
  return context;
}
