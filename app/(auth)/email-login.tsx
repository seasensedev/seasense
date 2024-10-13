import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import CustomButton from "@/components/Buttons/CustomButton";

const EmailLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { loginWithEmailAndPassword } = useAuth();
  const router = useRouter();

  const isValidEmail = (email: any) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password: any) => {
    return password.length >= 6;
  };

  const handleLogin = async () => {
    let valid = true;

    if (!isValidEmail(email)) {
      setEmailError("Invalid email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!isValidPassword(password)) {
      setPasswordError("Password must be at least 6 characters long.");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!valid) return;

    setLoading(true);

    try {
      await loginWithEmailAndPassword(email, password);
      router.push("/home");
    } catch (error: any) {
      if (error.code === "auth/wrong-password") {
        setPasswordError("Incorrect password.");
        setEmailError("");
      } else if (error.code === "auth/user-not-found") {
        setEmailError("Email address not found.");
        setPasswordError("");
      } else {
        setEmailError("Invalid email or password.");
        setPasswordError(""); 
      }
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 pt-16 items-center bg-[#0e4483] relative">
      <View className="mb-4 w-full px-4">
        <Text className="text-lg font-semibold mb-2 text-white">Email Address</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email address"
          style={[styles.input, emailError ? styles.inputError : null]}
        />
        {emailError ? <Text className="text-red-500 mt-1">{emailError}</Text> : null}
      </View>

      <View className="mb-4 w-full px-4">
        <Text className="text-lg font-semibold mb-2 text-white">Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          style={[styles.input, passwordError ? styles.inputError : null]}
        />
        {passwordError ? <Text className="text-red-500 mt-1">{passwordError}</Text> : null}
      </View>

      <CustomButton title="Log In" onPress={handleLogin} disabled={loading} />

      <View className="flex-row items-center justify-center mt-5">
        <Text className="text-white text-center text-md">Did you forget your password?{" "}</Text>
        <TouchableOpacity onPress={() => router.push("/reset-password")}>
          <Text className="font-bold text-white text-md">Reset Password</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View className="absolute inset-0 top-0 right-0 bottom-0 left-0 bg-black/50 flex justify-center items-center">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white text-center mt-2">Logging in...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#f44336",
  },
});

export default EmailLogin;
