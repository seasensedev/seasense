import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Tabs } from 'expo-router';
import icons from '../../constants/icons';

const TabIcon = ({ icon, color, name, focused }: { icon: any, color: string, name: string, focused: boolean }) => {
  return (
    <View className="items-center justify-center gap-1">
      <Image
        source={icon}
        resizeMode="contain"
        style={{ tintColor: color }}
        className="w-6 h-6"
      />
      <Text
        className={`${focused ? "font-semibold" : "font-regular"} text-xs`}
        style={{ color: color }}
      >
        {name}
      </Text>
    </View>
  );
};

const HeaderIcon = ({ icon, onPress }: { icon: any, onPress: () => void }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Image
        source={icon}
        resizeMode="contain"
        className="w-7 h-7 ml-4"
        style={{ tintColor: 'black' }}
      />
    </TouchableOpacity>
  );
};

const TabsLayout = () => {
  return (
    <Tabs screenOptions={{ 
      tabBarShowLabel: false,
      tabBarActiveTintColor: '#FFF',
      tabBarInactiveTintColor: '#D4D5D5',
      tabBarStyle: {
        backgroundColor: '#0e4483',
        borderTopWidth: 0,
        height: 65,
      },
    }}>
      <Tabs.Screen 
        name="home" 
        options={{
          title: 'Dashboard',
          headerShown: true,
          headerLeft: () => (
            <HeaderIcon 
              icon={icons.menu}
              onPress={() => console.log('Settings Pressed')}
            />
            
          ),
          
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              icon={icons.home}
              color={color}
              name="Home"
              focused={focused}
            />
          ),
        }} 
      />
      <Tabs.Screen 
        name="sst-map" 
        options={{
          title: 'Sea Surface Temperature Map',
          headerShown: true,
          headerLeft: () => (
            <HeaderIcon 
              icon={icons.menu}
              onPress={() => console.log('Settings Pressed')}
            />
          ),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              icon={icons.map}
              color={color}
              name="SST Map"
              focused={focused}
            />
          ),
        }} 
      />
      <Tabs.Screen 
        name="sonar" 
        options={{
          title: 'Sonar Data',
          headerShown: true,
          headerLeft: () => (
            <HeaderIcon 
              icon={icons.menu}
              onPress={() => console.log('Settings Pressed')}
            />
          ),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              icon={icons.radar}
              color={color}
              name="Sonar Data"
              focused={focused}
            />
          ),
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: 'Profile',
          headerShown: true,
          headerLeft: () => (
            <HeaderIcon 
              icon={icons.menu}
              onPress={() => console.log('Settings Pressed')}
            />
            
          ),
          
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              icon={icons.profile}
              color={color}
              name="Profile"
              focused={focused}
            />
          ),
        }} 
      />
    </Tabs>
   
  );
};

export default TabsLayout;
