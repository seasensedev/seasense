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
import MapView, { Polyline } from "react-native-maps";
import * as Location from "expo-location";
import Toast from "../../components/Toaster/Toast";
import { ref, onValue } from "firebase/database";
import { database } from "../../config/firebaseConfig"; // Import your database config


export const SonarDataMap = () => {
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

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const mapRef = useRef<MapView>(null);
  const slideAnim = useRef(new Animated.Value(0)).current; 

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
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
    // Reference the sensor_data node in Firebase Realtime Database
    const sensorDataRef = ref(database, "sensor_data/");

    // Listen for changes to the sensor_data node
    const unsubscribe = onValue(sensorDataRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Extract the latest entry (or the one you need)
        const keys = Object.keys(data); // Get all dynamic keys
        const latestKey = keys[keys.length - 1]; // Assuming the latest is the last key

        // Access the temperature for the latest key
        const latestData = data[latestKey];
        if (latestData && latestData.temperature) {
          setTemperature(latestData.temperature); // Update state with new temperature value
        }
      } else {
        setTemperature(null); // Handle when data doesn't exist
      }
    });

    return () => unsubscribe();
  }, []);

  const startTracking = async () => {
    if (!isTracking) {
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
        }
      );

      setWatchPositionSubscription(subscription);
    } else {
      // Start loading spinner when stopping tracking
      setIsLoading(true);

      // Delay stopping tracking by 300ms
      setTimeout(() => {
        setIsTracking(false);
        if (watchPositionSubscription) {
          watchPositionSubscription.remove();
          setWatchPositionSubscription(null);
        }
        setIsLoading(false); // Stop loading spinner
        showToast("Tracking Stopped");
      }, 1200); // Delay for 300ms
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

  // Utility function to format the elapsed time in HH:MM:SS
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
        
        <View className="flex flex-col justify-center">
          <Text className="font-pregular text-md text-center mb-8 uppercase">
            Temperature
          </Text>
          <Text className="font-semibold text-7xl mb-8 text-center">
            {temperature !== null ? `${temperature}` : "Loading..."}
          </Text>
          <Text className="font-pregular text-md text-center uppercase">
            °C
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
        </MapView>
      ) : (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1e5aa0" />
        </View>
      )}

      <View className="flex flex-row justify-center space-x-2">
        <TouchableOpacity
          className="bg-[#1e5aa0] rounded-full px-6 py-3 items-center"
          onPress={openDrawer}
        >
          <Text className="font-psemibold text-white text-lg font-bold">
            Status
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-[#1e5aa0] rounded-full px-6 py-3 items-center "
          onPress={startTracking}
          disabled={isLoading} // Disable button while loading
        >
          {isLoading && isTracking ? ( // Show spinner if loading and tracking
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="font-psemibold text-white text-lg font-bold">
              {isTracking ? "Stop Tracking" : "Start Tracking"}
            </Text>
          )}
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
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default SonarDataMap;

