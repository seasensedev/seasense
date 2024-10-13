import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import {
  getAuth,
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
} from "firebase/auth";
import { useRouter } from "expo-router";

const EditForm = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  error?: string;
}) => {
  return (
    <View className="mb-4">
      <Text className="text-lg font-semibold mb-2">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        style={[
          styles.input,
          error ? styles.inputError : {},
        ]}
      />
      {error && <Text className="text-red-500 mt-1">{error}</Text>}
    </View>
  );
};

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [errors, setErrors] = useState<{ currentPassword?: string; newPassword?: string }>({});
  const router = useRouter();

  const handleChangePassword = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    let hasError = false;
    let newErrors: { currentPassword?: string; newPassword?: string } = {};

    if (!user) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    if (!currentPassword || !newPassword) {
      if (!currentPassword) newErrors.currentPassword = "Current password is required.";
      if (!newPassword) newErrors.newPassword = "New password is required.";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      Alert.alert("Success", "Password has been updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setErrors({});
      router.push("/user-settings");

    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  return (
    <SafeAreaView className="bg-white flex-1">
      <View className="mt-14 p-4">
        <EditForm
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter current password"
          secureTextEntry
          error={errors.currentPassword}
        />
        <EditForm
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          secureTextEntry
          error={errors.newPassword}
        />

      </View>

      <View className="mx-3 -mt-5">
          <TouchableOpacity
            className="bg-[#1e5aa0] rounded-full py-3 items-center mb-2"
            onPress={handleChangePassword}
          >
            <View className="flex-row items-center space-x-3">
              <Text className="text-white text-lg font-semibold">
                Update Password
              </Text>
            </View>
          </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  inputError: {
    borderColor: "#f44336",
  },
});

export default ChangePassword;
