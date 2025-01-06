import React from "react";
import { Stack } from "expo-router";

export default function LogsLayout() {
  return (
    <Stack>
        <Stack.Screen
        name="navigate-location"
        options={{
          title: "Navigate Location",
          headerShown: true,
          headerTransparent: true,
          headerTitleStyle: { color: "black" },
          headerTintColor: "black",
        }}
      />
      <Stack.Screen
        name="edit-location"
        options={{
          title: "Update Location",
          headerShown: true,
          headerTransparent: true,
          headerTitleStyle: { color: "black" },
          headerTintColor: "black",
        }}
      />
      <Stack.Screen
        name="catch-details"
        options={{
          title: "Catch Details",
          headerShown: true,
          headerTransparent: false,
          headerTitleStyle: { color: "black" },
          headerTintColor: "black",
          headerLeft: () => null, 
          headerBackVisible: false, 
          gestureEnabled: false, 
        }}
      />
      <Stack.Screen
        name="edit-catches"
        options={{
          title: "Catch Details",
          headerShown: true,
          headerTransparent: false,
          headerTitleStyle: { color: "black" },
          headerTintColor: "black",
        }}
      />
       <Stack.Screen
        name="recent-track"
        options={{
          title: "Recent Track",
          headerShown: true,
          headerTransparent: false,
          headerTitleStyle: { color: "black" },
          headerTintColor: "black",
        }}
      />
       <Stack.Screen
        name="summary"
        options={{
          title: "Fishing Summary",
          headerShown: true,
          headerTransparent: false,
          headerTitleStyle: { color: "black" },
          headerTintColor: "black",
        }}
      />
       <Stack.Screen
        name="fish-analysis"
        options={{
          title: "Analysis",
          headerShown: true,
          headerTransparent: false,
          headerTitleStyle: { color: "black" },
          headerTintColor: "black",
        }}
      />
       <Stack.Screen
        name="archived-tracks"
        options={{
          title: "Archive",
          headerShown: true,
          headerTransparent: false,
          headerTitleStyle: { color: "black" },
          headerTintColor: "black",
        }}
      />
    </Stack>
    
  );
}
