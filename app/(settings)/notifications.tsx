import React, { useState, useEffect } from 'react';
import { View, Text, Switch, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const NotificationSettings = () => {
  const [weatherNotifications, setWeatherNotifications] = useState(false);
  const [waveNotifications, setWaveNotifications] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const weatherEnabled = await AsyncStorage.getItem('weatherNotifications');
      const waveEnabled = await AsyncStorage.getItem('waveNotifications');
      
      setWeatherNotifications(weatherEnabled === 'true');
      setWaveNotifications(waveEnabled === 'true');
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const toggleWeatherNotifications = async (value: boolean) => {
    try {
      if (value) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
      }
      
      await AsyncStorage.setItem('weatherNotifications', value.toString());
      setWeatherNotifications(value);
    } catch (error) {
      console.error('Error toggling weather notifications:', error);
    }
  };

  const toggleWaveNotifications = async (value: boolean) => {
    try {
      if (value) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
      }
      
      await AsyncStorage.setItem('waveNotifications', value.toString());
      setWaveNotifications(value);
    } catch (error) {
      console.error('Error toggling wave notifications:', error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-5">
      
      <View className="bg-gray-100 rounded-lg p-4 mb-4 mt-10">
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-lg font-medium mb-1">Weather Alerts</Text>
            <Text className="text-gray-600 text-sm">
              Get notified about severe weather conditions
            </Text>
          </View>
          <Switch
            value={weatherNotifications}
            onValueChange={toggleWeatherNotifications}
            trackColor={{ false: '#767577', true: '#4a90e2' }}
          />
        </View>
      </View>

      <View className="bg-gray-100 rounded-lg p-4">
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-lg font-medium mb-1">Wave Conditions</Text>
            <Text className="text-gray-600 text-sm">
              Get notified about significant wave changes
            </Text>
          </View>
          <Switch
            value={waveNotifications}
            onValueChange={toggleWaveNotifications}
            trackColor={{ false: '#767577', true: '#4a90e2' }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default NotificationSettings;
