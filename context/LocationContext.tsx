import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';

interface LocationContextType {
  locationEnabled: boolean;
  error: string | null;
  checkLocationServices: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkLocationServices = async () => {
    try {
      const locationEnabled = await Location.hasServicesEnabledAsync();
      if (!locationEnabled) {
        setError('Location services disabled');
        setLocationEnabled(false);
        Alert.alert(
          "Location Services Disabled",
          "Please enable location services in your device settings to use this app.",
          [
            { text: "Cancel" },
            { 
              text: "Open Settings", 
              onPress: () => Platform.OS === 'ios' ? 
                Linking.openURL('app-settings:') : 
                Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS')
                  .catch(() => Linking.openSettings()) 
            }
          ]
        );
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission not granted');
        setLocationEnabled(false);
        Alert.alert(
          "Permission Required",
          "Location permission is required to use this app.",
          [
            { text: "Cancel" },
            { 
              text: "Open Settings", 
              onPress: () => Linking.openSettings() 
            }
          ]
        );
        return;
      }

      await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low
      }).catch((err) => {
        throw new Error('Failed to get current position: ' + err.message);
      });

      setLocationEnabled(true);
      setError(null);

    } catch (err: any) {
      setLocationEnabled(false);
      const errorMessage = err.message || 'Unknown location error';
      setError(errorMessage);
      
      if (errorMessage.includes('LocationServices.API is not available')) {
        Alert.alert(
          "Location Services Error",
          "Google Play Services is not available or needs to be updated.",
          [
            { text: "Cancel" },
            { 
              text: "Open Play Store",
              onPress: () => Linking.openURL('market://details?id=com.google.android.gms')
                .catch(() => Linking.openURL('https://play.google.com/store/apps/details?id=com.google.android.gms'))
            }
          ]
        );
        return;
      }

      Alert.alert(
        "Location Error",
        "There was a problem accessing your location. Please try again.",
        [{ text: "Retry", onPress: () => checkLocationServices() }]
      );
    }
  };

  useEffect(() => {
    let isMounted = true;
    let locationSubscription: Location.LocationSubscription | null = null;
    
    const setupLocationMonitoring = async () => {
      try {
        await checkLocationServices();
        
        if (isMounted) {
          locationSubscription = await Location.watchPositionAsync(
            { 
              accuracy: Location.Accuracy.Low, 
              timeInterval: 10000 
            },
            (location) => {
              console.log('Location updated:', location);
            }
          );
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to initialize location services');
          setLocationEnabled(false);
          console.warn('Location initialization error:', err);
        }
      }
    };

    setupLocationMonitoring().catch(err => {
      if (isMounted) {
        console.warn('Location setup error:', err);
      }
    });

    return () => {
      isMounted = false;
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  return (
    <LocationContext.Provider value={{ locationEnabled, error, checkLocationServices }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
