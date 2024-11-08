import React, { useState } from "react";
import { Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import EmailButton from "../../components/Buttons/EmailButton";
import GoogleButton from "../../components/Buttons/GoogleButton";
import { useRouter } from "expo-router";
import { getAuth, signInAnonymously } from "firebase/auth";

export default function LogIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Handle anonymous login
  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      await signInAnonymously(auth);
      console.log("Logged in anonymously");
      router.push("/home");
    } catch (error) {
      console.error("Anonymous Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-6 pt-24 bg-primary">
      <Text className="text-4xl justify-start text-white font-pbold mb-5">
        Welcome Back!
      </Text>

      <View className="mt-5">
        <GoogleButton
          title="Continue as Guest"
          onPress={handleAnonymousLogin}
        />
        <EmailButton
          title="Log in with Email"
          onPress={() => {
            router.push("/email-login");
          }}
        />
      </View>
      <View className="flex-row items-center justify-center">
        <Text className="text-white text-center mt-10 mr-1 text-lg">
          Not yet a member?
        </Text>
        <TouchableOpacity onPress={() => router.push("/")}>
          <Text className="text-white text-center mt-10 text-lg font-bold">
            Create account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
