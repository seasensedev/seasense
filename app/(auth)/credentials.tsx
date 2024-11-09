import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { useAuth } from "../../hooks/useAuth";
import FormField from "../../components/Forms/FormField";
import CustomButton from "../../components/Buttons/CustomButton";
import { useRouter } from "expo-router";

type PhilippineLocationsType = {
  [region: string]: {
    [province: string]: {
      [city: string]: string[];
    };
  };
};

const philippineLocations: PhilippineLocationsType = {
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
    "Davao del Norte": {
      "Tagum City": [
        "Poblacion",
        "Apokon",
        "Magugpo East",
        "Magugpo North",
      ],
    },
  },
  "Region X (Northern Mindanao)": {
    "Misamis Oriental": {
      "Cagayan de Oro City": [
        "Carmen",
        "Nazareth",
        "Lumbia",
        "Macasandig",
      ],
    },
  },

};

function UserCredentials() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setErrorMessage(
        "Please provide more information to complete your profile"
      );
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!firstName || !lastName || !selectedRegion || !selectedProvince || !selectedCity || !selectedBarangay) {
      setErrorMessage("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
          firstName,
          lastName,
          location: {
            region: selectedRegion,
            province: selectedProvince,
            city: selectedCity,
            barangay: selectedBarangay,
          },
        });
        setErrorMessage("Profile information saved!");
        router.push("/home");
      } else {
        setErrorMessage("User not authenticated");
      }
    } catch (error) {
      console.error("Error writing document: ", error);
      setErrorMessage("Failed to save user information");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 pt-16 items-center bg-primary">
      <FormField
        label="First Name"
        value={firstName}
        placeholder="Enter your first name"
        onChangeText={setFirstName}
      />

      <FormField
        label="Last Name"
        value={lastName}
        placeholder="Enter your last name"
        onChangeText={setLastName}
      />

      <View className="bg-gray-400 w-5/6 h-[1px] px-4 mb-4"></View>
      <View className="w-full px-4 mb-4">
        <Text className="text-white text-md font-semibold">Location</Text>
        
        <View className="bg-white border rounded mt-2 mb-2">
          <Picker
            selectedValue={selectedRegion}
            onValueChange={(itemValue) => {
              setSelectedRegion(itemValue);
              setSelectedProvince("");
              setSelectedCity("");
              setSelectedBarangay("");
            }}
            style={{ height: 50, color: "black" }}
          >
            <Picker.Item label="Select Region" value="" />
            {Object.keys(philippineLocations).map((region) => (
              <Picker.Item key={region} label={region} value={region} />
            ))}
          </Picker>
        </View>

        {selectedRegion && (
          <View className="bg-white border rounded mt-2 mb-2">
            <Picker
              selectedValue={selectedProvince}
              onValueChange={(itemValue) => {
                setSelectedProvince(itemValue);
                setSelectedCity("");
                setSelectedBarangay("");
              }}
              style={{ height: 50, color: "black" }}
            >
              <Picker.Item label="Select Province" value="" />
              {Object.keys(philippineLocations[selectedRegion]).map((province) => (
                <Picker.Item key={province} label={province} value={province} />
              ))}
            </Picker>
          </View>
        )}

        {selectedProvince && (
          <View className="bg-white border rounded mt-2 mb-2">
            <Picker
              selectedValue={selectedCity}
              onValueChange={(itemValue) => {
                setSelectedCity(itemValue);
                setSelectedBarangay("");
              }}
              style={{ height: 50, color: "black" }}
            >
              <Picker.Item label="Select City/Municipality" value="" />
              {Object.keys(philippineLocations[selectedRegion][selectedProvince]).map((city) => (
                <Picker.Item key={city} label={city} value={city} />
              ))}
            </Picker>
          </View>
        )}

        {selectedCity && (
          <View className="bg-white border rounded mt-2 mb-2">
            <Picker
              selectedValue={selectedBarangay}
              onValueChange={setSelectedBarangay}
              style={{ height: 50, color: "black" }}
            >
              <Picker.Item label="Select Barangay" value="" />
              {philippineLocations[selectedRegion][selectedProvince][selectedCity].map((barangay) => (
                <Picker.Item key={barangay} label={barangay} value={barangay} />
              ))}
            </Picker>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#ffffff" />
      ) : (
        <CustomButton title="Submit" onPress={handleSubmit} />
      )}

      {errorMessage ? (
        <Text className="text-red-500 text-sm">{errorMessage}</Text>
      ) : null}
    </View>
  );
}

export default UserCredentials;
