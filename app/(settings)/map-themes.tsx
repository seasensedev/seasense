import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { useMapTheme } from '../../context/MapThemeContext';
import { MapTheme, mapThemes } from '../../constants/mapStyles';

const MapThemesScreen = () => {
  const router = useRouter();
  const { currentTheme, setMapTheme } = useMapTheme();

  const themeDescriptions = {
    default: 'Standard Google Maps style',
    lunar: 'Lunar theme with dark background',
    modest: 'Dark theme with blue water',
    muted: 'An unobtrusive blue design theme',
    silver: 'Light gray theme',
    retro: 'Vintage style with muted colors',
  };

  const handleThemeSelect = async (theme: MapTheme) => {
    await setMapTheme(theme);
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-white pt-10">
      <View className="p-4">
        <Text className="text-gray-600 mb-4">
          Select your preferred map style. This will be applied across all maps in the app.
        </Text>

        {(Object.keys(mapThemes) as MapTheme[]).map((theme) => (
          <TouchableOpacity
            key={theme}
            onPress={() => handleThemeSelect(theme)}
            className={`p-4 mb-3 rounded-lg border ${
              currentTheme === theme
                ? 'border-[#4F8EF7] bg-[#4F8EF7]/10'
                : 'border-gray-200'
            }`}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className={`text-base font-psemibold ${
                  currentTheme === theme ? 'text-[#4F8EF7]' : 'text-black'
                }`}>
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  {themeDescriptions[theme]}
                </Text>
              </View>
              {currentTheme === theme && (
                <AntDesign name="check" size={24} color="#4F8EF7" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default MapThemesScreen;
