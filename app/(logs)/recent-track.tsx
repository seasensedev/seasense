// recent-track.tsx
import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, ScrollView } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { useMapTheme } from '../../context/MapThemeContext';
import { mapThemes } from '../../constants/mapStyles';

const RecentTrack = () => {
  const params = useLocalSearchParams();

  interface TrackData {
    elapsedTime: number;
    location: {
      coordinates: {
        latitude: number;
        longitude: number;
      };
      currentCity: string;
      details: {
        street: string;
        district: string;
        city: string;
        region: string;
        country: string;
      };
    };
    routeCoordinates: Array<{
      latitude: number;
      longitude: number;
    }>;
    speed: number;
    temperature: number;
    timestamp: {
      date: string;
      time: string;
      timestamp: number;
    };
  }

  const [trackData, setTrackData] = useState<TrackData | null>(null);
  const { currentTheme } = useMapTheme();

  useEffect(() => {
    const fetchTrackDetails = async () => {
      if (params.trackId) {
        const trackDoc = await getDoc(doc(db, "tracking_data", params.trackId as string));
        if (trackDoc.exists()) {
          setTrackData(trackDoc.data() as TrackData);
        }
      }
    };
    fetchTrackDetails();
  }, [params.trackId]);

  if (!trackData) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-lg">Loading track data...</Text>
      </SafeAreaView>
    );
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate the center point and bounds of the route
  const getCenterAndDeltas = (coordinates: Array<{latitude: number; longitude: number}>) => {
    if (!coordinates || coordinates.length === 0) {
      return {
        latitude: trackData?.location.coordinates.latitude || 0,
        longitude: trackData?.location.coordinates.longitude || 0,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    let minLat = coordinates[0].latitude;
    let maxLat = coordinates[0].latitude;
    let minLng = coordinates[0].longitude;
    let maxLng = coordinates[0].longitude;

    coordinates.forEach(coord => {
      minLat = Math.min(minLat, coord.latitude);
      maxLat = Math.max(maxLat, coord.latitude);
      minLng = Math.min(minLng, coord.longitude);
      maxLng = Math.max(maxLng, coord.longitude);
    });

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latDelta = (maxLat - minLat) * 1.5; 
    const lngDelta = (maxLng - minLat) * 1.5; 

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1">
        <View className="w-full h-[300px]"> 
          <MapView
            className="w-full h-full"
            initialRegion={getCenterAndDeltas(trackData.routeCoordinates)}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            customMapStyle={mapThemes[currentTheme]} 
          >
            <Marker
              coordinate={{
                latitude: trackData.location.coordinates.latitude,
                longitude: trackData.location.coordinates.longitude,
              }}
            >
              <View>
                <Text>{trackData.location.details.street}</Text>
              </View>
            </Marker>
            <Polyline
              coordinates={trackData.routeCoordinates}
              strokeColor="#1e5aa0"
              strokeWidth={3}
            />
          </MapView>
        </View>

        <View className="p-4">
          <Text className="text-xl font-bold mb-4">Track Details</Text>
          
          <Text className="text-gray-600">
            Date: {trackData.timestamp.date} {trackData.timestamp.time}
          </Text>
          
          <Text className="text-gray-600">
            Duration: {formatTime(trackData.elapsedTime)}
          </Text>
          
          <Text className="text-gray-600">
            Speed: {trackData.speed} km/h
          </Text>

          <Text className="text-gray-600">
            Temperature: {trackData.temperature}°C
          </Text>

          <View className="mt-4">
            <Text className="font-bold mb-2">Location Details:</Text>
            <Text className="text-gray-600">Street: {trackData.location.details.street}</Text>
            <Text className="text-gray-600">District: {trackData.location.details.district}</Text>
            <Text className="text-gray-600">City: {trackData.location.details.city}</Text>
            <Text className="text-gray-600">Region: {trackData.location.details.region}</Text>
            <Text className="text-gray-600">Country: {trackData.location.details.country}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RecentTrack;