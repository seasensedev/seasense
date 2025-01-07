import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import NetInfo from '@react-native-community/netinfo';
import { Alert, View, Text } from 'react-native';
import { MapThemeProvider } from '../context/MapThemeContext';
import { LocationProvider } from '../context/LocationContext';
import { ErrorBoundary } from 'react-error-boundary';
import { OfflineDataProvider } from '../context/OfflineDataContext';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Something went wrong:</Text>
      <Text>{error.message}</Text>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();

    const unsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected && !isOfflineMode) {
        Alert.alert(
          "No Internet Connection",
          "Would you like to continue in offline mode? Some features may be limited.",
          [
            {
              text: "Enable Offline Mode",
              onPress: () => setIsOfflineMode(true),
              style: "default"
            },
            {
              text: "Try Again",
              onPress: () => NetInfo.fetch(),
              style: "cancel"
            }
          ],
          { cancelable: false }
        );
      }
    });

    return () => unsubscribe();
  }, [fontsLoaded, error, isOfflineMode]);

  if (!fontsLoaded && !error) return null;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <OfflineDataProvider>
        <LocationProvider>
          <MapThemeProvider>
            <Stack screenOptions={{
              headerShown: false,
            }}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="index" options={{ headerShown: false }} />
            </Stack>
          </MapThemeProvider>
        </LocationProvider>
      </OfflineDataProvider>
    </ErrorBoundary>
  );
}
