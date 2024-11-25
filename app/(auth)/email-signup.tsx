import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, TextInput, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import CustomButton from "../../components/Buttons/CustomButton";

const EmailSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUpWithEmailAndPassword } = useAuth();
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleSignup = async () => {
    if (!validateEmail(email)) {
      setEmailError("Invalid email address");
      return;
    } else {
      setEmailError("");
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true); 
    try {
      await signUpWithEmailAndPassword(email, password);
      Alert.alert("Success", "User account created & signed in! Please provide additional information.");
      router.push("/credentials");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 pt-24 items-center bg-primary px-4">
      <View className="mb-4 w-full">
        <Text className="text-lg font-semibold mb-2 text-white">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email address"
          style={[
            styles.input,
            emailError ? styles.inputError : null,
          ]}
        />
        {emailError ? (
          <Text className="text-red-500 text-sm mt-1">{emailError}</Text>
        ) : null}
      </View>

      <View className="mb-4 w-full">
        <Text className="text-lg font-semibold mb-2 text-white">Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          style={styles.input}
        />
      </View>

      <View className="mb-4 w-full">
        <Text className="text-lg font-semibold mb-2 text-white">Confirm Password</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm your password"
          secureTextEntry
          style={styles.input}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#ffffff" />
      ) : (
        <CustomButton title="Sign up" onPress={handleSignup} />
      )}

      <View className="flex-row items-center justify-center mt-5">
        <Text className="text-white text-center text-md">
          Already have an account?{" "}
        </Text>
        <TouchableOpacity onPress={() => router.push("/log-in")}>
          <Text className="font-bold text-white text-md">Log In</Text>
        </TouchableOpacity>
      </View>
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

export default EmailSignup;
