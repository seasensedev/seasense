import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import EmailButton from "../../components/Buttons/EmailButton";
import GoogleButton from "../../components/Buttons/GoogleButton";
import { useRouter } from "expo-router";


export default function LogIn() {
  const router = useRouter();

  return (
    <View className="flex-1 p-6 pt-24 bg-[#0e4483]">
      <Text className="text-4xl justify-start text-white font-pbold mb-5">
        Welcome Back!
      </Text>

      <View className="mt-5">
        <GoogleButton
          title="Log in with Google"
          onPress={() => {
            console.log("Log In Pressed");
          }}
        />
        <EmailButton
          title="Log in with Email"
          onPress={() => {
            router.push("/email-login");
          }}
        />
      </View>
      <View className="flex-row items-center justify-center">
        <Text className="text-white text-center mt-10 mr-1 text-lg">
          Not yet a member?
        </Text>
        <TouchableOpacity onPress={() => router.push("/")}>
          <Text className="text-white text-center mt-10 text-lg font-bold">Create account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
