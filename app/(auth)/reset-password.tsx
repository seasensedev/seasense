import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "expo-router";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const router = useRouter();

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    if (!isValidEmail(email)) {
      setEmailError("Invalid email address.");
      return;
    }

    setEmailError("");
    setLoading(true);

    const auth = getAuth(); 

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Password Reset", "A password reset email has been sent to your email address.");
      setEmail(""); 
      router.push("/log-in"); 
    } catch (error: any) {
      if (error.code === "auth/invalid-email") {
        setEmailError("Invalid email address.");
      } else if (error.code === "auth/user-not-found") {
        setEmailError("No user found with this email address.");
      } else {
        setEmailError("Failed to send password reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-4 bg-gray-100">
      <Text className="text-2xl font-bold mb-4 text-center">Reset Your Password</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email address"
        className={`border border-gray-300 rounded-md p-2 bg-white mb-3 ${emailError ? 'border-red-500' : ''}`}
      />
      {emailError ? <Text className="text-red-500 mb-3 text-center">{emailError}</Text> : null}
      <TouchableOpacity className="bg-blue-500 p-3 rounded-md items-center" onPress={handleResetPassword} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-white text-lg">Send Password Reset Email</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ResetPassword;
