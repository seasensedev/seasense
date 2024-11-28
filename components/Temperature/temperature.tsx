import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Modal, Animated, ScrollView } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Ionicons } from '@expo/vector-icons';

interface TemperatureDisplayProps {
  temperature: number | null;
}

const getTemperatureColor = (temperature: number | null) => {
  if (temperature === null) return "bg-gray-300"; 
  if (temperature <= 15) return "bg-blue-400"; 
  if (temperature <= 30) return "bg-yellow-400";
  return "bg-red-400"; 
};

const getTemperatureIcon = (temperature: number | null) => {
  if (temperature === null) return null; 
  if (temperature <= 15)
    return <FontAwesome6 name="temperature-low" size={30} color="white" />; 
  if (temperature <= 30)
    return <FontAwesome6 name="temperature-quarter" size={24} color="white" />; 
  return <FontAwesome6 name="temperature-high" size={24} color="white" />;
};

const getFishSpecies = (temperature: number | null) => {
  if (temperature === null) return []; 

  if (temperature <= 15) {
    return [
      "Salmon",
      "Trout",
      "Arctic Char",
      "Lake Whitefish",
      "Northern Pike",
      "Burbot",
      "Brook Trout",
      "Lake Trout",
      "Grayling",
      "Smelt"
    ];
  } else if (temperature <= 30) {
    return [
      "Bass",
      "Perch",
      "Catfish",
      "Walleye",
      "Bluegill",
      "Crappie",
      "Striped Bass",
      "Pike",
      "Carp",
      "Musky"
    ];
  } else {
    return [
      "Tilapia",
      "Grouper",
      "Mahi-Mahi",
      "Snapper",
      "Barramundi",
      "Peacock Bass",
      "Tuna",
      "Snook",
      "Tarpon",
      "Jack Crevalle"
    ];
  }
};

const Temperature: React.FC<TemperatureDisplayProps> = ({ temperature }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const iconComponent = getTemperatureIcon(temperature);
  const fishSpecies = getFishSpecies(temperature);

  const openModal = () => {
    setIsModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsModalVisible(false));
  };

  const modalContent = () => (
    <Animated.View
      className="absolute bottom-0 left-0 right-0 bg-white p-5 rounded-t-2xl shadow-lg"
      style={{
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [600, 0],
            }),
          },
        ],
        maxHeight: '80%',
      }}
    >
      {/* Fixed Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-pbold text-gray-800">
          Suggested Fishes
        </Text>
        <Text className="text-md font-pmedium text-gray-600">
          {temperature}°C
        </Text>
      </View>

      {/* Scrollable Fish List */}
      <ScrollView 
        className="flex-1 mb-4" 
        showsVerticalScrollIndicator={false}
      >
        <View className="space-y-3">
          {fishSpecies.map((fish, index) => (
            <View 
              key={index}
              className="flex-row items-center p-3 bg-gray-50 rounded-xl"
            >
              <Ionicons name="fish" size={24} color="#1e5aa0" />
              <Text className="ml-3 text-lg font-pmedium text-gray-700">
                {fish}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Fixed Close Button */}
      <TouchableOpacity
        className="bg-[#1e5aa0] p-3 rounded-full items-center"
        onPress={closeModal}
      >
        <Text className="text-white text-lg font-pbold">Close</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <>
      <View
        className={`absolute top-0 left-0 right-0 p-5 py-4 z-10 ${getTemperatureColor(
          temperature
        )}`}
      >
        <View className="flex flex-row justify-between items-center">
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

          <TouchableOpacity
            className="bg-white/20 px-4 py-2 rounded-full"
            onPress={openModal}
          >
            <Text className="text-white font-psemibold">
              Suggested Fishes
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <View className="flex-1 bg-black/50 justify-end">
          {modalContent()}
        </View>
      </Modal>
    </>
  );
};

export default Temperature;
