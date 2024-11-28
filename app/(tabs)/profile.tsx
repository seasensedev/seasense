import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileButton from "../../components/Buttons/ProfileButton";
import AddButton from "../../components/Buttons/AddButton";
import icons from "../../constants/icons";
import { useRouter } from "expo-router";
import { auth } from "../../config/firebaseConfig";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import FishingSpotList from "../../components/Profile/FishingSpotList";
import TrackList from "../../components/Profile/TrackList";
import { Ionicons } from '@expo/vector-icons';
import ArchiveButton from "../../components/Buttons/ArchiveButton";

interface FishingSpot {
  id: string;
  latitude: number;
  longitude: number;
  description: string;
  screenshotURL: string;
  fishName: string;
  fishWeight: number;
  fishLength: number;
  dayCaught: string;
  timeCaught: string;
}

interface Track {
  id: string;
  trackName: string;
  description: string;
  distance: number;
  duration: number;
}

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [emailInitial, setEmailInitial] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("Guest");
  const [lastName, setLastName] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [fishingSpots, setFishingSpots] = useState<FishingSpot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>("Catches");
  const [tracks, setTracks] = useState<Track[]>([]);

  const fetchUserData = async () => {
    setLoading(true);
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);

      if (currentUser.isAnonymous) {
        setFirstName("Guest");
        setEmailInitial("@guest");
      } else {
        const userDoc = doc(getFirestore(), "users", currentUser.uid);
        const docSnap = await getDoc(userDoc);

        const email = currentUser.email || "";
        const initial = email.split("@")[0];
        setEmailInitial(`@${initial}`);

        if (docSnap.exists()) {
          const data = docSnap.data() as DocumentData;
          setFirstName(data?.firstName || "");
          setLastName(data?.lastName || "");

          const storage = getStorage();
          const profilePicRef = ref(
            storage,
            `profile_pictures/${currentUser.uid}`
          );
          try {
            const url = await getDownloadURL(profilePicRef);
            setProfilePicture(url);
          } catch (error) {
            console.log("No profile picture found");
          }

          const db = getFirestore();

          // Fetch Fishing Spots
          const catchQuery = query(
            collection(db, "log_catch"),
            where("userId", "==", currentUser.uid)
          );
          const querySnapshot = await getDocs(catchQuery);
          const spots = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              latitude: data.latitude,
              longitude: data.longitude,
              description: data.description,
              screenshotURL: data.screenshotURL,
              fishName: data.fishName,
              fishWeight: data.fishWeight,
              fishLength: data.fishLength,
              dayCaught: data.dayCaught,
              timeCaught: data.timeCaught,
            } as FishingSpot;
          });

          setFishingSpots(spots);

            // Fetch Tracks
        const trackQuery = query(
          collection(getFirestore(), "tracks"), // Change "tracks" to your actual collection name
          where("userId", "==", currentUser.uid)
        );
        const trackSnapshot = await getDocs(trackQuery);
        const tracksData = trackSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            trackName: data.trackName,
            description: data.description,
            distance: data.distance,
            duration: data.duration,
          } as Track;
        });
        setTracks(tracksData);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const handleAddButtonPress = () => {
    if (user?.isAnonymous) {
      Alert.alert(
        "Account Required",
        "Please create an account with an email to use this feature."
      );
    } else {
      router.push("/navigate-location");
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleTabSelect = (tab: string) => {
    setSelectedTab(tab);
    setDropdownVisible(false);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex items-center">
          <View className="w-28 h-28 rounded-full bg-gray-300 flex justify-center items-center">
            {profilePicture ? (
              <Image
                source={{ uri: profilePicture }}
                className="w-28 h-28 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <Image
                source={icons.user}
                className="w-14 h-14"
                resizeMode="contain"
                style={{ tintColor: "#9ca3af" }}
              />
            )}
          </View>
          <Text className="text-lg mt-3 -mb-1 font-psemibold">
            {firstName} {lastName}
          </Text>
          <View className="flex items-center space-y-2">
            <Text className="text-md text-black font-pregular">
              {emailInitial}
            </Text>
          </View>
          <View className="flex flex-row items-center space-x-2 mt-2">
            <ProfileButton
              title="Edit profile"
              onPress={() => router.push("/edit-profile")}
            />
            <ProfileButton
              title="Settings"
              onPress={() => router.push("/user-settings")}
            />
          </View>
        </View>

        <View className="flex flex-row justify-between items-center mt-1">
          <TouchableOpacity
            onPress={toggleDropdown}
            className="flex-row items-center space-x-1.5"
          >
            <Text className="text-black text-lg font-psemibold">
              {selectedTab}
            </Text>
            <Image
              source={icons.down}
              className="w-3 h-3 mt-1.5"
              resizeMode="contain"
            />
          </TouchableOpacity>

          <View className="flex-row space-x-2">
            <ArchiveButton onPress={() => router.push("/archived-tracks" as never)} />
            <AddButton onPress={handleAddButtonPress} />
          </View>
        </View>

        {dropdownVisible && (
          <View className="absolute top-64 left-5 bg-white shadow-lg shadow-black p-2 space-y-1 w-32 rounded-md z-10">
            <TouchableOpacity onPress={() => handleTabSelect("Catches")}>
              <Text className="text-black font-pmedium">Catches</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleTabSelect("Tracks")}>
              <Text className="text-black font-pmedium">Tracks</Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedTab === "Catches" ? (
          <FishingSpotList
            fishingSpots={fishingSpots}
            handleAddButtonPress={handleAddButtonPress}
            icons={icons}
          />
        ) : (
          <TrackList tracks={tracks} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
