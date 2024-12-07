import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, Easing } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

const TabIcon = ({
  name,
  color,
  label,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
  focused: boolean;
}) => {
  return (
    <View className="items-center justify-center gap-1">
      <Ionicons
        name={name}
        size={24}
        color={color}
      />
      <Text
        className={`${focused ? "font-semibold" : "font-regular"} text-xs`}
        style={{ color: color }}
      >
        {label}
      </Text>
    </View>
  );
};

const HeaderIcon = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity onPress={onPress} className="ml-4">
      <Ionicons name="menu" size={28} color="black" />
    </TouchableOpacity>
  );
};

const DropdownMenu = ({ visible }: { visible: boolean }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const router = useRouter(); 

  const handleNavigation = (screenName: string) => {
    router.push(screenName as never); 
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 70,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1, 
          duration: 70,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      className="absolute top-16 left-4 bg-white shadow-lg shadow-black rounded-lg z-50"
      style={{
        width: 120,
        padding: 8,
        opacity: opacity,
        transform: [{ translateY: translateY }],
      }}
    >
      <TouchableOpacity onPress={() => handleNavigation("/profile")}>
        <Text className="font-pmedium text-md py-2">Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleNavigation("/user-settings")}>
        <Text className="font-pmedium text-md py-2">Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleNavigation("/help")}>
        <Text className="font-pmedium text-md py-2">Help</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleNavigation("/feedback")}>
        <Text className="font-pmedium text-md py-2">Feedback</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const TabsLayout = () => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#FFF",
        tabBarInactiveTintColor: "#D4D5D5",
        tabBarStyle: {
          backgroundColor: "#0e4483",
          borderTopWidth: 0,
          height: 65,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Dashboard",
          headerShown: true,
          headerLeft: () => (
            <>
              <DropdownMenu visible={isDropdownVisible} />
              <HeaderIcon onPress={toggleDropdown} />
            </>
          ),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "home" : "home-outline"}
              color={color}
              label="Home"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sst-map"
        options={{
          title: "Sea Surface Temperature Map",
          headerShown: true,
          headerLeft: () => (
            <>
              <DropdownMenu visible={isDropdownVisible} />
              <HeaderIcon onPress={toggleDropdown} />
            </>
          ),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "map" : "map-outline"}
              color={color}
              label="SST Map"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: "Tracker",
          headerShown: true,
          headerLeft: () => (
            <>
              <DropdownMenu visible={isDropdownVisible} />
              <HeaderIcon onPress={toggleDropdown} />
            </>
          ),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "radio" : "radio-outline"}
              color={color}
              label="Tracker"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: true,
          headerLeft: () => (
            <>
              <DropdownMenu visible={isDropdownVisible} />
              <HeaderIcon onPress={toggleDropdown} />
            </>
          ),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "person" : "person-outline"}
              color={color}
              label="Profile"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;