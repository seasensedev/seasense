import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { setDoc, getDoc } from "firebase/firestore";

import icons from "../../constants/icons";
import { useMapTheme } from '../../context/MapThemeContext';
import { mapThemes } from '../../constants/mapStyles';

const EditCatches = () => {
  const router = useRouter();
  const {
    id,
    latitude,
    longitude,
    description,
    screenshotURL,
    fishName,
    fishWeight,
    fishLength,
    dayCaught,
    timeCaught,
  } = useLocalSearchParams();

  const [region, setRegion] = useState({
    latitude: parseFloat(latitude as string),
    longitude: parseFloat(longitude as string),
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (latitude && longitude) {
      setRegion({
        latitude: parseFloat(latitude as string),
        longitude: parseFloat(longitude as string),
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [latitude, longitude]);

  const [refreshing, setRefreshing] = useState<boolean>(false);

  const onRefresh = async () => {
    setRefreshing(true);
    
    try {
      const db = getFirestore();
      const catchRef = doc(db, "log_catch", String(id));
      const docSnap = await getDoc(catchRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDescriptionText(data.description || "");
        setFishNameText(data.fishName || "");
        setFishWeightText(data.fishWeight || "");
        setFishLengthText(data.fishLength || "");
        setSelectedDate(new Date(data.dayCaught));
        setSelectedTime(new Date(`1970-01-01T${data.timeCaught}`));
        setLat(data.latitude || 0);
        setLon(data.longitude || 0);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to refresh data.");
    } finally {
      setRefreshing(false);
    }
  };

  const parseDate = (dateStr: string) => new Date(dateStr);
  const parseTime = (timeStr: string) => {
    const [hours, minutes, seconds] = timeStr.split(":");
    return new Date().setHours(
      Number(hours),
      Number(minutes),
      Number(seconds.split(".")[0]),
      0
    );
  };

  const [isDayPickerVisible, setDayPickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  const [selectedDate, setSelectedDate] = useState(
    parseDate(dayCaught?.toString() ?? new Date().toISOString().split("T")[0])
  );
  const [selectedTime, setSelectedTime] = useState(
    new Date(
      parseTime(
        timeCaught?.toString() ??
          new Date().toISOString().split("T")[1]?.split("Z")[0]
      )
    )
  );

  const [lat, setLat] = useState(Number(latitude) || 0);
  const [lon, setLon] = useState(Number(longitude) || 0);
  const [descriptionText, setDescriptionText] = useState(
    description?.toString() ?? ""
  );
  const [fishNameText, setFishNameText] = useState(fishName?.toString() ?? "");
  const [fishWeightText, setFishWeightText] = useState(
    fishWeight?.toString() ?? ""
  );
  const [fishLengthText, setFishLengthText] = useState(
    fishLength?.toString() ?? ""
  );
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { currentTheme } = useMapTheme();

  const handleMapPress = () => {
    router.push({
      pathname: "/edit-location",
      params: {
        latitude: lat.toString(),
        longitude: lon.toString(),
        description: description?.toString(),
      },
    });
  };

  const saveCatchDetails = async () => {
    setLoading(true);

    try {
      const db = getFirestore();
      const catchRef = doc(db, "log_catch", String(id));

      const updatedData = {
        description: descriptionText,
        fishName: fishNameText,
        fishWeight: fishWeightText,
        fishLength: fishLengthText,
        dayCaught: selectedDate.toISOString().split("T")[0], 
        timeCaught: selectedTime.toISOString().split("T")[1].split(".")[0], 
        latitude: lat,
        longitude: lon,
      };

      await setDoc(catchRef, updatedData, { merge: true });
      Alert.alert("Success", "Catch details updated successfully.");
      router.back(); 
    } catch (error) {
      console.error("Error updating catch details:", error);
      Alert.alert("Error", "Failed to update catch details.");
    } finally {
      setLoading(false);
    }
  };

  const onChangeDate = (event: any, selectedDate: Date | undefined) => {
    setDayPickerVisible(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const onChangeTime = (event: any, selectedTime: Date | undefined) => {
    setTimePickerVisible(false);
    if (selectedTime) {
      setSelectedTime(selectedTime);
    }
  };

  const deleteCatch = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      const storage = getStorage();

      console.log("Deleting document with ID:", id);

      await deleteDoc(doc(db, "log_catch", String(id)));
      console.log("Document deleted from Firestore.");

      if (screenshotURL) {
        const imageRef = ref(storage, screenshotURL.toString());
        await deleteObject(imageRef);
        console.log("Screenshot deleted from Firebase Storage.");
      }

      Alert.alert("Success", "Catch deleted successfully.");
      router.back(); 
    } catch (error) {
      console.error("Error deleting catch:", error);
      Alert.alert("Error", "Failed to delete catch.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert("Delete Catch", "Are you sure you want to delete this catch?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", onPress: deleteCatch },
    ]);
  };

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="h-[200px] overflow-hidden">
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            mapType="standard"
            initialRegion={{
              latitude: lat,
              longitude: lon,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            zoomEnabled={false}
            scrollEnabled={false}
            onPress={handleMapPress}
            customMapStyle={mapThemes[currentTheme]} 
          >
            <Marker
              coordinate={{ latitude: region.latitude, longitude: region.longitude }}
              title="Fishing Spot"
              description={description?.toString() || ""}
            />
          </MapView>
          <TouchableOpacity style={styles.editIcon} onPress={handleMapPress}>
            <Image source={icons.edit} style={{ width: 24, height: 24 }} />
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          <View>
            <Text className="text-sm font-pregular">Fishing spot location</Text>
            <TextInput
              value={descriptionText}
              onChangeText={setDescriptionText}
              placeholder="Enter description here"
              placeholderTextColor="#ddd"
              className={`text-black font-psemibold text-xl px-1 py-2 border-b ${
                focusedInput === "description"
                  ? "border-blue-800"
                  : "border-gray-300"
              }`}
              onFocus={() => setFocusedInput("description")}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          <View className="mt-10">
            <Text className="text-xl text-black font-pbold mt-2">
              Specify species
            </Text>
            <View className="mt-3">
              <View>
                <Text className="text-sm font-pregular">Fish Name</Text>
                <TextInput
                  value={fishNameText}
                  onChangeText={setFishNameText}
                  placeholder="Enter fish name"
                  placeholderTextColor="#ddd"
                  className={`text-black font-pmedium text-md px-1 py-2 border-b ${
                    focusedInput === "fishName"
                      ? "border-blue-800"
                      : "border-gray-300"
                  }`}
                  onFocus={() => setFocusedInput("fishName")}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              <View className="flex-row justify-center space-x-3 mt-5">
                <View style={[styles.input, { flexDirection: 'row', alignItems: 'center' }]}>
                  <TextInput
                    value={fishWeightText}
                    onChangeText={setFishWeightText}
                    placeholder="Fish Weight"
                    placeholderTextColor="#262626"
                    className={`text-black font-pmedium text-md px-6 py-4 border rounded-md flex-1 ${
                      focusedInput === "weight"
                        ? "border-blue-800"
                        : "border-gray-300"
                    }`}
                    onFocus={() => setFocusedInput("weight")}
                    onBlur={() => setFocusedInput(null)}
                    multiline={false}
                    numberOfLines={1}
                  />
                  <Text className="absolute right-3 text-gray-500">lb</Text>
                </View>
                <View style={[styles.input, { flexDirection: 'row', alignItems: 'center' }]}>
                  <TextInput
                    value={fishLengthText}
                    onChangeText={setFishLengthText}
                    placeholder="Fish Length"
                    placeholderTextColor="#262626"
                    className={`text-black font-pmedium text-md px-6 py-4 border rounded-md flex-1 ${
                      focusedInput === "length"
                        ? "border-blue-800"
                        : "border-gray-300"
                    }`}
                    onFocus={() => setFocusedInput("length")}
                    onBlur={() => setFocusedInput(null)}
                    multiline={false}
                    numberOfLines={1}
                  />
                  <Text className="absolute right-3 text-gray-500">in</Text>
                </View>
              </View>

              <View className="flex-row justify-center space-x-3">
                <TouchableOpacity
                  className="mt-5 text-black font-pmedium text-md px-6 py-4 border border-gray-300 rounded-md"
                  onPress={() => setDayPickerVisible(true)}
                >
                  <View>
                    <Text className="text-sm font-pregular">Day caught</Text>
                    <Text className="text-lg font-pbold">
                      {selectedDate.toDateString()}
                    </Text>
                  </View>
                  {isDayPickerVisible && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="default"
                      onChange={onChangeDate}
                    />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  className="mt-5 text-black font-pmedium text-md px-6 py-4 border border-gray-300 rounded-md"
                  onPress={() => setTimePickerVisible(true)}
                >
                  <View>
                    <Text className="text-sm font-pregular">Time caught</Text>
                    <Text className="text-lg font-pbold">
                      {selectedTime.toLocaleTimeString()}
                    </Text>
                  </View>
                  {isTimePickerVisible && (
                    <DateTimePicker
                      value={selectedTime}
                      mode="time"
                      display="default"
                      onChange={onChangeTime}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {screenshotURL ? (
          <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
            <Image
              source={{ uri: screenshotURL?.toString() }}
              style={styles.screenshot}
              resizeMode="contain"
            />
          </View>
        ) : (
          <Text>No image available</Text>
        )}
      </ScrollView>

      <View className="absolute bottom-4 left-0 right-0 flex items-center">
        <TouchableOpacity
          className="bg-[#1e5aa0] rounded-full py-3 items-center w-11/12 mb-2"
          onPress={saveCatchDetails}
          disabled={loading}
        >
          <View className="flex-row items-center space-x-3">
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white text-lg font-semibold">
                Save Location
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white border border-red-600 rounded-full py-3 items-center w-11/12"
          onPress={confirmDelete}
          disabled={loading}
        >
          <View className="flex-row items-center space-x-3">
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-red-600 text-lg font-semibold">
                Delete Location
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  map: {
    height: 200,
  },
  editIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "white",
    padding: 5,
    borderRadius: 50,
    elevation: 5,
  },
  screenshot: {
    width: "100%",
    height: 300,
    borderRadius: 8,
  },
  input: {
    flex: 1,
    maxWidth: 150,
  },
});

export default EditCatches;
