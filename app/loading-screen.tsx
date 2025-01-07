import React from 'react';
import { SafeAreaView, ActivityIndicator, Image, View } from "react-native";
import images from "../constants/images";

export default function LoadingScreen() {
  return (
    <SafeAreaView className="bg-[#0e4483] h-full">
      <View className="flex-1 justify-center items-center">
        <Image
          source={images.logo}
          className="w-[230px] h-[150px] mb-8"
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    </SafeAreaView>
  );
}
