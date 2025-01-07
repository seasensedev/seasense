import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc, deleteDoc, addDoc, collection, updateDoc } from "firebase/firestore";
import { db, auth } from "../../config/firebaseConfig"; 
import { useRouter } from "expo-router"; 
import { useMapTheme } from '../../context/MapThemeContext';
import { mapThemes } from '../../constants/mapStyles';
import { getFirestore } from 'firebase/firestore';
import { fishData } from "../../models/fish_data";
import { logTrackingData } from '../../utils/dataLogger';

const RecentTrack = () => {
  const params = useLocalSearchParams();
  const router = useRouter();

  interface TrackData {
    userId: string; 
    elapsedTime: number;
    location: {
      coordinates: {
        latitude: number;
        longitude: number;
      };
      currentCity: string;
      details: {
        street: string;
        district: string;
        city: string;
        region: string;
        country: string;
      };
    };
    routeCoordinates: Array<{
      latitude: number;
      longitude: number;
    }>;
    speed: number;
    temperature: number;
    timestamp: {
      date: string;
      time: string;
      timestamp: number;
    };
    pinnedLocations?: Array<{
      latitude: number;
      longitude: number;
      timestamp: number;
      locationDetails?: {
        street: string | null;
        district: string | null;
        city: string | null;
        region: string | null;
        country: string | null;
      };
      currentCity?: string | null;
      temperature?: number;
      fishLabel?: string; 
    }>;
    weather?: {
      temperature: number;
      precipitation: number;
      weatherCode: number;
      windSpeed: number;
      windDirection: number;
    };
  }

  const [trackData, setTrackData] = useState<TrackData | null>(null);
  const { currentTheme } = useMapTheme();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLabelModalVisible, setIsLabelModalVisible] = useState(false);
  const [selectedPinIndex, setSelectedPinIndex] = useState<number | null>(null);
  const [fishLabel, setFishLabel] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchTrackDetails = async () => {
      if (!auth.currentUser) {
        router.back(); 
        return;
      }

      if (params.trackId) {
        const trackDoc = await getDoc(doc(db, "tracking_data", params.trackId as string));
        if (trackDoc.exists()) {
          const data = trackDoc.data() as TrackData;
          if (data.userId !== auth.currentUser.uid) {
            router.back(); 
            return;
          }
          setTrackData(data);
        }
      }
    };
    fetchTrackDetails();
  }, [params.trackId]);

  if (!trackData) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-lg">Loading track data...</Text>
      </SafeAreaView>
    );
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getCenterAndDeltas = (coordinates: Array<{latitude: number; longitude: number}>) => {
    if (!coordinates || coordinates.length === 0) {
      return {
        latitude: trackData?.location.coordinates.latitude || 0,
        longitude: trackData?.location.coordinates.longitude || 0,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    let minLat = coordinates[0].latitude;
    let maxLat = coordinates[0].latitude;
    let minLng = coordinates[0].longitude;
    let maxLng = coordinates[0].longitude;

    coordinates.forEach(coord => {
      minLat = Math.min(minLat, coord.latitude);
      maxLat = Math.max(maxLat, coord.latitude);
      minLng = Math.min(minLng, coord.longitude);
      maxLng = Math.max(maxLng, coord.longitude);
    });

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    const latDelta = (maxLat - minLat) * 1.2;
    const lngDelta = (maxLng - minLng) * 1.2;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta, 0.005),
      longitudeDelta: Math.max(lngDelta, 0.005),
    };
  };

  const getWeatherDescription = (code: number) => {
    switch (code) {
      case 0: return "Clear Sky";
      case 1:
      case 2:
      case 3: return "Partly Cloudy";
      case 45:
      case 48: return "Foggy";
      case 51:
      case 53:
      case 55: return "Drizzle";
      case 61:
      case 63:
      case 65: return "Rainy";
      case 80:
      case 81:
      case 82: return "Showers";
      case 95:
      case 96:
      case 99: return "Thunderstorm";
      default: return "Unknown";
    }
  };

  const handleDeleteDocument = async () => {
    try {
      setIsDeleting(true);
      
      await logTrackingData({
        userId: auth.currentUser!.uid,
        action: 'delete',
        timestamp: Date.now(),
        trackId: params.trackId as string,
        originalData: trackData,
        details: {
          location: {
            city: trackData?.location?.details?.city,
            coordinates: trackData?.location?.coordinates
          },
          temperature: trackData?.temperature,
          elapsedTime: trackData?.elapsedTime,
          pinnedLocations: trackData?.pinnedLocations?.length
        }
      });

      await deleteDoc(doc(db, "tracking_data", params.trackId as string));
      router.back();
    } catch (error) {
      console.error("Error deleting track:", error);
      Alert.alert("Error", "Failed to delete track. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchive = async (trackData: any) => {
    try {
      setIsSaving(true);
      const db = getFirestore();

      const archivedDoc = await addDoc(collection(db, 'archived_tracks'), {
        ...trackData,
        archivedAt: new Date().toISOString(),
        isHidden: false,
        isArchived: true,
        originalId: params.trackId,
        lastModified: new Date().toISOString()
      });

      await logTrackingData({
        userId: auth.currentUser!.uid,
        action: 'archive',
        timestamp: Date.now(),
        trackId: params.trackId as string,
        originalData: trackData,
        details: {
          location: {
            city: trackData.location?.details?.city,
            coordinates: trackData.location?.coordinates
          },
          temperature: trackData.temperature,
          elapsedTime: trackData.elapsedTime,
          pinnedLocations: trackData.pinnedLocations?.length
        }
      });

      await deleteDoc(doc(db, "tracking_data", params.trackId as string));
      
      Alert.alert(
        "Success",
        "Track archived successfully",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Error archiving track:", error);
      Alert.alert("Error", "Failed to archive track");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePress = () => {
    Alert.alert(
      "Archive Track",
      "Are you sure you want to archive this track?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Archive",
          onPress: () => handleArchive(trackData)
        }
      ]
    );
  };

  const handleEditLabel = (index: number) => {
    setSelectedPinIndex(index);
    setFishLabel(trackData?.pinnedLocations?.[index]?.fishLabel || "");
    setIsLabelModalVisible(true);
  };

  const showAlert = (message: string) => {
    Alert.alert(
      "Notification",
      message,
      [{ text: "OK", style: "default" }]
    );
  };

  const handleSaveLabel = async () => {
    if (selectedPinIndex === null) return;

    try {
      const updatedPinnedLocations = [...(trackData?.pinnedLocations || [])];
      updatedPinnedLocations[selectedPinIndex] = {
        ...updatedPinnedLocations[selectedPinIndex],
        fishLabel: fishLabel
      };

      await updateDoc(doc(db, "tracking_data", params.trackId as string), {
        pinnedLocations: updatedPinnedLocations
      });

      setTrackData(prev => prev ? {
        ...prev,
        pinnedLocations: updatedPinnedLocations
      } : null);

      setIsLabelModalVisible(false);
      setSelectedPinIndex(null);
      setFishLabel("");
      
      showAlert("Fish label saved successfully!");
    } catch (error) {
      console.error("Error saving fish label:", error);
      showAlert("Failed to save fish label");
    }
  };

  const getFishNames = () => {
    return fishData.map(fish => fish.fish_name);
  };
  
  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 bg-gray-100">
        <View className="w-full h-[400px]">
          <MapView
            className="w-full h-full"
            provider={PROVIDER_GOOGLE}
            initialRegion={getCenterAndDeltas(trackData.routeCoordinates)}
            customMapStyle={mapThemes[currentTheme]}
          >
            <Marker
              coordinate={{
                latitude: trackData.location.coordinates.latitude,
                longitude: trackData.location.coordinates.longitude,
              }}
            />
            <Polyline
              coordinates={trackData.routeCoordinates}
              strokeColor="#1e5aa0"
              strokeWidth={3}
            />
            {/* Add Pinned Locations */}
            {trackData.pinnedLocations?.map((pin, index) => (
              <Marker
                key={`pin-${pin.timestamp}`}
                coordinate={{
                  latitude: pin.latitude,
                  longitude: pin.longitude,
                }}
                pinColor="#1e5aa0"
                title={`Pin ${index + 1}`}
                description={`${new Date(pin.timestamp).toLocaleString()}`}
              >
                <View className="items-center">
                  <View className="bg-white p-2 rounded-full border-2 border-[#1e5aa0] items-center justify-center">
                    <Ionicons name="location" size={20} color="#1e5aa0" />
                    <View className="absolute -top-2 -right-2 bg-[#1e5aa0] rounded-full w-5 h-5 items-center justify-center">
                      <Text className="text-white text-xs font-pbold">
                        {index + 1}
                      </Text>
                    </View>
                  </View>
                </View>
              </Marker>
            ))}
          </MapView>
        </View>

        {/* Redesigned Track Details Section */}
        <View className="p-4">
          <Text className="text-2xl font-pbold mb-4 text-gray-800">Track Details</Text>
          
          {/* Stats Grid */}
          <View className="flex-row flex-wrap justify-between">
            {/* Date Card */}
            <View className="bg-white p-4 rounded-xl shadow-sm w-[48%] mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="calendar" size={24} color="#1e5aa0" />
                <Text className="ml-2 text-gray-500 font-pmedium">Date</Text>
              </View>
              <Text className="text-gray-800 font-pbold">
                {trackData.timestamp.date}
              </Text>
              <Text className="text-gray-600 font-pregular">
                {trackData.timestamp.time}
              </Text>
            </View>

            {/* Duration Card */}
            <View className="bg-white p-4 rounded-xl shadow-sm w-[48%] mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="time" size={24} color="#1e5aa0" />
                <Text className="ml-2 text-gray-500 font-pmedium">Duration</Text>
              </View>
              <Text className="text-gray-800 font-pbold">
                {formatTime(trackData.elapsedTime)}
              </Text>
            </View>

            {/* Speed Card */}
            <View className="bg-white p-4 rounded-xl shadow-sm w-[48%] mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="speedometer" size={24} color="#1e5aa0" />
                <Text className="ml-2 text-gray-500 font-pmedium">Speed</Text>
              </View>
              <Text className="text-gray-800 font-pbold">
                {trackData.speed} <Text className="text-sm font-pregular">km/h</Text>
              </Text>
            </View>

            {/* Temperature Card */}
            <View className="bg-white p-4 rounded-xl shadow-sm w-[48%] mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="thermometer" size={24} color="#1e5aa0" />
                <Text className="ml-2 text-gray-500 font-pmedium">Temperature</Text>
              </View>
              <Text className="text-gray-800 font-pbold">
                {trackData.temperature}°C
              </Text>
            </View>

            {/* Weather Card */}
            {trackData.weather && (
              <View className="bg-white p-4 rounded-xl shadow-sm w-full mb-4">
                <View className="flex-row items-center mb-4">
                  <Ionicons name="partly-sunny" size={24} color="#1e5aa0" />
                  <Text className="ml-2 text-xl font-pbold text-gray-800">Weather Conditions</Text>
                </View>
                
                <View className="space-y-3">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <Ionicons name="cloud" size={20} color="#666" />
                      <Text className="ml-2 text-gray-600 font-pregular">
                        Condition
                      </Text>
                    </View>
                    <Text className="text-gray-800 font-pmedium">
                      {getWeatherDescription(trackData.weather.weatherCode)}
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <Ionicons name="water" size={20} color="#666" />
                      <Text className="ml-2 text-gray-600 font-pregular">
                        Precipitation
                      </Text>
                    </View>
                    <Text className="text-gray-800 font-pmedium">
                      {trackData.weather.precipitation} mm
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <Ionicons name="speedometer" size={20} color="#666" />
                      <Text className="ml-2 text-gray-600 font-pregular">
                        Wind Speed
                      </Text>
                    </View>
                    <Text className="text-gray-800 font-pmedium">
                      {trackData.weather.windSpeed} km/h
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <Ionicons name="compass" size={20} color="#666" />
                      <Text className="ml-2 text-gray-600 font-pregular">
                        Wind Direction
                      </Text>
                    </View>
                    <Text className="text-gray-800 font-pmedium">
                      {trackData.weather.windDirection}°
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Add Pins Count Card if there are pins */}
            {trackData.pinnedLocations && trackData.pinnedLocations.length > 0 && (
              <View className="bg-white p-4 rounded-xl shadow-sm w-full mb-4">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <Ionicons name="location" size={24} color="#1e5aa0" />
                    <Text className="ml-2 text-xl font-pbold text-gray-800">
                      Pinned Locations
                    </Text>
                  </View>
                  <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-[#1e5aa0] font-pmedium">
                      {trackData.pinnedLocations.length} pins
                    </Text>
                  </View>
                </View>
                
                <ScrollView 
                  className="max-h-[300px]" 
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  {trackData.pinnedLocations.map((pin, index) => (
                    <View 
                      key={index} 
                      className="mb-4 bg-gray-50 rounded-xl p-4 border border-gray-100"
                    >
                      <View className="flex-row justify-between items-start">
                        <View className="flex-row items-center">
                          <View className="bg-[#1e5aa0] h-8 w-8 rounded-full items-center justify-center">
                            <Text className="text-white font-pbold">{index + 1}</Text>
                          </View>
                          <View className="ml-3">
                            <Text className="text-gray-800 font-pbold text-lg">
                              Pin {index + 1}
                            </Text>
                            <Text className="text-gray-500 text-sm">
                              {new Date(pin.timestamp).toLocaleTimeString()}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleEditLabel(index)}
                          className="bg-blue-100 p-2 rounded-full"
                        >
                          <Ionicons name="pencil" size={20} color="#1e5aa0" />
                        </TouchableOpacity>
                      </View>

                      {/* Fish Label */}
                      {pin.fishLabel && (
                        <View className="mt-3 flex-row items-center bg-blue-50 p-2 rounded-lg">
                          <Ionicons name="fish" size={20} color="#1e5aa0" />
                          <Text className="ml-2 text-[#1e5aa0] font-pmedium">
                            {pin.fishLabel}
                          </Text>
                        </View>
                      )}

                      {/* Location and Temperature */}
                      <View className="mt-3 flex-row justify-between items-center">
                        {pin.currentCity && (
                          <View className="flex-row items-center flex-1 mr-2">
                            <Ionicons name="navigate" size={16} color="#666" />
                            <Text className="ml-2 text-gray-600 text-sm flex-wrap">
                              {pin.currentCity}
                            </Text>
                          </View>
                        )}
                        {pin.temperature && (
                          <View className="flex-row items-center bg-white px-3 py-2 rounded-lg border border-gray-200">
                            <Ionicons name="thermometer" size={16} color="#1e5aa0" />
                            <Text className="ml-1 text-gray-800 font-pbold">
                              {pin.temperature}°C
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Location Details Card */}
          <View className="bg-white p-4 rounded-xl shadow-sm mt-2">
            <View className="flex-row items-center mb-4">
              <Ionicons name="location" size={24} color="#1e5aa0" />
              <Text className="ml-2 text-xl font-pbold text-gray-800">Location Details</Text>
            </View>
            
            <View className="space-y-2">
              <View className="flex-row items-center">
                <Ionicons name="home" size={16} color="#666" />
                <Text className="ml-2 text-gray-600 font-pregular">
                  {trackData.location.details.street}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="business" size={16} color="#666" />
                <Text className="ml-2 text-gray-600 font-pregular">
                  {trackData.location.details.district}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <FontAwesome5 name="city" size={16} color="#666" />
                <Text className="ml-2 text-gray-600 font-pregular">
                  {trackData.location.details.city}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="map" size={16} color="#666" />
                <Text className="ml-2 text-gray-600 font-pregular">
                  {trackData.location.details.region}, {trackData.location.details.country}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-4">
            {isArchiving || isDeleting ? (
              <ActivityIndicator size="large" color="#dc2626" />
            ) : (
              <TouchableOpacity
                className="bg-white border border-red-600 rounded-full py-3 items-center mb-2"
                onPress={handleDeletePress}
                disabled={isSaving || isDeleting}
              >
                <View className="flex-row items-center space-x-3">
                  <Ionicons name="archive-outline" size={24} color="#dc2626" />
                  <Text className="text-red-600 text-lg font-psemibold">
                    {isSaving ? "Archiving..." : "Archive Track"}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
      <Modal
        visible={isLabelModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsLabelModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-2xl w-[90%] max-w-[400px]">
            <Text className="text-xl font-pbold mb-4">Add Fish Label</Text>
            
            {/* Dropdown Button */}
            <TouchableOpacity
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              className="border border-gray-300 rounded-lg p-3 mb-2 flex-row justify-between items-center"
            >
              <Text>{fishLabel || "Select a fish"}</Text>
              <Ionicons 
                name={isDropdownOpen ? "chevron-up" : "chevron-down"} 
                size={24} 
                color="#666"
              />
            </TouchableOpacity>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <ScrollView 
                className="max-h-[200px] border border-gray-200 rounded-lg mb-4"
                showsVerticalScrollIndicator={true}
              >
                {getFishNames().map((fishName, index) => (
                  <TouchableOpacity
                    key={index}
                    className="p-3 border-b border-gray-100"
                    onPress={() => {
                      setFishLabel(fishName);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <Text className={`${
                      fishLabel === fishName ? "text-[#1e5aa0] font-pmedium" : "text-gray-600"
                    }`}>
                      {fishName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Manual Input */}
            <TextInput
              value={fishLabel}
              onChangeText={setFishLabel}
              placeholder="Or type custom fish name"
              className="border border-gray-300 rounded-lg p-3 mb-4"
            />

            {/* Action Buttons */}
            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                onPress={() => {
                  setIsLabelModalVisible(false);
                  setIsDropdownOpen(false);
                }}
                className="px-4 py-2"
              >
                <Text className="text-gray-600 font-pmedium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleSaveLabel();
                  setIsDropdownOpen(false);
                }}
                className="bg-[#1e5aa0] px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-pmedium">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RecentTrack;