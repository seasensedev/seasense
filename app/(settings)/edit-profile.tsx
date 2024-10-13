import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  TextInput,
  ActivityIndicator, 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EditForm from "@/components/Forms/EditForm";
import CustomButton from "@/components/Buttons/CustomButton";
import DeleteButton from "@/components/Buttons/DeleteButton";
import icons from "@/constants/icons";
import * as ImagePicker from "expo-image-picker";
import { getAuth, updateProfile, deleteUser } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "expo-router";

export default function EditProfile() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); 
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      const db = getFirestore();

      if (user) {
        // Fetch user data from Firestore
        const userDoc = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setEmail(user.email || "");

          // Optionally, fetch profile picture URL if needed
          const storage = getStorage();
          const profilePicRef = ref(storage, `profile_pictures/${user.uid}`);
          try {
            const url = await getDownloadURL(profilePicRef);
            setSelectedImage(url);
          } catch (error) {
            console.log("No profile picture found");
          }
        }
      }
    };

    fetchUserData();
  }, []);

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setLoading(true); 
    const auth = getAuth();
    const user = auth.currentUser;
    const db = getFirestore();
    const storage = getStorage();

    if (user) {
      try {
        // Fetch current user data for comparison
        const userDoc = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const currentFirstName = data.firstName || "";
          const currentLastName = data.lastName || "";
          const currentPhotoURL = data.photoURL || "";

          // Check if there are changes
          const hasChanges =
            firstName !== currentFirstName ||
            lastName !== currentLastName ||
            selectedImage !== currentPhotoURL;

          if (!hasChanges) {
            Alert.alert("Info", "No changes detected.");
            setLoading(false); 
            return;
          }

          // Prepare update data
          const updateData: any = {};
          if (firstName || lastName) {
            updateData.displayName = `${firstName} ${lastName}`;
          }
          if (selectedImage && selectedImage !== currentPhotoURL) {
            // Upload profile picture to Firebase Storage
            const response = await fetch(selectedImage);
            const blob = await response.blob();
            const storageRef = ref(storage, `profile_pictures/${user.uid}`);
            await uploadBytes(storageRef, blob);
            const photoURL = await getDownloadURL(storageRef);
            updateData.photoURL = photoURL;
          }

          // Update Firebase Auth profile
          if (Object.keys(updateData).length > 0) {
            await updateProfile(user, updateData);
          }

          // Update additional user data in Firestore
          await updateDoc(userDoc, {
            firstName: firstName,
            lastName: lastName,
            photoURL: updateData.photoURL || currentPhotoURL,
          });

          router.push("/profile");
        }
      } catch (error) {
        Alert.alert("Error", (error as Error).message);
      } finally {
        setLoading(false); 
      }
    }
  };

  const handleDeleteAccount = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      Alert.alert(
        "Confirm Deletion",
        "Are you sure you want to delete your account? This action cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                // Delete user data from Firestore
                const db = getFirestore();
                const userDoc = doc(db, "users", user.uid);
                await updateDoc(userDoc, {
                  firstName: null,
                  lastName: null,
                  email: null,
                  photoURL: null,
                });

                // Delete user account
                await deleteUser(user);
                Alert.alert("Success", "Your account has been deleted.");
                router.push("/");
              } catch (error) {
                Alert.alert("Error", (error as Error).message);
              }
            },
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 1, paddingVertical: 8 }}
      >
        <View className="flex-1 pt-20 bg-white">
          <View className="flex items-center">
            <TouchableOpacity
              onPress={handleImagePick}
              className="w-28 h-28 rounded-full bg-gray-300 flex justify-center items-center relative"
            >
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
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
              <View className="absolute w-28 h-28 rounded-full bg-black opacity-50 justify-center items-center">
                <Ionicons name="camera" size={24} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text className="font-psemibold text-lg my-4">
              Personal Details
            </Text>
            <View className="bg-gray-100 w-11/12 h-[1px] px-4 mb-4"></View>
          </View>

          <View className="mt-2">
            <EditForm
              label="First Name"
              value={firstName}
              placeholder="Enter your first name"
              onChangeText={setFirstName}
            />

            <EditForm
              label="Last Name"
              value={lastName}
              placeholder="Enter your last name"
              onChangeText={setLastName}
            />

            <View className="mb-4 w-full px-4">
              <Text className="text-black text-md font-semibold mb-1">
                Email Address
              </Text>
              <TextInput
                value={email}
                placeholder="Enter your email address"
                editable={false}
                className="py-3 px-4 rounded-lg bg-[#f7f6f6]"
              />
            </View>
          </View>

          <View className="mx-3">
            {loading ? (
              <ActivityIndicator size="large" color="#0e4483" />
            ) : (
              <CustomButton title="Save" onPress={handleSave}/>
            )}

            <DeleteButton
              title="Delete Account"
              onPress={handleDeleteAccount}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
