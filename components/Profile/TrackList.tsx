// TrackList.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { collection, onSnapshot, where, query } from "firebase/firestore";
import { db, auth } from "../../config/firebaseConfig";
import icons from "../../constants/icons";
import { signOut } from "firebase/auth";
import { Animated } from "react-native";
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

interface Track {
  id: string;
  userId?: string;
  latitude?: number;
  longitude?: number;
  possibleFishes?: string[];
  timestamp?: {
    date: string;
    time: string;
    timestamp: number;
  };
  location?: {
    details: {
      street: string | null;
      district: string | null;
      city: string | null;
      region: string | null;
    };
  };
}

interface TrackListProps {
  tracks: Track[];
}

const TrackList: React.FC<TrackListProps> = ({ tracks }) => {
  const [trackingData, setTrackingData] = useState<Track[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  useEffect(() => {
    if (auth.currentUser?.isAnonymous) {
      Alert.alert(
        "Guest Account",
        "Create an account to save your tracking data permanently. Your guest data will be lost after logging out.",
        [
          {
            text: "Maybe Later",
            style: "cancel"
          },
          {
            text: "Sign Out",
            onPress: handleSignOut 
          }
        ]
      );
      return;
    }

    if (!auth.currentUser) return; 

    const q = query(
      collection(db, "tracking_data"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data: Track[] = [];
        snapshot.forEach((doc) => {
          data.push({
            id: doc.id,
            userId: doc.data().userId, 
            latitude: doc.data().latitude,
            longitude: doc.data().longitude,
            possibleFishes: doc.data().possibleFishes,
            timestamp: doc.data().timestamp,
            location: doc.data().location
          });
        });

        const sortedData = data.sort((a, b) => {
          const timeA = a.timestamp?.timestamp || 0;
          const timeB = b.timestamp?.timestamp || 0;
          return timeB - timeA;
        });

        setTrackingData(sortedData);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleTrackPress = (track: Track) => {
    router.push({
      pathname: "/recent-track",
      params: {
        trackId: track.id,
        latitude: track.latitude,
        longitude: track.longitude,
        possibleFishes: track.possibleFishes,
        timestamp: track.timestamp ? JSON.stringify(track.timestamp) : undefined
      }
    });
  };

  const renderTrackCard = (track: Track) => (
    <TouchableOpacity
      key={track.id}
      onPress={() => handleTrackPress(track)}
      className="bg-white rounded-2xl shadow-md mb-4 overflow-hidden"
    >
      {/* Header Section */}
      <View className="border-l-4 border-[#1e5aa0] p-4">
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="map-marker-path" size={24} color="#1e5aa0" />
            <Text className="ml-2 text-lg font-pbold text-gray-800">
              {track.location?.details?.city ? `${track.location.details.city} Track` : 'Unknown Track'}
            </Text>
          </View>
          {track.timestamp && (
            <View className="bg-gray-100 px-3 py-1 rounded-full">
              <Text className="text-sm font-pmedium text-gray-600">
                {track.timestamp.date}
              </Text>
            </View>
          )}
        </View>

        {/* Location Details */}
        {track.location?.details && (
          <View className="mt-2">
            <View className="flex-row flex-wrap items-center">
              <View className="flex-row items-center mr-4 mb-2">
                <Ionicons name="location" size={16} color="#666" />
                <Text className="ml-1 text-gray-600 font-pmedium">
                  {track.location.details.city || 'Unknown City'}
                </Text>
              </View>
              
              {track.location.details.district && (
                <View className="flex-row items-center mr-4 mb-2">
                  <Ionicons name="business" size={16} color="#666" />
                  <Text className="ml-1 text-gray-600 font-pmedium">
                    {track.location.details.district}
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-row items-center mt-1">
              <Ionicons name="navigate" size={16} color="#666" />
              <Text className="ml-1 text-gray-500 font-pregular text-sm">
                {track.location.details.street}
                {track.location.details.region && `, ${track.location.details.region}`}
              </Text>
            </View>
          </View>
        )}

        {/* Time Section */}
        {track.timestamp && (
          <View className="mt-3 pt-3 border-t border-gray-100 flex-row items-center">
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text className="ml-1 text-gray-500 font-pmedium">
              {track.timestamp.time}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <ActivityIndicator size="large" color="#1e5aa0" />
      </View>
    );
  }

  if (trackingData.length === 0) {
    return (
      <TouchableOpacity
        className="bg-white rounded-2xl shadow-md p-6 mt-4 mx-4"
        onPress={() => router.push("/tracker")}
      >
        <View className="items-center">
          <View className="bg-blue-50 p-4 rounded-full mb-4">
            <Image
              source={icons.route}
              className="w-16 h-16"
              resizeMode="contain"
            />
          </View>
          <Text className="text-xl font-pbold text-gray-800 mb-2 text-center">
            Start Your First Track
          </Text>
          <Text className="text-gray-500 text-center font-pregular">
            Begin tracking your fishing adventures and build your journey log.
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View className="p-4">
      {/* Header */}
      <View className="mb-4">
        <Text className="text-2xl font-pbold text-gray-800">
          Your Tracks
        </Text>
        <Text className="text-gray-500 font-pregular">
          {trackingData.length} {trackingData.length === 1 ? 'track' : 'tracks'} recorded
        </Text>
      </View>

      {/* Track List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {trackingData.map(renderTrackCard)}
      </ScrollView>
    </View>
  );
};

export default TrackList;