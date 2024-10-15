import React, { useEffect, useState, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import EditLocationForm from "../../components/Forms/EditLocationForm";
import { captureRef } from "react-native-view-shot";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, setDoc, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useRouter, useLocalSearchParams } from "expo-router";

const EditLocation = () => {
  const { describeLocation: initialDescribeLocation, latitude: initialLatitude, longitude: initialLongitude } = useLocalSearchParams();
  const [describeLocation, setDescribeLocation] = useState<string>(Array.isArray(initialDescribeLocation) ? initialDescribeLocation.join("") : initialDescribeLocation || "");
  const [region, setRegion] = useState({
    latitude: parseFloat(Array.isArray(initialLatitude) ? initialLatitude[0] : initialLatitude || "7.0732"),
    longitude: parseFloat(initialLongitude as string || "125.6104"),
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [currentLocation, setCurrentLocation] = useState({
    latitude: parseFloat(Array.isArray(initialLatitude) ? initialLatitude[0] : initialLatitude || "7.0732"),
    longitude: parseFloat(Array.isArray(initialLongitude) ? initialLongitude[0] : initialLongitude || "125.6104"),
  });
  const [isPanning, setIsPanning] = useState(false);
  const [centerLocation, setCenterLocation] = useState({
    latitude: parseFloat(Array.isArray(initialLatitude) ? initialLatitude[0] : initialLatitude || "7.0732"),
    longitude: parseFloat(Array.isArray(initialLongitude) ? initialLongitude[0] : initialLongitude || "125.6104"),
  });
  const pulseAnimation = useState(new Animated.Value(1))[0];
  const opacityPulseAnimation = useState(new Animated.Value(1))[0];
  const dotOpacityAnimation = useState(new Animated.Value(1))[0];
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<MapView>(null);
  const router = useRouter();

  // Firebase references
  const storage = getStorage();
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setCurrentLocation({ latitude, longitude });
      setCenterLocation({ latitude, longitude });
    };

    getLocation();
  }, []);

  useEffect(() => {
    if (!isPanning) {
      if (timeoutId) clearTimeout(timeoutId);

      const newTimeoutId = setTimeout(() => {
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnimation, {
              toValue: 2,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(opacityPulseAnimation, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(dotOpacityAnimation, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(opacityPulseAnimation, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]).start();
      }, 300);

      setTimeoutId(newTimeoutId);
    } else {
      pulseAnimation.stopAnimation();
      pulseAnimation.setValue(1);
      opacityPulseAnimation.stopAnimation();
      opacityPulseAnimation.setValue(1);
      dotOpacityAnimation.stopAnimation();
      dotOpacityAnimation.setValue(1);
    }
  }, [isPanning, pulseAnimation, opacityPulseAnimation, dotOpacityAnimation]);

  const handleRegionChange = () => {
    setIsPanning(true);
  };

  const handleRegionChangeComplete = (newRegion: any) => {
    setIsPanning(false);
    if (
      Math.abs(newRegion.latitude - region.latitude) > 0.0001 ||
      Math.abs(newRegion.longitude - region.longitude) > 0.0001 ||
      Math.abs(newRegion.latitudeDelta - region.latitudeDelta) > 0.0001 ||
      Math.abs(newRegion.longitudeDelta - region.longitudeDelta) > 0.0001
    ) {
      setRegion(newRegion);
      setCenterLocation({
        latitude: newRegion.latitude,
        longitude: newRegion.longitude,
      });
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setRegion((prevRegion) => ({
      ...prevRegion,
      latitude,
      longitude,
    }));
    setCurrentLocation({ latitude, longitude });
  };

  const saveLocation = async () => {
    if (!describeLocation.trim()) {
      Alert.alert("Error", "Please enter a description for the fishing spot.");
      return;
    }
  
    setLoading(true);
  
    try {
      if (mapRef.current) {
        const screenshotUri = await captureRef(mapRef.current, {
          format: "png",
          quality: 1.0,
        });
  
        const response = await fetch(screenshotUri);
        const blob = await response.blob();
        const storageRef = ref(storage, `map_screenshots/${Date.now()}.png`);
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
  
        const newDocRef = doc(collection(db, "log_catch"));
        await setDoc(newDocRef, {
          userId: auth.currentUser?.uid,
          latitude: region.latitude.toString(),
          longitude: region.longitude.toString(),
          description: describeLocation,
          screenshotURL: downloadURL,
          fishName: "",
          fishWeight: "",
          fishLength: "",
          dayCaught: "",
          timeCaught: "",
        });
  
        // Navigate back with updated parameters
        router.push({
          pathname: "/edit-catches",
          params: {
            id: newDocRef.id,
            latitude: region.latitude.toString(),
            longitude: region.longitude.toString(),
            description: describeLocation,
          }
        });
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save location and upload screenshot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-white flex-1">
      <View className="mt-14">
        <View className="flex flex-row text-lg justify-center font-semibold text-black space-x-28">
          <Text className="text-lg font-psemibold text-black">
            Lat:{" "}
            <Text className="font-pregular">{region.latitude.toFixed(6)}</Text>
          </Text>
          <Text className="text-lg font-psemibold text-black">
            Lon:{" "}
            <Text className="font-pregular">{region.longitude.toFixed(6)}</Text>
          </Text>
        </View>
      </View>
      <View style={styles.container} className="mt-2">
        <MapView
          style={styles.map}
          mapType="hybrid"
          region={region}
          onRegionChange={handleRegionChange}
          onRegionChangeComplete={handleRegionChangeComplete}
          onPress={handleMapPress}
          ref={mapRef}
        >
          <Marker
            coordinate={currentLocation}
            title="Current Location"
            description="This is where you are"
          />
          <Marker
            coordinate={centerLocation}
            title="Center Location"
            description="Center of the map"
            pinColor="blue"
          />
        </MapView>
        <View style={styles.markerFixed}>
          <Animated.View
            style={[
              styles.pulse,
              {
                transform: [{ scale: pulseAnimation }],
                opacity: opacityPulseAnimation,
                pointerEvents: "none",
              },
            ]}
          />
          <Animated.View
            style={[
              styles.marker,
              {
                opacity: dotOpacityAnimation,
              },
            ]}
          />
        </View>
      </View>
      <View className="mt-2">
        <TouchableOpacity
          className="mx-10 my-5 bg-[#0066CC] px-3 py-3 rounded-lg"
          onPress={saveLocation}
        >
          <Text className="text-center text-white text-lg font-semibold">
            {loading ? <ActivityIndicator color="white" /> : "Save Location"}
          </Text>
        </TouchableOpacity>
        <EditLocationForm
          onDescribeLocationChange={setDescribeLocation}
          describeLocation={describeLocation}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  map: {
    flex: 1,
  },
  markerFixed: {
    position: "absolute",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    top: "50%",
  },
  pulse: {
    position: "absolute",
    backgroundColor: "rgba(0, 150, 255, 0.3)",
    borderRadius: 50,
    width: 20,
    height: 20,
  },
  marker: {
    position: "absolute",
    backgroundColor: "rgba(0, 150, 255, 0.7)",
    borderRadius: 50,
    width: 10,
    height: 10,
  },
});

export default EditLocation;
