import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, SafeAreaView, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import MapView, { Marker, Heatmap } from 'react-native-maps';
import { useMapTheme } from '../../context/MapThemeContext';
import { mapThemes } from '../../constants/mapStyles';
import { collection, query, getDocs } from 'firebase/firestore';
import { db, auth } from '../../config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from "react-native-chart-kit";

interface FishCatchData {
  location: {
    latitude: number;
    longitude: number;
  };
  area: string;
  species: string;
  quantity: number;
  timestamp: string;
}

// Predefined fishing areas in Davao Gulf
const fishingAreas = [
  { area: "Malita", coordinates: { latitude: 6.9167, longitude: 125.6000 } },
  { area: "Sta. Maria", coordinates: { latitude: 6.5667, longitude: 125.4833 } },
  { area: "Talomo", coordinates: { latitude: 7.0667, longitude: 125.6167 } },
  { area: "Tibungco", coordinates: { latitude: 7.2333, longitude: 125.6833 } },
  { area: "Bunawan", coordinates: { latitude: 7.2167, longitude: 125.6333 } },
];

export default function FishAnalysis() {
  const [loading, setLoading] = useState(true);
  const [fishCatchData, setFishCatchData] = useState<FishCatchData[]>([]);
  const { currentTheme } = useMapTheme();
  const [areaStats, setAreaStats] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchFishCatchData = async () => {
      if (auth.currentUser?.isAnonymous) {
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, 'fish_catch_data'));
        const querySnapshot = await getDocs(q);
        const catches: FishCatchData[] = [];
        const areaCount: Record<string, number> = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data() as FishCatchData;
          catches.push(data);
          areaCount[data.area] = (areaCount[data.area] || 0) + data.quantity;
        });

        setFishCatchData(catches);
        setAreaStats(areaCount);
      } catch (error) {
        console.error('Error fetching fish catch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFishCatchData();
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
      {/* Map Container */}
      <View className="h-[300px]">
        <MapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: 6.9167,
            longitude: 125.6000,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }}
          customMapStyle={mapThemes[currentTheme]}
        >
          {fishingAreas.map((area) => (
            <Marker
              key={area.area}
              coordinate={area.coordinates}
              title={area.area}
              description={`Catch count: ${areaStats[area.area] || 0}`}
            >
              <View className="bg-white p-2 rounded-full border-2 border-[#1e5aa0]">
                <Ionicons name="fish" size={24} color="#1e5aa0" />
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      {/* Scrollable Analytics Container */}
      <ScrollView>
        <View className="px-4 pt-4">
          <Text className="font-pbold text-xl text-[#1e5aa0] mb-4">Fish Catch Analysis</Text>

          {/* Area Statistics */}
          <View className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <Text className="font-pbold text-[#1e5aa0] mb-4">Catch by Area</Text>
            {fishingAreas.map((area) => (
              <View key={area.area} className="flex-row justify-between mb-2">
                <Text className="font-pmedium">{area.area}</Text>
                <Text className="font-pbold">{areaStats[area.area] || 0} catches</Text>
              </View>
            ))}
          </View>

          {/* Catch Distribution Chart */}
          <View className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <Text className="font-pbold text-[#1e5aa0] mb-4">Catch Distribution</Text>
            <BarChart
              data={{
                labels: fishingAreas.map(area => area.area),
                datasets: [{
                  data: fishingAreas.map(area => areaStats[area.area] || 0)
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
                style: {
                  borderRadius: 16
                },
                propsForLabels: {
                  fontSize: 10
                }
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
              verticalLabelRotation={45}
              yAxisLabel=""
              yAxisSuffix=" catches"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
