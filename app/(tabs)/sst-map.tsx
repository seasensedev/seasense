import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, UrlTile, Region, MapPressEvent, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useMapTheme } from '../../context/MapThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';

const TILE_CACHE_DIR = `${FileSystem.cacheDirectory}sst-tiles/`;
const METADATA_KEY = '@sst_map_metadata';

const Legend = () => {
  const temperatures = ['30.76°C', '30.24°C', '29.81°C', '29.77°C', '29.18°C'];
  const colors = ['#D20000', '#FF7C11', '#FFD200', '#0079C1', '#000A2A'];

  return (
    <View className="absolute bottom-5 right-5 bg-white/95 p-2 rounded-lg shadow-lg">
      <View className="flex-row items-center gap-2">
        <LinearGradient
          colors={colors}
          className="w-4 h-[100px] rounded-full"
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        <View className="h-[100px] justify-between">
          {temperatures.map((temp, index) => (
            <Text key={index} className="text-xs text-gray-700">
              {temp}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const LocationHeader = ({ location }: { location: Location.LocationObject | null }) => {
  if (!location) return null;
  
  return (
    <View className="absolute top-5 left-5 right-5 bg-white/90 p-4 rounded-lg shadow-lg">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-bold text-gray-800">Davao Gulf</Text>
          <Text className="text-sm text-gray-600">
            {location.coords.latitude.toFixed(4)}°N, {location.coords.longitude.toFixed(4)}°E
          </Text>
        </View>
        <View>
          <Text className="font-bold text-right text-sm text-gray-700">
            {new Date().toLocaleString('en-US', {
              timeZone: 'Asia/Singapore',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            })}
          </Text>
          <Text className="text-right text-xs text-gray-500">
            {new Date().toLocaleString('en-US', {
              timeZone: 'Asia/Singapore',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
        </View>
      </View>
    </View>
  );
};

const SSTMap = () => {
  const [region, setRegion] = useState<Region>({
    latitude: 6.88,
    longitude: 125.64,
    latitudeDelta: 1.21,
    longitudeDelta: 0.90,
  });

  const { currentTheme } = useMapTheme();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [hasOfflineData, setHasOfflineData] = useState(false);

  useEffect(() => {
    checkConnectivity();
    checkOfflineData();
  }, []);

  const checkConnectivity = async () => {
    const netInfo = await NetInfo.fetch();
    setIsOffline(!netInfo.isConnected);
  };

  const checkOfflineData = async () => {
    try {
      const metadata = await AsyncStorage.getItem(METADATA_KEY);
      setHasOfflineData(!!metadata);
    } catch (error) {
      console.error('Error checking offline data:', error);
    }
  };

  const downloadTilesForOffline = async () => {
    if (isDownloading) return;

    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      const dirInfo = await FileSystem.getInfoAsync(TILE_CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(TILE_CACHE_DIR, { intermediates: true });
      }

      const tileUrl = "https://api.maptiler.com/tiles/98696f60-3d2e-4e77-95d9-08fbf744f6ba/{z}/{x}/{y}.png?key=UjAyKS1rfChm8PtV7iAx";
      const localTilePath = `${TILE_CACHE_DIR}sst_map.png`;

      const downloadResumable = FileSystem.createDownloadResumable(
        tileUrl,
        localTilePath,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (!result) throw new Error('Download failed');
      const { uri } = result;

      const metadata = {
        timestamp: new Date().toISOString(),
        uri: uri,
        region: region,
      };
      await AsyncStorage.setItem(METADATA_KEY, JSON.stringify(metadata));

      setHasOfflineData(true);
      Alert.alert('Success', 'Map downloaded for offline use');
    } catch (error) {
      console.error('Error downloading tiles:', error);
      Alert.alert('Error', 'Failed to download map for offline use');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const clearOfflineData = async () => {
    try {
      await FileSystem.deleteAsync(TILE_CACHE_DIR);
      await AsyncStorage.removeItem(METADATA_KEY);
      setHasOfflineData(false);
      Alert.alert('Success', 'Offline map data cleared');
    } catch (error) {
      console.error('Error clearing offline data:', error);
      Alert.alert('Error', 'Failed to clear offline map data');
    }
  };

  const renderTileSource = () => {
    if (isOffline && hasOfflineData) {
      return (
        <UrlTile
          urlTemplate={`file://${TILE_CACHE_DIR}sst_map.png`}
          maximumZ={12}
          minimumZ={1}
          flipY={false}
        />
      );
    }

    return (
      <UrlTile
        urlTemplate="https://api.maptiler.com/tiles/98696f60-3d2e-4e77-95d9-08fbf744f6ba/{z}/{x}/{y}.png?key=UjAyKS1rfChm8PtV7iAx"
        maximumZ={12}
        minimumZ={1}
        flipY={false}
      />
    );
  };

  const handlePress = (event: MapPressEvent) => {
  }

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation);
        }
      );

      return () => {
        subscription.remove();
      };
    })();
  }, []);


  const tilesUrl = 'http://localhost:8080/';

  const DownloadButton = () => (
    <TouchableOpacity
      className="absolute bottom-5 left-5 bg-white rounded-full p-3 shadow-lg"
      onPress={hasOfflineData ? clearOfflineData : downloadTilesForOffline}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <View className="flex-row items-center">
          <ActivityIndicator size="small" color="#1e5aa0" />
          <Text className="ml-2 text-xs">{Math.round(downloadProgress * 100)}%</Text>
        </View>
      ) : (
        <Ionicons
          name={hasOfflineData ? "cloud-done" : "cloud-download"}
          size={24}
          color="#1e5aa0"
        />
      )}
    </TouchableOpacity>
  );

  const OfflineIndicator = () => (
    isOffline && (
      <View className="absolute top-5 left-5 bg-yellow-500 rounded-full px-3 py-1">
        <Text className="text-white text-xs font-bold">Offline Mode</Text>
      </View>
    )
  );

  return (
    <View className="flex-1">
      <MapView
        provider={PROVIDER_GOOGLE}
        mapType='hybrid'
        className="flex-1"
        initialRegion={region}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        onPress={handlePress}
      >
        {renderTileSource()}
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Current Location"
            pinColor="blue"
          />
        )}
      </MapView>
      <LocationHeader location={location} />
      <Legend />
      <DownloadButton />
      <OfflineIndicator />
    </View>
  );
};

export default SSTMap;

/**
 * 
 *         {sst_data.map((entry, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: entry.latitude,
              longitude: entry.longitude,
            }}
            title={`SST: ${entry.sst} K`}
            description={`Time: ${new Date(entry.time).toLocaleString()}`}
          />
        ))}
 */
