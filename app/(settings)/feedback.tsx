import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

export default function Feedback() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    type: 'general',
    message: ''
  });

  const handleSubmit = () => {
    if (!formData.email || !formData.message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    // Handle submission logic here
    Alert.alert('Success', 'Feedback submitted successfully');
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-white p-5 pt-10">

      <Text className="text-2xl font-bold mb-6">Send Feedback</Text>

      <View className="space-y-4">
        <View>
          <Text className="text-base mb-2 text-gray-700">Email</Text>
          <TextInput
            className="p-4 bg-gray-100 rounded-lg"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            keyboardType="email-address"
          />
        </View>

        <View>
          <Text className="text-base mb-2 text-gray-700">Feedback Type</Text>
          <View className="bg-gray-100 rounded-lg">
            <Picker
              selectedValue={formData.type}
              onValueChange={(value) => setFormData({...formData, type: value})}
            >
              <Picker.Item label="General" value="general" />
              <Picker.Item label="Bug Report" value="bug" />
              <Picker.Item label="Feature Request" value="feature" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>
        </View>

        <View>
          <Text className="text-base mb-2 text-gray-700">Message</Text>
          <TextInput
            className="p-4 bg-gray-100 rounded-lg h-32"
            placeholder="Enter your feedback"
            value={formData.message}
            onChangeText={(text) => setFormData({...formData, message: text})}
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-blue-500 p-4 rounded-lg mt-4"
        >
          <Text className="text-white text-center text-lg font-semibold">
            Submit Feedback
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
