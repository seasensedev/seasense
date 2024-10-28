import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import icons from "../../constants/icons";
import { useRouter } from "expo-router";

interface Track {
  trackName: string;
  description: string;
  distance: number;
  duration: number;
}

interface TrackListProps {
  tracks: Track[];
}

const TrackList: React.FC<TrackListProps> = ({ tracks }) => {
  const router = useRouter();
  
  const renderTrackItem = ({ item }: { item: Track }) => (
    <View className="p-2 border-b border-gray-200">
      <Text className="font-semibold">{item.trackName}</Text>
      <Text>{item.description}</Text>
      <Text>Distance: {item.distance} km</Text>
      <Text>Duration: {item.duration} mins</Text>
    </View>
  );

  return (
    <View>
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
    </View>
  );
};

export default TrackList;
