import React, { useRef, useState } from "react";
import { View, Text, Dimensions, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { doc, updateDoc, getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import PagerView from "react-native-pager-view";
import images from "../constants/images";

const { width } = Dimensions.get("window");

const slides = [
  {
    title: "Welcome to SeaSense",
    text: "Your personal weather and marine conditions tracker",
    image: images.logo2,
  },
  {
    title: "Real-time Updates",
    text: "Get instant notifications about weather changes and wave conditions",
    image: images.logo2,
  },
  {
    title: "Stay Informed",
    text: "Track wave heights, directions, and periods for better planning",
    image: images.logo2,
  },
];

export default function Onboarding() {
  const router = useRouter();
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleComplete = async () => {
    const auth = getAuth();
    const db = getFirestore();

    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        hasCompletedOnboarding: true,
      });
      router.push("/home");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <PagerView
        ref={pagerRef}
        className="flex-1"
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {slides.map((slide, index) => (
          <View key={index} className="flex-1 items-center justify-center p-5">
            <Image
              source={slide.image}
              className="w-[80%] h-[80%] mb-10"
              resizeMode="contain"
            />
            <Text className="text-2xl font-pbold mb-2.5 text-center text-[#0e4483]">
              {slide.title}
            </Text>
            <Text className="text-base text-center text-gray-600 px-5">
              {slide.text}
            </Text>
          </View>
        ))}
      </PagerView>

      <View className="p-5">
        <View className="flex-row justify-center mb-5">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`w-2.5 h-2.5 rounded-full mx-1 ${
                index === currentPage ? "bg-[#0e4483]" : "bg-gray-300"
              }`}
            />
          ))}
        </View>

        {currentPage === slides.length - 1 ? (
          <TouchableOpacity onPress={handleComplete}>
           <View className="py-4 px-10 rounded-full items-center bg-secondary">
              <Text className="text-white text-lg font-bold">Get Started</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => pagerRef.current?.setPage(currentPage + 1)}
          >
            <View className="py-4 px-10 rounded-full items-center bg-secondary">
              <Text className="text-white text-lg font-bold">Next</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
