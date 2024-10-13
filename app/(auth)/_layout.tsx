import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="log-in"
        options={{
          title: "Log in",
          headerShown: true,
          headerTransparent: true,
          headerTitleStyle: { color: "#FFF" },
          headerTintColor: "#FFF",
        }}
      />
      <Stack.Screen
        name="credentials"
        options={{
          title: "Information",
          headerShown: true,
          headerTransparent: true,
          headerTitleStyle: { color: "#FFF" },
          headerTintColor: "#FFF",
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="email-login"
        options={{
          title: "Log in with Email",
          headerShown: true,
          headerTransparent: true,
          headerTitleStyle: { color: "#FFF" },
          headerTintColor: "#FFF",
        }}
      />
      <Stack.Screen
        name="email-signup"
        options={{
          title: "Sign up with Email",
          headerShown: true,
          headerTransparent: true,
          headerTitleStyle: { color: "#FFF" },
          headerTintColor: "#FFF",
        }}
      />
    </Stack>
  );
}
