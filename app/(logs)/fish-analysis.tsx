import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, SafeAreaView, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { useMapTheme } from '../../context/MapThemeContext';
import { mapThemes } from '../../constants/mapStyles';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../../config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from "react-native-chart-kit";

interface FishingData {
  location: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
    currentCity: string;
    details: {
      city: string;
      district: string;
      region: string;
      country: string;
      street: string;
    };
  };
  timestamp: {
    date: string;
    time: string;
  };
  weather: {
    temperature: number;
    windSpeed: number;
    windDirection: number;
  };
  elapsedTime: number;
  userId: string;
}

interface AreaStatistics {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  cityInfo: {
    city: string;
    district: string;
  };
  totalCatches: number;
  averageTemp: number;
  popularTimes: Record<string, number>;
  totalUsers: number;
}

export default function FishAnalysis() {
  const [loading, setLoading] = useState(true);
  const [fishingData, setFishingData] = useState<FishingData[]>([]);
  const [areaStats, setAreaStats] = useState<Record<string, AreaStatistics>>({});
  const { currentTheme } = useMapTheme();

  const calculateAreaStatistics = (data: FishingData[]) => {
    const stats: Record<string, AreaStatistics> = {};

    // Group data by city
    data.forEach(item => {
      if (!item.location?.details?.city || !item.location?.details?.district) return;
      
      const cityKey = `${item.location.details.city} - ${item.location.details.district}`;
      if (!stats[cityKey]) {
        stats[cityKey] = {
          coordinates: item.location.coordinates,
          cityInfo: {
            city: item.location.details.city,
            district: item.location.details.district
          },
          totalCatches: 0,
          averageTemp: 0,
          popularTimes: {},
          totalUsers: 0
        };
      }

      const timeKey = item.timestamp?.time?.split(':')[0] || '0';
      stats[cityKey].popularTimes[timeKey] = (stats[cityKey].popularTimes[timeKey] || 0) + 1;
      stats[cityKey].totalCatches++;

      // Only include temperature if it exists
      if (item.weather?.temperature) {
        const currentTotal = stats[cityKey].averageTemp * (stats[cityKey].totalCatches - 1);
        stats[cityKey].averageTemp = (currentTotal + item.weather.temperature) / stats[cityKey].totalCatches;
      }

      const uniqueUsers = new Set([...Array.from(new Set([item.userId]))]);
      stats[cityKey].totalUsers = uniqueUsers.size;
    });

    return stats;
  };

  const isWithinRadius = (
    point: { latitude: number; longitude: number },
    center: { latitude: number; longitude: number },
    radius: number
  ) => {
    const R = 6371e3; 
    const φ1 = point.latitude * Math.PI / 180;
    const φ2 = center.latitude * Math.PI / 180;
    const Δφ = (center.latitude - point.latitude) * Math.PI / 180;
    const Δλ = (center.longitude - point.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return distance <= radius;
  };

  useEffect(() => {
    const fetchFishingData = async () => {
      if (auth.currentUser?.isAnonymous) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'tracking_data'),
          orderBy('createdAt', 'desc'),
          limit(100) 
        );
        
        const querySnapshot = await getDocs(q);
        const data: FishingData[] = [];

        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          // Only include entries that have valid location data
          if (docData.location?.coordinates?.latitude && docData.location?.coordinates?.longitude) {
            // Ensure weather object exists even if empty
            const fishingData: FishingData = {
              ...docData,
              weather: docData.weather || {
                temperature: 0,
                windSpeed: 0,
                windDirection: 0
              }
            } as FishingData;
            data.push(fishingData);
          }
        });

        setFishingData(data);
        setAreaStats(calculateAreaStatistics(data));
      } catch (error) {
        console.error('Error fetching fishing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFishingData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#1e5aa0" />
      </SafeAreaView>
    );
  }

  if (auth.currentUser?.isAnonymous) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Ionicons name="fish-outline" size={48} color="#666" />
        <Text className="text-gray-600 mt-4 text-center px-4">
          Create an account to view fish catch analysis
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <View className="h-[300px]">
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: 7.0667, 
            longitude: 125.6167,
            latitudeDelta: 0.8,
            longitudeDelta: 0.8,
          }}
          customMapStyle={mapThemes[currentTheme]}
        >
          {Object.entries(areaStats).map(([cityKey, stats]) => (
            <React.Fragment key={cityKey}>
              <Marker
                coordinate={stats.coordinates}
                title={`${stats.cityInfo.city}`}
                description={`${stats.cityInfo.district} - ${stats.totalCatches} catches`}
              >
                <View className="bg-white p-2 rounded-full border-2 border-[#1e5aa0]">
                  <Ionicons name="fish" size={24} color="#1e5aa0" />
                </View>
              </Marker>
              <Circle
                center={stats.coordinates}
                radius={5000}
                fillColor="rgba(30, 90, 160, 0.1)"
                strokeColor="rgba(30, 90, 160, 0.3)"
              />
            </React.Fragment>
          ))}
        </MapView>
      </View>

      <ScrollView>
        <View className="px-4 pt-4">
          <View>
          <Text className="font-pbold text-xl text-[#1e5aa0]">Fishing Activity Analysis</Text>
          <Text className="font-pmedium text-gray-600 mb-4">Most caught fishes within respective area based by users activities</Text>
          </View>

          {/* Area Statistics */}
          <View className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <Text className="font-pbold text-[#1e5aa0] mb-4">Area Statistics</Text>
            {Object.entries(areaStats).map(([cityKey, stats]) => (
              <View key={cityKey} className="mb-4">
                <Text className="font-pbold text-lg">{stats.cityInfo.city}</Text>
                <Text className="font-pmedium text-gray-600 mb-2">{stats.cityInfo.district}</Text>
                <View className="ml-4">
                  <Text>Total Activities: {stats.totalCatches}</Text>
                  <Text>Unique Users: {stats.totalUsers}</Text>
                  <Text>Avg. Temperature: {stats.averageTemp.toFixed(1)}°C</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Activity Distribution Chart */}
          <View className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <Text className="font-pbold text-[#1e5aa0] mb-4">Activity Distribution</Text>
            <BarChart
              data={{
                labels: Object.keys(areaStats),
                datasets: [{
                  data: Object.values(areaStats).map(stats => stats.totalCatches)
                }]
              }}
              width={Dimensions.get("window").width - 48}
              height={220}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(30, 90, 160, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
                propsForLabels: { fontSize: 10 }
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
              verticalLabelRotation={45}
              yAxisLabel=""
              yAxisSuffix=" activities"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
