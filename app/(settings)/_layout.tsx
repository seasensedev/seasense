import React from "react";
import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="user-settings"
        options={{
          title: "Settings",
          headerShown: true,
          headerTransparent: true,
          headerTitleStyle: { color: "black" },
          headerTintColor: "black",
        }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{
          title: "Edit Profile",
          headerShown: true,
          headerTransparent: true,
          headerTitleStyle: { color: "black" },
          headerTintColor: "black",
          
        }}
      />
      <Stack.Screen
        name="change-password"
        options={{
          title: "Change Password",
          headerShown: true,
          headerTransparent: true,
          headerTitleStyle: { color: "black" },
          headerTintColor: "black",
          
        }}
      />
       <Stack.Screen
        name="faq"
        options={{
          title: "FAQ",
          headerShown: true,
          headerTransparent: true,
          headerTitleStyle: { color: "black" },
          headerTintColor: "black",
          
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          title: "About",
          headerShown: true,
          headerTransparent: true,
          headerTitleStyle: { color: "black" },
          headerTintColor: "black",
          
        }}
      />
      <Stack.Screen
        name="map-themes"
        options={{
          title: "Map Themes",
          headerShown: true,
          headerTransparent: true,
          headerTitleStyle: { color: "black" },
          headerTintColor: "black",
          
        }}
      />
    </Stack>
  );
}
