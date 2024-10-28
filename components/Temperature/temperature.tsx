import React from "react";
import { View, Text } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

interface TemperatureDisplayProps {
  temperature: number | null;
}

// Function to determine the background color based on temperature
const getTemperatureColor = (temperature: number | null) => {
  if (temperature === null) return "bg-gray-300"; // Default for null value
  if (temperature <= 15) return "bg-blue-400"; // Cold temperature (e.g., 15°C or below)
  if (temperature <= 30) return "bg-yellow-400"; // Warm temperature (e.g., between 15°C and 30°C)
  return "bg-red-400"; // Hot temperature (above 30°C)
};

const getTemperatureIcon = (temperature: number | null) => {
  if (temperature === null) return null; 
  if (temperature <= 15)
    return <FontAwesome6 name="temperature-low" size={30} color="white" />; // Cold icon
  if (temperature <= 30)
    return <FontAwesome6 name="temperature-quarter" size={24} color="white" />; // Warm icon
  return <FontAwesome6 name="temperature-high" size={24} color="white" />; // Hot icon
};

const getFishSpecies = (temperature: number | null) => {
  if (temperature === null) return []; 

  if (temperature <= 15) {
    return ["Salmon", "Trout", "Whitefish"]; 
  } else if (temperature <= 30) {
    return ["Bass", "Perch", "Catfish"]; 
  } else {
    return ["Tilapia", "Grouper", "Mahi-Mahi"]; 
  }
};

const Temperature: React.FC<TemperatureDisplayProps> = ({ temperature }) => {
  const iconComponent = getTemperatureIcon(temperature);
  const fishSpecies = getFishSpecies(temperature); 

  return (
    <View
      className={`absolute top-0 left-0 right-0 p-5 py-4 z-10 ${getTemperatureColor(
        temperature
      )}`}
    >
      <View className="flex flex-row justify-between">
        <View className="justify-start">
          <View className="flex flex-row items-center">
            <Text className="text-3xl">{iconComponent}</Text>
            <Text className="font-pbold text-white text-2xl ml-2">
              {temperature !== null ? `${temperature} °C` : "- °C"}
            </Text>
          </View>
          <Text className="font-regular text-white mt-2">
            {temperature !== null
              ? temperature <= 15
                ? "Cold"
                : temperature <= 30
                ? "Warm"
                : "Hot"
              : ""}
          </Text>
        </View>
        <View className="flex flex-col">
          <Text className="font-psemibold text-white text-sm mt-2">
            Fishes for this Temperature
          </Text>
          <Text className="text-white text-sm mt-2">
            {fishSpecies.length > 0 ? fishSpecies.join(", ") : "No species available"}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Temperature;
