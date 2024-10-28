// FishingSpotList.tsx
import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import { useRouter } from "expo-router";

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

  return (
    <View>
      {fishingSpots.length > 0 ? (
        fishingSpots.map((spot, index) => (
          <TouchableOpacity
            key={index}
            className="my-1"
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
            {spot.screenshotURL && (
              <Image
                source={{ uri: spot.screenshotURL }}
                className="w-full h-32 mt-2 rounded-xl"
                resizeMode="cover"
              />
            )}
            <View className="absolute bg-white bottom-0 right-0 rounded-tl-xl px-3 py-1.5 flex-row justify-center space-x-3">
              <Text className="text-black text-md font-psemibold">
                {spot.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <TouchableOpacity
          className="flex flex-row items-center space-x-3 mt-2"
          onPress={handleAddButtonPress}
        >
          <View className="w-24 h-24 rounded-md bg-gray-200 flex justify-center items-center">
            <Image
              source={icons.fish}
              className="w-12 h-12"
              resizeMode="contain"
            />
          </View>
          <View className="flex-1 mb-4">
            <Text className="text-black text-lg font-psemibold">
              Start your logbook
            </Text>
            <Text className="text-gray-500 text-sm font-pregular leading-4">
              Track all your catches in one place! Find and relive your
              fishing memories whenever you'd like.
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default FishingSpotList;
