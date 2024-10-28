import React, { useState } from "react";
import { Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmailButton from "../components/Buttons/EmailButton";
import GoogleButton from "../components/Buttons/GoogleButton";
import images from "../constants/images";
import { useRouter } from "expo-router";
import { getAuth, signInAnonymously } from "firebase/auth";

export default function SplashScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Handle anonymous sign-in
  const handleAnonymousSignIn = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      await signInAnonymously(auth);
      console.log("Signed in anonymously");
      router.push("/home"); 
    } catch (error) {
      console.error("Anonymous Sign-In Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-[#0e4483] h-full flex justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-[#0e4483] h-full">
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="w-full justify-center h-full items-center px-2">
          <Image
            source={images.logo}
            className="w-[230px] h-[150px]"
            resizeMode="contain"
          />
          <Text className="text-white text-center text-lg font-regular mt-4 mx-10 leading-5">
            Find fishing spots, get weather forecasts, and track fish behaviors!
          </Text>
          <View className="mt-10">
            <GoogleButton
              title="Continue as Guest"
              onPress={handleAnonymousSignIn}
            />
            <EmailButton
              title="Continue with Email"
              onPress={() => {
                router.push("/email-signup");
              }}
            />
          </View>
          <View className="flex-row items-center justify-center mt-10">
            <Text className="text-white text-center text-lg font-regular mt-5 mr-1 leading-5">
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push("/log-in")}>
              <Text className="text-white text-center text-lg font-bold mt-5 leading-5">
                Log In
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-center mt-10">
            <Text className="text-white text-center text-md font-regular mt-20 mx-10 leading-5">
              By continuing, you agree to our{" "}
              <Text style={{ fontWeight: 'bold' }}>Terms of Service</Text>{" "}
              and{" "}
              <Text style={{ fontWeight: 'bold' }}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
