import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, TouchableOpacity, Animated, Easing } from "react-native";
import { Tabs, useRouter } from "expo-router"; 
import icons from "../../constants/icons";

const TabIcon = ({
  icon,
  color,
  name,
  focused,
}: {
  icon: any;
  color: string;
  name: string;
  focused: boolean;
}) => {
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

const HeaderIcon = ({ icon, onPress }: { icon: any; onPress: () => void }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Image
        source={icon}
        resizeMode="contain"
        className="w-7 h-7 ml-4"
        style={{ tintColor: "black" }}
      />
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
      className="absolute top-16 left-4 bg-white shadow-lg border border-black/20 rounded-lg z-50"
      style={{
        width: 120,
        padding: 8,
        opacity: opacity,
        transform: [{ translateY: translateY }],
      }}
    >
      <TouchableOpacity onPress={() => handleNavigation("/profile")}>
        <Text className="font-pregular text-md py-2">Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleNavigation("/user-settings")}>
        <Text className="font-pregular text-md py-2">Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleNavigation("/help")}>
        <Text className="font-pregular text-md py-2">Help</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleNavigation("/feedback")}>
        <Text className="font-pregular text-md py-2">Feedback</Text>
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
              <HeaderIcon icon={icons.menu} onPress={toggleDropdown} />
            </>
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
          title: "Sea Surface Temperature Map",
          headerShown: true,
          headerLeft: () => (
            <>
              <DropdownMenu visible={isDropdownVisible} />
              <HeaderIcon icon={icons.menu} onPress={toggleDropdown} />
            </>
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
        name="tracker"
        options={{
          title: "Tracker",
          headerShown: true,
          headerLeft: () => (
            <>
              <DropdownMenu visible={isDropdownVisible} />
              <HeaderIcon icon={icons.menu} onPress={toggleDropdown} />
            </>
          ),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={icons.radar}
              color={color}
              name="Tracker"
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
              <HeaderIcon icon={icons.menu} onPress={toggleDropdown} />
            </>
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
