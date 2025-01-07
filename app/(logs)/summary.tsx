import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, SafeAreaView, ActivityIndicator, ScrollView, Dimensions, Alert } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useMapTheme } from '../../context/MapThemeContext';
import { mapThemes } from '../../constants/mapStyles';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db, auth } from '../../config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from "react-native-chart-kit";

interface TrackingData {
  id: string;
  routeCoordinates: Array<{ latitude: number; longitude: number }>;
  pinnedLocations?: Array<{
    latitude: number;
    longitude: number;
    timestamp: number;
    locationDetails?: {
      street: string | null;
      district: string | null;
      city: string | null;
    };
  }>;
  timestamp: {
    date: string;
    time: string;
  };
  temperature?: number;
  elapsedTime?: number;
}

export default function Summary() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingData[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentTheme } = useMapTheme();
  const [analytics, setAnalytics] = useState({
    averageTemp: 0,
    totalTime: 0,
    maxTemp: 0,
    minTemp: Infinity,
    totalPins: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        if (auth.currentUser?.isAnonymous) {
          Alert.alert(
            "Guest Account",
            "Create an account to view tracking summaries. Guest accounts cannot access summaries.",
            [{ text: "OK" }]
          );
          setLoading(false);
          return;
        }

        if (!auth.currentUser) {
          setErrorMsg('Please login to view summaries');
          setLoading(false);
          return;
        }

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        const q = query(
          collection(db, 'tracking_data'),
          where('userId', '==', auth.currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const tracks: TrackingData[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userId === auth.currentUser?.uid) {
            tracks.push({
              id: doc.id,
              routeCoordinates: data.routeCoordinates || [],
              pinnedLocations: data.pinnedLocations || [],
              timestamp: data.timestamp || { date: '', time: '' },
              temperature: data.temperature || 0,
              elapsedTime: data.elapsedTime || 0
            });
          }
        });

        if (tracks.length > 0) {
          const validTemps = tracks.filter(track => track.temperature && track.temperature > 0);
          const totalTemp = validTemps.reduce((sum, track) => sum + (track.temperature || 0), 0);
          const totalTime = tracks.reduce((sum, track) => sum + (track.elapsedTime || 0), 0);
          const maxTemp = Math.max(...validTemps.map(track => track.temperature || 0));
          const minTemp = Math.min(...validTemps.map(track => track.temperature || 0));
          const totalPins = tracks.reduce((sum, track) => sum + (track.pinnedLocations?.length || 0), 0);

          setAnalytics({
            averageTemp: validTemps.length > 0 ? totalTemp / validTemps.length : 0,
            totalTime,
            maxTemp,
            minTemp: minTemp === Infinity ? 0 : minTemp,
            totalPins,
          });
        }

        setTrackingData(tracks);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMsg('Error loading tracking data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (auth.currentUser?.isAnonymous) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Ionicons name="analytics-outline" size={48} color="#666" />
        <Text className="text-gray-600 mt-4 text-center px-4">
          Create an account to view tracking summaries
        </Text>
      </SafeAreaView>
    );
  }

  const getBoundsOfAll = (tracks: TrackingData[]) => {
    let minLat = 90;
    let maxLat = -90;
    let minLng = 180;
    let maxLng = -180;

    tracks.forEach(track => {
      track.routeCoordinates.forEach(coord => {
        minLat = Math.min(minLat, coord.latitude);
        maxLat = Math.max(maxLat, coord.latitude);
        minLng = Math.min(minLng, coord.longitude);
        maxLng = Math.max(maxLng, coord.longitude);
      });
    });

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(maxLat - minLat, 0.02) * 1.5,
      longitudeDelta: Math.max(maxLng - minLng, 0.02) * 1.5,
    };
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  if (errorMsg) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-red-500">{errorMsg}</Text>
      </SafeAreaView>
    );
  }

  if (loading || !location) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#1e5aa0" />
      </SafeAreaView>
    );
  }

  if (trackingData.length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Ionicons name="analytics-outline" size={48} color="#666" />
        <Text className="text-gray-600 mt-4 text-center px-4">
          No tracking data available yet. Start tracking to see your summaries.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      {/* Fixed Map Container */}
      <View className="h-[300px]">
        <MapView
          style={StyleSheet.absoluteFillObject}
          provider={PROVIDER_GOOGLE}
          initialRegion={
            trackingData.length > 0
              ? getBoundsOfAll(trackingData)
              : {
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }
          }
          customMapStyle={mapThemes[currentTheme]}
          showsUserLocation
          showsMyLocationButton
        >
          {trackingData.map((track, trackIndex) => (
            <React.Fragment key={track.id}>
              <Polyline
                coordinates={track.routeCoordinates}
                strokeColor={`hsl(${(trackIndex * 137) % 360}, 70%, 50%)`}
                strokeWidth={3}
              />
              
              {track.pinnedLocations?.map((pin, pinIndex) => (
                <Marker
                  key={`${track.id}-pin-${pin.timestamp}`}
                  coordinate={{
                    latitude: pin.latitude,
                    longitude: pin.longitude,
                  }}
                  title={`Pin ${pinIndex + 1}`}
                  description={`${track.timestamp.date} ${track.timestamp.time}`}
                >
                  <View className="bg-white p-1 rounded-full border-2 border-[#1e5aa0]">
                    <Ionicons name="location" size={20} color="#1e5aa0" />
                  </View>
                </Marker>
              ))}
            </React.Fragment>
          ))}
        </MapView>
      </View>

      {/* Scrollable Analytics Container */}
      <View className="flex-1">
        <ScrollView>
          <View className="px-4 pt-4">
            <Text className="font-pbold text-xl text-[#1e5aa0] mb-4">Analytics Overview</Text>
            
            {/* Summary Stats Cards */}
            <View className="bg-white rounded-lg p-4 shadow-sm flex-row justify-between flex-wrap mb-6">
              <View className="items-center w-1/2 mb-4">
                <Text className="font-pbold text-[#1e5aa0]">Total Tracks</Text>
                <Text className="font-pmedium text-2xl">{trackingData.length}</Text>
              </View>
              <View className="items-center w-1/2 mb-4">
                <Text className="font-pbold text-[#1e5aa0]">Total Pins</Text>
                <Text className="font-pmedium text-2xl">{analytics.totalPins}</Text>
              </View>
              <View className="items-center w-1/2">
                <Text className="font-pbold text-[#1e5aa0]">Avg Temp</Text>
                <Text className="font-pmedium text-2xl">{analytics.averageTemp.toFixed(1)}°C</Text>
              </View>
              <View className="items-center w-1/2">
                <Text className="font-pbold text-[#1e5aa0]">Total Time</Text>
                <Text className="font-pmedium text-2xl">{formatTime(analytics.totalTime)}</Text>
              </View>
            </View>

            {/* Temperature Line Chart */}
            <View className="bg-white rounded-lg p-4 shadow-sm mb-6">
              <Text className="font-pbold text-[#1e5aa0] mb-4">Temperature Trends</Text>
              {trackingData.length > 0 ? (
                <LineChart
                  data={{
                    labels: trackingData.map(track => track.timestamp.date.slice(-5)),
                    datasets: [{
                      data: trackingData.map(track => track.temperature || 0).length > 0 
                        ? trackingData.map(track => track.temperature || 0)
                        : [0] 
                    }]
                  }}
                  width={Dimensions.get("window").width - 48}
                  height={200}
                  chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(30, 90, 160, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    propsForDots: {
                      r: "4",
                      strokeWidth: "2",
                      stroke: "#1e5aa0"
                    },
                    propsForLabels: {
                      fontSize: 12
                    }
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16
                  }}
                />
              ) : (
                <Text className="text-gray-500 text-center">No temperature data available</Text>
              )}
            </View>

            {/* Time Spent Bar Chart */}
            <View className="bg-white rounded-lg p-4 shadow-sm mb-6">
              <Text className="font-pbold text-[#1e5aa0] mb-4">Time Spent Per Track</Text>
              {trackingData.length > 0 ? (
                <BarChart
                  data={{
                    labels: trackingData.map((_, index) => `T${index + 1}`),
                    datasets: [{
                      data: trackingData.map(track => (track.elapsedTime || 0) / 60).length > 0
                        ? trackingData.map(track => (track.elapsedTime || 0) / 60)
                        : [0] 
                    }]
                  }}
                  width={Dimensions.get("window").width - 48}
                  height={200}
                  chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(30, 90, 160, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    propsForLabels: {
                      fontSize: 12
                    }
                  }}
                  yAxisLabel=""
                  yAxisSuffix="m"
                  style={{
                    marginVertical: 8,
                    borderRadius: 16
                  }}
                  verticalLabelRotation={0}
                />
              ) : (
                <Text className="text-gray-500 text-center">No time data available</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}