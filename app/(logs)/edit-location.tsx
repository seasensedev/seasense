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
import { captureRef } from "react-native-view-shot";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, setDoc, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMapTheme } from '../../context/MapThemeContext';
import { mapThemes } from '../../constants/mapStyles';

const EditLocation = () => {
  const { latitude: initialLatitude, longitude: initialLongitude, id } = useLocalSearchParams();
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
  const { currentTheme } = useMapTheme();

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
  
        const docRef = id ? doc(db, "log_catch", id.toString()) : doc(collection(db, "log_catch"));
        
        await setDoc(docRef, {
          userId: auth.currentUser?.uid,
          latitude: region.latitude.toString(),
          longitude: region.longitude.toString(),
          screenshotURL: downloadURL,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
  
        router.back();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update location.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-white flex-1">
      <View className="mt-24">
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
          mapType="standard"
          region={region}
          onRegionChange={handleRegionChange}
          onRegionChangeComplete={handleRegionChangeComplete}
          onPress={handleMapPress}
          ref={mapRef}
          customMapStyle={mapThemes[currentTheme]}
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
        <TouchableOpacity className="mx-2 space-y-2">
          {loading ? (
            <ActivityIndicator size="large" color="#1e5aa0" />
          ) : (
            <TouchableOpacity
              className="bg-[#1e5aa0] rounded-full py-3 items-center mb-2"
              onPress={saveLocation}
            >
              <View className="flex-row items-center space-x-3">
                <Text className="text-white text-lg font-semibold">
                  Update Location
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "60%",
    width: "100%",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerFixed: {
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: -3,
    marginTop: -5,
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    height: 5,
    width: 5,
    borderRadius: 7,
    backgroundColor: "white",
    borderColor: "white",
    borderWidth: 2,
  },
  pulse: {
    position: "absolute",
    height: 124,
    width: 124,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
});

export default EditLocation;

const customMapStyle = [
  {
    featureType: "all",
    elementType: "geometry",
    stylers: [
      {
        color: "#202c3e",
      },
    ],
  },
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [
      {
        gamma: 0.01,
      },
      {
        lightness: 20,
      },
      {
        weight: "1.39",
      },
      {
        color: "#ffffff",
      },
    ],
  },
  {
    featureType: "all",
    elementType: "labels.text.stroke",
    stylers: [
      {
        weight: "0.96",
      },
      {
        saturation: "9",
      },
      {
        visibility: "on",
      },
      {
        color: "#000000",
      },
    ],
  },
  {
    featureType: "all",
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [
      {
        lightness: 30,
      },
      {
        saturation: "9",
      },
      {
        color: "#29446b",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [
      {
        saturation: 20,
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        lightness: 20,
      },
      {
        saturation: -20,
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        lightness: 10,
      },
      {
        saturation: -30,
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#193a55",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [
      {
        saturation: 25,
      },
      {
        lightness: 25,
      },
      {
        weight: "0.01",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "all",
    stylers: [
      {
        lightness: -20,
      },
    ],
  },
];
