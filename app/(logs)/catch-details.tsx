import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  BackHandler,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import icons from "../../constants/icons";
import { useFocusEffect } from "@react-navigation/native";
import { useMapTheme } from '../../context/MapThemeContext';
import { mapThemes } from '../../constants/mapStyles';

const CatchDetails = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { latitude, longitude, description, documentId } = params;

  const docId = Array.isArray(documentId) ? documentId[0] : documentId;

  if (!docId) {
    console.error("Document ID is undefined");
    return null;
  }

  const lat = parseFloat(latitude as string);
  const lon = parseFloat(longitude as string);

  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const [dayCaught, setDayCaught] = useState(new Date());
  const [timeCaught, setTimeCaught] = useState(new Date());
  const [isDayPickerVisible, setDayPickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [fishName, setFishName] = useState<string>("");
  const [fishWeight, setFishWeight] = useState<string>("");
  const [fishLength, setFishLength] = useState<string>("");

  const [loading, setLoading] = useState(false);

  const { currentTheme } = useMapTheme();

  const onChangeDate = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || dayCaught;
    setDayPickerVisible(Platform.OS === "ios");
    setDayCaught(currentDate);
  };

  const onChangeTime = (event: any, selectedTime: Date | undefined) => {
    const currentTime = selectedTime || timeCaught;
    setTimePickerVisible(Platform.OS === "ios");
    setTimeCaught(currentTime);
  };

  const handleSaveCatchDetails = async () => {
    const db = getFirestore();
    const auth = getAuth();
    const docRef = doc(db, "log_catch", docId);

    setLoading(true);
    try {
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          fishName,
          fishWeight,
          fishLength,
          dayCaught: dayCaught.toISOString().split("T")[0],
          timeCaught: timeCaught.toISOString().split("T")[1],
        });
      } else {
        console.error("Document does not exist!");
      }

      Alert.alert("Success", "Catch details updated successfully!");
      router.push("/profile");
    } catch (error) {
      console.error("Error updating catch details:", error);
      Alert.alert("Error", "Failed to update catch details.");
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = () => {
    router.push({
      pathname: "/navigate-location",
      params: {
        latitude: lat.toString(),
        longitude: lon.toString(),
        description: description?.toString(),
      },
    });
  };

  const handleDeleteDocument = async () => {
    const db = getFirestore();
    const docRef = doc(db, "log_catch", docId);

    setLoading(true);
    try {
      await deleteDoc(docRef);
      router.push("/profile");
    } catch (error) {
      console.error("Error deleting document:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    Alert.alert(
      "Discard Details?",
      "Are you sure you want to discard the details?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Discard",
          onPress: () => {
            handleDeleteDocument(); 
          },
        },
      ]
    );
    return true; 
  };

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress
      );

      return () => backHandler.remove();
    }, [])
  );

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
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
              coordinate={{ latitude: lat, longitude: lon }}
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
              value={description?.toString()}
              placeholder="Enter description here"
              placeholderTextColor="#ddd"
              editable={false}
              className={`text-black font-psemibold text-xl px-1 py-2 border-b ${
                focusedInput === "description"
                  ? "border-blue-800"
                  : "border-gray-300"
              }`}
              onFocus={() => setFocusedInput("description")}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          <View className="mt-10 mb-24">
            <Text className="text-xl text-black font-pbold mt-2">
              Specify species
            </Text>
            <View className="mt-3">
              <View>
                <Text className="text-sm font-pregular">Fish Name</Text>
                <TextInput
                  placeholder="Enter fish name"
                  placeholderTextColor="#ddd"
                  value={fishName}
                  onChangeText={setFishName} 
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
                    placeholder="Fish Weight"
                    placeholderTextColor="#262626"
                    className={`text-black font-pmedium text-md px-6 py-4 border rounded-md flex-1 ${
                      focusedInput === "weight"
                        ? "border-blue-800"
                        : "border-gray-300"
                    }`}
                    onChangeText={setFishWeight}
                    onFocus={() => setFocusedInput("weight")}
                    onBlur={() => setFocusedInput(null)}
                    multiline={false}
                    numberOfLines={1}
                    keyboardType="numeric"
                  />
                  <Text className="absolute right-3 text-gray-500">lb</Text>
                </View>
                <View style={[styles.input, { flexDirection: 'row', alignItems: 'center' }]}>
                  <TextInput
                    placeholder="Fish Length"
                    placeholderTextColor="#262626"
                    className={`text-black font-pmedium text-md px-6 py-4 border rounded-md flex-1 ${
                      focusedInput === "length"
                        ? "border-blue-800"
                        : "border-gray-300"
                    }`}
                    onChangeText={setFishLength}
                    onFocus={() => setFocusedInput("length")}
                    onBlur={() => setFocusedInput(null)}
                    multiline={false}
                    numberOfLines={1}
                    keyboardType="numeric"
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
                      {dayCaught.toDateString()}
                    </Text>
                  </View>
                  {isDayPickerVisible && (
                    <DateTimePicker
                      value={dayCaught}
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
                      {timeCaught.toLocaleTimeString()}
                    </Text>
                  </View>
                  {isTimePickerVisible && (
                    <DateTimePicker
                      value={timeCaught}
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

      </ScrollView>

      <View className="absolute bottom-4 left-0 right-0 flex items-center">
        <TouchableOpacity
          className="bg-[#1e5aa0] rounded-full py-3 items-center w-11/12 mb-2"
          onPress={handleSaveCatchDetails}
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
  editIcon: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
    backgroundColor: "white",
    borderRadius: 50,
  },
  input: {
    flex: 1,
    maxWidth: 155,
  },
});

export default CatchDetails;