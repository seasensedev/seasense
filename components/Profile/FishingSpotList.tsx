import React from "react";
import { TouchableOpacity, View, Text, Image, ScrollView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

interface FishingSpotProps {
  fishingSpots: Array<{
    id: string;
    latitude: number;
    longitude: number;
    description: string;
    screenshotURL: string;
    fishName: string;
    fishWeight: number;
    fishLength: number;
    dayCaught: string;
    timeCaught: string;
  }>;
  handleAddButtonPress: () => void;
  icons: {
    fish: any;
  };
}

const FishingSpotList: React.FC<FishingSpotProps> = ({
  fishingSpots,
  handleAddButtonPress,
  icons,
}) => {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;

  const sortedSpots = [...fishingSpots].sort((a, b) => {
    const dateA = new Date(`${a.dayCaught} ${a.timeCaught}`);
    const dateB = new Date(`${b.dayCaught} ${b.timeCaught}`);
    return dateB.getTime() - dateA.getTime();
  });

  const renderSpotCard = (spot: FishingSpotProps['fishingSpots'][0], index: number) => {
    const formatTime = (timeString: string) => {
      try {
        // Ensure the timeString is in HH:mm format
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        
        return date.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      } catch (error) {
        return 'Invalid time';
      }
    };

    return (
      <TouchableOpacity
        key={spot.id}
        className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden"
        onPress={() =>
          router.push({
            pathname: "/edit-catches",
            params: {
              id: spot.id,
              latitude: spot.latitude,
              longitude: spot.longitude,
              description: spot.description,
              screenshotURL: spot.screenshotURL,
              fishName: spot.fishName,
              fishWeight: spot.fishWeight,
              fishLength: spot.fishLength,
              dayCaught: spot.dayCaught,
              timeCaught: spot.timeCaught,
            },
          })
        }
      >
        {/* Image Container */}
        <View className="relative">
          {spot.screenshotURL ? (
            <Image
              source={{ uri: spot.screenshotURL }}
              className="w-full h-48"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-48 bg-gray-100 items-center justify-center">
              <Ionicons name="fish-outline" size={48} color="#cbd5e1" />
            </View>
          )}
          {/* Location Badge */}
          <View className="absolute bottom-3 left-3 right-3 bg-black/30 backdrop-blur-md rounded-lg px-3 py-2">
            <Text className="text-white font-pbold">{spot.description}</Text>
          </View>
        </View>

        {/* Details Section */}
        <View className="p-4">
          {/* Fish Details */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name="fish" size={20} color="#1e5aa0" />
              <Text className="ml-2 text-gray-800 font-pbold">{spot.fishName || 'Unknown Species'}</Text>
            </View>
            <Text className="text-gray-500 font-pmedium text-sm">
              {new Date(spot.dayCaught).toLocaleDateString()}
            </Text>
          </View>

          {/* Measurements */}
          <View className="flex-row justify-between mt-2">
            <View className="flex-row items-center">
              <View className="bg-blue-50 rounded-full p-2 mr-2">
                <Ionicons name="scale" size={16} color="#1e5aa0" />
              </View>
              <View>
                <Text className="text-gray-500 text-xs font-pregular">Weight</Text>
                <Text className="text-gray-800 font-pmedium">{spot.fishWeight} lb</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="bg-blue-50 rounded-full p-2 mr-2">
                <Ionicons name="resize" size={16} color="#1e5aa0" />
              </View>
              <View>
                <Text className="text-gray-500 text-xs font-pregular">Length</Text>
                <Text className="text-gray-800 font-pmedium">{spot.fishLength} in</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="bg-blue-50 rounded-full p-2 mr-2">
                <Ionicons name="time" size={16} color="#1e5aa0" />
              </View>
              <View>
                <Text className="text-gray-500 text-xs font-pregular">Time</Text>
                <Text className="text-gray-800 font-pmedium">
                  {formatTime(spot.timeCaught)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (sortedSpots.length === 0) {
    return (
      <TouchableOpacity
        className="bg-white rounded-2xl shadow-sm p-8 mx-4 mt-4"
        onPress={handleAddButtonPress}
      >
        <View className="items-center">
          <View className="bg-blue-50 p-6 rounded-full mb-6">
            <Image
              source={icons.fish}
              className="w-20 h-20"
              resizeMode="contain"
            />
          </View>
          <Text className="text-2xl font-pbold text-gray-800 mb-3 text-center">
            Start Your Fishing Log
          </Text>
          <Text className="text-gray-500 text-center font-pregular text-base leading-6 mb-6">
            Track all your catches in one place! Find and relive your fishing memories whenever you'd like.
          </Text>
          <View className="bg-[#1e5aa0] px-6 py-3 rounded-full">
            <Text className="text-white font-pbold">Add First Catch</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View className="p-4">
      {/* Header */}
      <View className="mb-4">
        <Text className="text-2xl font-pbold text-gray-800">
          Your Catches
        </Text>
        <Text className="text-gray-500 font-pregular">
          {sortedSpots.length} {sortedSpots.length === 1 ? 'catch' : 'catches'} logged
        </Text>
      </View>

      {/* Spots List */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {sortedSpots.map((spot, index) => renderSpotCard(spot, index))}
      </ScrollView>
    </View>
  );
};

export default FishingSpotList;
