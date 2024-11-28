import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth'; 
import { useRouter } from 'expo-router';

export default function Settings() {
  const router = useRouter();
  const { signOut } = useAuth(); 

  const handleSignOut = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          onPress: async () => {
            try {
              await signOut();
              router.push("/");
            } catch (error) {
              Alert.alert("Error", "An error occurred while signing out.");
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <ScrollView className="flex-1 p-5 pt-20 bg-white">
      <View className="mb-5">
        <Text className="text-lg font-psemibold mb-1">Profile Settings</Text>
        <TouchableOpacity className="flex-row items-center p-2 bg-gray-100 rounded-t-lg" onPressIn={() => router.push("/edit-profile")}>
          <AntDesign name="user" size={24} color="#4F8EF7" />
          <Text className="ml-3 text-base">Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center p-2 bg-gray-100 rounded-b-lg" onPressIn={() => router.push("/change-password")}>
          <AntDesign name="lock" size={24} color="#4F8EF7" />
          <Text className="ml-3 text-base">Change Password</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-5">
        <Text className="text-lg font-psemibold mb-1">Other</Text>
        <TouchableOpacity className="flex-row items-center p-2 bg-gray-100 rounded-t-lg" onPressIn={() => router.push("/faq")}>
          <AntDesign name="mail" size={24} color="#4F8EF7" />
          <Text className="ml-3 text-base">Frequently Asked Questions</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center p-2 bg-gray-100 rounded-b-lg">
          <AntDesign name="paperclip" size={24} color="#4F8EF7" />
          <Text className="ml-3 text-base">Documentation</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-5">
        <Text className="text-lg font-psemibold mb-1">App Settings</Text>
        <TouchableOpacity 
          className="flex-row items-center p-2 bg-gray-100 rounded-t-lg" 
          onPressIn={() => router.push("/map-themes" as never)}
        >
          <AntDesign name="enviromento" size={24} color="#4F8EF7" />
          <Text className="ml-3 text-base">Map Themes</Text>
        </TouchableOpacity>
        
        {/* Add this new TouchableOpacity for notifications */}
        <TouchableOpacity 
          className="flex-row items-center p-2 bg-gray-100" 
          onPressIn={() => router.push("/notifications" as never)}
        >
          <AntDesign name="bells" size={24} color="#4F8EF7" />
          <Text className="ml-3 text-base">Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center p-2 bg-gray-100" onPressIn={() => router.push("/about")}>
          <AntDesign name="infocirlce" size={24} color="#4F8EF7" />
          <Text className="ml-3 text-base">About</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center p-2 bg-gray-100 rounded-b-lg" 
          onPress={handleSignOut} 
        >
          <AntDesign name="logout" size={24} color="red" />
          <Text className="ml-3 text-base text-red-600">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
