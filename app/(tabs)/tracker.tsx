import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Modal,
  Animated,
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import * as Location from "expo-location";
import Toast from "@/components/Toaster/Toast";
import Temperature from "../../components/Temperature/temperature";
import { ref, onValue } from "firebase/database";
import { database, db, auth } from "../../config/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useMapTheme } from "../../context/MapThemeContext";
import { mapThemes } from "../../constants/mapStyles";
import { Ionicons } from "@expo/vector-icons";
interface PinnedLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  userId?: string;
  locationDetails?: {
    street: string | null;
    district: string | null;
    city: string | null;
    region: string | null;
    country: string | null;
  };
  currentCity?: string | null;
  temperature?: number | null;
}

export const TrackingMap = () => {
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [watchPositionSubscription, setWatchPositionSubscription] =
    useState<any>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [speed, setSpeed] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [temperature, setTemperature] = useState<number | null>(null);
  const [currentCity, setCurrentCity] = useState<string | null>(null);
  const [hasMovedRecently, setHasMovedRecently] = useState<boolean>(false);
  const [locationDetails, setLocationDetails] = useState<{
    street: string | null;
    district: string | null;
    city: string | null;
    region: string | null;
    country: string | null;
  }>({
    street: null,
    district: null,
    city: null,
    region: null,
    country: null,
  });
  const [pinnedLocations, setPinnedLocations] = useState<PinnedLocation[]>([]);
  const [isPinning, setIsPinning] = useState(false);
  const [lastPinnedLocation, setLastPinnedLocation] =
    useState<PinnedLocation | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [trackingSessionId, setTrackingSessionId] = useState<string | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const mapRef = useRef<MapView>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { currentTheme } = useMapTheme();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      const initialLocation = await Location.getCurrentPositionAsync({});
      setLocation(initialLocation.coords);
      reverseGeocode(initialLocation.coords);
    })();

    return () => {
      if (watchPositionSubscription) {
        watchPositionSubscription.remove();
      }
    };
  }, [watchPositionSubscription]);

  useEffect(() => {
    if (isTracking && startTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isTracking, startTime]);

  useEffect(() => {
    const sensorDataRef = ref(database, "sensor_data/");
    const unsubscribe = onValue(sensorDataRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const keys = Object.keys(data);
        const latestKey = keys[keys.length - 1];
        const latestData = data[latestKey];
        if (latestData && latestData.temperature) {
          setTemperature(latestData.temperature);
        }
      } else {
        setTemperature(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const reverseGeocode = async (coords: Location.LocationObjectCoords) => {
    const geocoded = await Location.reverseGeocodeAsync(coords);
    if (geocoded.length > 0) {
      const location = geocoded[0];
      setCurrentCity(location.city || location.subregion || "Location");
      setLocationDetails({
        street: location.street || null,
        district: location.district || null,
        city: location.city || null,
        region: location.region || null,
        country: location.country || null,
      });
    }
  };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      timestamp: timestamp,
    };
  };

  const saveTrackingDataToFirestore = async () => {
    try {
      if (!auth.currentUser) {
        showToast("Please login to save tracking data");
        return null;
      }
      
      const { latitude, longitude } = location || {};
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m`
      );
      const weatherData = await weatherResponse.json();

      const formattedStartTime = startTime ? formatDateTime(startTime) : null;

      const docRef = await addDoc(collection(db, "tracking_data"), {
        userId: auth.currentUser.uid,
        routeCoordinates,
        startTime: formattedStartTime,
        elapsedTime,
        speed,
        timestamp: formatDateTime(Date.now()),
        location: {
          coordinates: {
            latitude: location?.latitude,
            longitude: location?.longitude,
          },
          details: locationDetails,
          currentCity: currentCity,
        },
        temperature: temperature,
        pinnedLocations: pinnedLocations,
        weather: {
          temperature: weatherData.current.temperature_2m,
          precipitation: weatherData.current.precipitation,
          weatherCode: weatherData.current.weather_code,
          windSpeed: weatherData.current.wind_speed_10m,
          windDirection: weatherData.current.wind_direction_10m,
        },
      });

      console.log("Tracking data saved to Firestore!");
      return docRef.id;
    } catch (error) {
      console.error("Error saving tracking data to Firestore: ", error);
      return null;
    }
  };

  const startTracking = async () => {
    if (!isTracking) {
      setRouteCoordinates([]);
      setPinnedLocations([]);
      setLastPinnedLocation(null);
      setShowUndo(false);
      setHasMovedRecently(false);
      setTrackingSessionId(null);
      setSpeed(null);

      setIsTracking(true);
      setStartTime(Date.now());
      setElapsedTime(0);

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1,
        },
        (newLocation) => {
          const { latitude, longitude, speed } = newLocation.coords;
          setLocation(newLocation.coords);
          setRouteCoordinates((prevCoords) => [
            ...prevCoords,
            { latitude, longitude },
          ]);

          setSpeed(speed ? parseFloat((speed * 3.6).toFixed(2)) : 0);

          mapRef.current?.animateToRegion(
            {
              latitude,
              longitude,
              latitudeDelta: 0.001,
              longitudeDelta: 0.001,
            },
            1000
          );

          setHasMovedRecently(speed !== null && speed > 0);
          reverseGeocode(newLocation.coords);
        }
      );

      setWatchPositionSubscription(subscription);
    } else {
      setIsSaving(true);
      showToast("Saving track...");

      try {
        setIsTracking(false);
        if (watchPositionSubscription) {
          watchPositionSubscription.remove();
          setWatchPositionSubscription(null);
        }
        const sessionId = await saveTrackingDataToFirestore();
        if (sessionId) {
          setTrackingSessionId(sessionId);
          showToast("Track saved successfully!");
        } else {
          throw new Error("Failed to save tracking data");
        }
      } catch (error) {
        console.error("Error stopping tracking:", error);
        showToast("Failed to save track");
      } finally {
        setIsSaving(false);
        setIsLoading(false);

        // Reset states after successful save
        setRouteCoordinates([]);
        setPinnedLocations([]);
        setElapsedTime(0);
        setStartTime(null);
        setSpeed(null);
      }
    }
  };

  const undoLastPin = async () => {
    try {
      if (!lastPinnedLocation) return;

      setPinnedLocations((prev) =>
        prev.filter((pin) => pin.timestamp !== lastPinnedLocation.timestamp)
      );

      setLastPinnedLocation(null);
      setShowUndo(false);
      showToast("Pin removed");
    } catch (error) {
      console.error("Error removing pin: ", error);
      showToast("Failed to remove pin");
    }
  };

  const pinCurrentLocation = async () => {
    if (!isTracking) {
      Alert.alert(
        "Tracking Required",
        "Please start tracking first before adding location pins.",
        [
          {
            text: "OK",
            style: "default",
          },
        ]
      );
      return;
    }

    if (!location || isPinning) return;

    try {
      setIsPinning(true);

      if (!auth.currentUser) {
        showToast("Please login to save pins");
        return;
      }

      const newPin = {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: Date.now(),
        userId: auth.currentUser.uid,
        locationDetails,
        currentCity,
        temperature: temperature,
      };

      setPinnedLocations((prev) => [...prev, newPin]);
      setLastPinnedLocation(newPin);
      setShowUndo(true);
      showToast("Location pinned!");

      setTimeout(() => {
        setShowUndo(false);
      }, 5000);
    } catch (error) {
      console.error("Error saving pin: ", error);
      showToast("Failed to save pin");
    } finally {
      setIsPinning(false);
    }
  };

  if (errorMsg) {
    Alert.alert("Location Error", errorMsg);
  }

  const openDrawer = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const drawerContent = () => (
    <Animated.View
      className="absolute bottom-0 left-0 right-0 h-2/2 bg-white p-5 rounded-t-2xl shadow-lg z-10"
      style={{
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [450, 0],
            }),
          },
        ],
      }}
    >
      <View className="flex flex-col justify-center space-y-5 mb-6">
        <View className="flex flex-col justify-center">
          <Text className="font-pregular text-md text-center mb-8 uppercase">
            Time
          </Text>
          <Text className="font-semibold text-5xl mb-8 text-center">
            {formatTime(elapsedTime)}
          </Text>
          <Text className="font-pregular text-md text-center uppercase">
            Elapsed
          </Text>
        </View>

        <View className="py-[0.5px] bg-black/20"></View>

        <View className="flex flex-col justify-center">
          <Text className="font-pregular text-md text-center mb-8 uppercase">
            Distance
          </Text>
          <Text className="font-semibold text-7xl mb-8 text-center">
            {speed ? `${speed}` : "0.00"}
          </Text>
          <Text className="font-pregular text-md text-center uppercase">
            km
          </Text>
        </View>
      </View>

      <TouchableOpacity
        className=" bg-[#1e5aa0] p-3 rounded-full items-center"
        onPress={closeDrawer}
      >
        <Text className="text-white text-lg font-bold">Close</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View className="flex-1 justify-end p-3">
      {location ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          mapType="standard"
          customMapStyle={mapThemes[currentTheme]}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          }}
          showsUserLocation={true}
          followsUserLocation={true}
          showsMyLocationButton={true}
        >
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#fff"
            strokeWidth={5}
          />
          {pinnedLocations.map((pin, index) => (
            <Marker
              key={`pin-${pin.timestamp}`}
              coordinate={{
                latitude: pin.latitude,
                longitude: pin.longitude,
              }}
              pinColor="#1e5aa0"
              title={`Pin ${index + 1}`}
              description={`${new Date(pin.timestamp).toLocaleString()}`}
            />
          ))}
        </MapView>
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="font-psemibold text-xl text-[#1e5aa0]">
            {currentCity
              ? `You are in ${currentCity} right now. Start Tracking!`
              : "Getting location..."}
          </Text>
        </View>
      )}

      {/* Add Pin button above the other buttons */}
      <View className="absolute right-4 bottom-24 flex flex-col space-y-2">
        {showUndo && (
          <TouchableOpacity
            className="bg-white rounded-full w-12 h-12 items-center justify-center shadow-lg"
            onPress={undoLastPin}
          >
            <Ionicons name="arrow-undo" size={24} color="#1e5aa0" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="bg-white rounded-full w-12 h-12 items-center justify-center shadow-lg"
          onPress={pinCurrentLocation}
          disabled={isPinning}
        >
          {isPinning ? (
            <ActivityIndicator size="small" color="#1e5aa0" />
          ) : (
            <Ionicons name="location" size={24} color="#1e5aa0" />
          )}
        </TouchableOpacity>
      </View>

      <View className="flex flex-row justify-center space-x-2">
        <TouchableOpacity
          className={`bg-[#1e5aa0] rounded-full px-12 py-3 items-center ${
            isSaving && "opacity-75"
          }`}
          onPress={startTracking}
          disabled={isSaving}
        >
          {isSaving ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#fff" />
              <Text className="font-psemibold text-white text-lg font-bold ml-2">
                Saving...
              </Text>
            </View>
          ) : (
            <Text className="font-psemibold text-white text-lg font-bold">
              {isTracking ? "Stop Tracking" : "Start Tracking"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#1e5aa0] rounded-full px-9 py-3 items-center"
          onPress={openDrawer}
        >
          <Text className="font-psemibold text-white text-lg font-bold">
            Status
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeDrawer}
        style={{ zIndex: 1 }}
      >
        {drawerContent()}
      </Modal>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
      />

      <Temperature temperature={temperature} />
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default TrackingMap;
