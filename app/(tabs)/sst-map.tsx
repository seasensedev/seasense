import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import MapView, { Marker, UrlTile, Region, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { useMapTheme } from '../../context/MapThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

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
  type SSTData = {
    latitude: number;
    longitude: number;
    sst: number;
    time: string;
  };

  const [sst_data, setSSTData] = useState<SSTData[]>([]);
  const [region, setRegion] = useState<Region>({
    latitude: 6.88,
    longitude: 125.64,
    latitudeDelta: 1.21,
    longitudeDelta: 0.90,
  });

  const { currentTheme } = useMapTheme();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const fetchData = async () => {
    try{
      const response = await fetch('https://firebasestorage.googleapis.com/v0/b/geomapper-d2b26.appspot.com/o/sea_surface_temperature%2Fdavao_sea_surface_temperature_sep_10_2024.geojson?alt=media&token=7e82526a-5ea0-448e-ba1d-5cc99084f813');
      const geoJSONData = await response.json();

      const sstDataArray: SSTData[] = geoJSONData.features.map((feature: any) => ({
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        sst: feature.properties.SST_data,
      }));

      setSSTData(sstDataArray);
    }catch(e){
      console.error('Error fetching GeoJSON data: ', e)
    }
  }

  const handlePress = (event: MapPressEvent) =>{
    const {coordinate} = event.nativeEvent;
    
    const foundData = sst_data.find(point => {
      const distance = Math.sqrt(
        Math.pow(point.latitude - coordinate.latitude, 2)+
        Math.pow(point.longitude - coordinate.longitude, 2)
      );
      return distance < 0.01
    });

    if(foundData){
      Alert.alert(
        'SST Data',
        `SST: ${foundData.sst} °C\nLocation: Lat: ${foundData.latitude}, Lon: ${foundData.longitude}`,
        [{ text: 'OK' }]
      );
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

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

  return (
    <View className="flex-1">
      <MapView
        mapType='hybrid'
        className="flex-1"
        initialRegion={region}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        onPress={handlePress}
      >
        <UrlTile
          urlTemplate="https://api.maptiler.com/tiles/98696f60-3d2e-4e77-95d9-08fbf744f6ba/{z}/{x}/{y}.png?key=UjAyKS1rfChm8PtV7iAx" 
          maximumZ={12} 
          minimumZ={1}
          flipY={false}
        />
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
