// About.tsx
import React from "react";
import { View, Text, Image, SafeAreaView, TouchableOpacity, Linking, ScrollView } from "react-native";
import icons from "../../constants/images";

const About = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        
      >
      <View className="p-6">
        {/* App Logo and Name */}
        <View className="items-center my-8">
          <Image
            source={icons.logo2}
            className="w-32 h-32"
            resizeMode="contain"
          />
          <Text className="text-2xl font-pbold text-primary mt-4">SeaSense</Text>
          <Text className="text-sm font-pregular text-gray-500">Version 1.0.0</Text>
        </View>

        {/* App Description */}
        <View className="mb-8">
          <Text className="text-lg font-pmedium text-primary mb-2">About the App</Text>
          <Text className="text-base font-pregular text-gray-700 leading-6">
            SeaSense is your ultimate fishing companion, designed to help anglers track their 
            fishing spots, record catches, and monitor fishing conditions in real-time.
          </Text>
        </View>

        {/* Features */}
        <View className="mb-8">
          <Text className="text-lg font-pmedium text-primary mb-2">Key Features</Text>
          <View className="space-y-2">
            <Text className="text-base font-pregular text-gray-700">• Track fishing locations</Text>
            <Text className="text-base font-pregular text-gray-700">• Record catches and details</Text>
            <Text className="text-base font-pregular text-gray-700">• Monitor weather conditions</Text>
            <Text className="text-base font-pregular text-gray-700">• Share experiences with others</Text>
          </View>
        </View>

        {/* Developer Info */}
        <View className="mb-8">
          <Text className="text-lg font-pmedium text-primary mb-2">Developed by</Text>
          <Text className="text-base font-pregular text-gray-700">SeaSense Team</Text>
        </View>

        <View>
          <Text className="text-lg font-pmedium text-primary mb-2">Connect With Us</Text>
          <View className="flex-row space-x-4">
            <TouchableOpacity 
              onPress={() => Linking.openURL('mailto:nicosejohnsoriano@gmail.com')}
              className="bg-primary px-4 py-2 rounded-md"
            >
              <Text className="text-white font-pmedium">Contact Us</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => Linking.openURL('https://github.com/devseasense')}
              className="bg-primary px-4 py-2 rounded-md"
            >
              <Text className="text-white font-pmedium">Visit Website</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default About;