import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, TextInput, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import CustomButton from "../../components/Buttons/CustomButton";
import { Picker } from "@react-native-picker/picker";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";

// Define the type for the locations data structure
type LocationData = {
  [region: string]: {
    [province: string]: {
      [city: string]: string[];
    };
  };
};

// Add Philippine locations data
const philippineLocations: LocationData = {
  "Region XI (Davao Region)": {
    "Davao del Sur": {
      "Davao City": [
        "Poblacion District",
        "Talomo District",
        "Buhangin District",
        "Toril District",
        "Bunawan District",
      ],
    },
    // ... other locations
  },
  // ... other regions
};

const EmailSignup = () => {
  // Auth states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  // User info states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");

  const { signUpWithEmailAndPassword } = useAuth();
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validateForm = () => {
    if (!validateEmail(email)) {
      setEmailError("Invalid email address");
      return false;
    }
    
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }

    if (!firstName || !lastName) {
      Alert.alert("Error", "Please fill in your name");
      return false;
    }

    if (!selectedRegion || !selectedProvince || !selectedCity || !selectedBarangay) {
      Alert.alert("Error", "Please complete your location details");
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userCredential = await signUpWithEmailAndPassword(email, password);
      
      if (userCredential) {
        const userDocRef = doc(db, "users", userCredential.uid);
        await setDoc(userDocRef, {
          firstName,
          lastName,
          location: {
            region: selectedRegion,
            province: selectedProvince,
            city: selectedCity,
            barangay: selectedBarangay,
          },
          email,
        });
        
        Alert.alert(
          "Success",
          "Account created successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                router.replace("/home");
              }
            }
          ],
          { cancelable: false }
        );
      }
    } catch (error: any) {
      let errorMessage = "An error occurred during signup";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-primary">
      <View className="pt-24 items-center px-4 pb-8">
        {/* Email Field */}
        <View className="mb-4 w-full">
          <Text className="text-lg font-semibold mb-2 text-white">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email address"
            style={[styles.input, emailError ? styles.inputError : null]}
          />
          {emailError ? (
            <Text className="text-red-500 text-sm mt-1">{emailError}</Text>
          ) : null}
        </View>

        {/* Password Fields */}
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

        {/* Personal Information */}
        <View className="mb-4 w-full">
          <Text className="text-lg font-semibold mb-2 text-white">First Name</Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            style={styles.input}
          />
        </View>

        <View className="mb-4 w-full">
          <Text className="text-lg font-semibold mb-2 text-white">Last Name</Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
            style={styles.input}
          />
        </View>

        {/* Location Section */}
        <View className="w-full mb-4">
          <Text className="text-lg font-semibold mb-2 text-white">Location</Text>
          
          <View className="bg-white rounded-md mb-2">
            <Picker
              selectedValue={selectedRegion}
              onValueChange={(itemValue) => {
                setSelectedRegion(itemValue);
                setSelectedProvince("");
                setSelectedCity("");
                setSelectedBarangay("");
              }}
              style={styles.picker}
            >
              <Picker.Item label="Select Region" value="" />
              {Object.keys(philippineLocations).map((region) => (
                <Picker.Item key={region} label={region} value={region} />
              ))}
            </Picker>
          </View>

          {selectedRegion && (
            <View className="bg-white rounded-md mb-2">
              <Picker
                selectedValue={selectedProvince}
                onValueChange={(itemValue) => {
                  setSelectedProvince(itemValue);
                  setSelectedCity("");
                  setSelectedBarangay("");
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select Province" value="" />
                {Object.keys(philippineLocations[selectedRegion]).map((province) => (
                  <Picker.Item key={province} label={province} value={province} />
                ))}
              </Picker>
            </View>
          )}

          {selectedProvince && (
            <View className="bg-white rounded-md mb-2">
              <Picker
                selectedValue={selectedCity}
                onValueChange={(itemValue) => {
                  setSelectedCity(itemValue);
                  setSelectedBarangay("");
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select City" value="" />
                {Object.keys(philippineLocations[selectedRegion][selectedProvince]).map((city) => (
                  <Picker.Item key={city} label={city} value={city} />
                ))}
              </Picker>
            </View>
          )}

          {selectedCity && (
            <View className="bg-white rounded-md mb-2">
              <Picker
                selectedValue={selectedBarangay}
                onValueChange={setSelectedBarangay}
                style={styles.picker}
              >
                <Picker.Item label="Select Barangay" value="" />
                {philippineLocations[selectedRegion][selectedProvince][selectedCity].map((barangay) => (
                  <Picker.Item key={barangay} label={barangay} value={barangay} />
                ))}
              </Picker>
            </View>
          )}
        </View>

        {/* Submit Button */}
        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : (
          <CustomButton title="Sign up" onPress={handleSignup} />
        )}

        {/* Login Link */}
        <View className="flex-row items-center justify-center mt-5">
          <Text className="text-white text-center text-md">
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/log-in")}>
            <Text className="font-bold text-white text-md">Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  picker: {
    height: 50,
  },
});

export default EmailSignup;
