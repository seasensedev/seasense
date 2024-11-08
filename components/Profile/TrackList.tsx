// TrackList.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import icons from "../../constants/icons";

interface Track {
  id: string;
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

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tracking_data"), (snapshot) => {
      const data: Track[] = [];
      snapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          latitude: doc.data().latitude,
          longitude: doc.data().longitude,
          possibleFishes: doc.data().possibleFishes,
          timestamp: doc.data().timestamp,
          location: doc.data().location
        });
      });
      setTrackingData(data);
      setLoading(false);
    });

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
        // Convert timestamp object to string for routing
        timestamp: track.timestamp ? JSON.stringify(track.timestamp) : undefined
      }
    });
  };

  return (
    <View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : trackingData.length === 0 ? (
        <TouchableOpacity
          className="flex flex-row items-center space-x-3 mt-2"
          onPress={() => {
            router.push("/tracker");
          }}
        >
          <View className="w-24 h-24 rounded-md bg-gray-200 flex justify-center items-center">
            <Image
              source={icons.route}
              className="w-12 h-12"
              resizeMode="contain"
            />
          </View>
          <View className="flex-1 mb-4">
            <Text className="text-black text-lg font-psemibold">
              Start Tracking Now!
            </Text>
            <Text className="text-gray-500 text-sm font-pregular leading-4">
              Start tracking your fishing trips and keep a log of your catches.
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        trackingData.map((track) => (
          <TouchableOpacity
            key={track.id}
            onPress={() => handleTrackPress(track)}
            className="p-2 border border-gray-200 rounded-md mt-4"
          >
            {track.timestamp && (
              <Text className="text-gray-500 mb-2">
                Date: {track.timestamp.date} {track.timestamp.time}
              </Text>
            )}
            {track.location?.details && (
              <View>
                {track.location.details.street && (
                  <Text className="text-gray-500">Street: {track.location.details.street}</Text>
                )}
                {track.location.details.district && (
                  <Text className="text-gray-500">District: {track.location.details.district}</Text>
                )}
                {track.location.details.city && (
                  <Text className="text-gray-500">City: {track.location.details.city}</Text>
                )}
                {track.location.details.region && (
                  <Text className="text-gray-500">Region: {track.location.details.region}</Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

export default TrackList;