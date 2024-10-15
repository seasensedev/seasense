import React, { useEffect, useState } from "react";
import SplashScreen from "../app/splash-screen";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { SafeAreaView, ActivityIndicator } from "react-native";

export default function Index() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      router.push("/home");
    } else {
      setLoading(false);
    }
  }, [user, router]);

  if (loading) {
    return (
      <SafeAreaView className="bg-[#0e4483] h-full flex justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  return <SplashScreen />;
}
