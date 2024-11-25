import React, { useEffect, useState } from "react";
import * as Notifications from 'expo-notifications';
import { doc, getDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import SplashScreen from "../app/splash-screen";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { SafeAreaView, ActivityIndicator } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Index() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (user) {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        router.push('/home');
      } else {
        setLoading(false);
      }
    };

    registerForPushNotificationsAsync();
    checkUserStatus();
  }, [user, router]);

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return;
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-[#0e4483] h-full flex justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  return <SplashScreen />;
}
