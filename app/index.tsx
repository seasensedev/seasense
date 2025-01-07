import React, { useEffect } from "react";
import * as Notifications from 'expo-notifications';
import LoadingScreen from "./loading-screen";
import SplashScreen from "../app/splash-screen";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const SignedIn = () => {
  const router = useRouter();
  useEffect(() => {
    try {
      router.replace('/home');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, []);
  return null;
};

const SignedOut = () => {
  return <SplashScreen />;
};

export default function Index() {
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : user ? (
        <SignedIn />
      ) : (
        <SignedOut />
      )}
    </>
  );
}
