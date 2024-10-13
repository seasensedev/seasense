import React, { useState, useEffect } from "react";
import { SafeAreaView, View, ScrollView, Text, Image, RefreshControl } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import CustomLineChart from "@/components/DailyWaveChart";
import icons from "@/constants/icons";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const Home = () => {
  const [dailyWaveHeights, setDailyWaveHeights] = useState<number[]>([]);
  const [dailyLabels, setDailyLabels] = useState<string[]>([]);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [windSpeed, setWindSpeed] = useState<number | null>(null);
  const [windDirection, setWindDirection] = useState<number | null>(null);
  const [weatherCodes, setWeatherCodes] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dailyTemperatures, setDailyTemperatures] = useState<number[]>([]);
  const [dailyWindSpeeds, setDailyWindSpeeds] = useState<number[]>([]);
  const [dailyWindDirections, setDailyWindDirections] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string | null>(null);

   // Firebase Auth & Firestore

   const auth = getAuth();
  const db = getFirestore();

  const getUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFirstName(data.firstName || "User");
      }
    }
  };

  // Weather API Data Fetch
  const getWeatherData = async () => {
    try {
      const weatherResponse = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=7.0731&longitude=125.6128&current=temperature_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m&daily=weather_code,temperature_2m_max,wind_speed_10m_max,wind_direction_10m_dominant"
      );
      const weatherData = await weatherResponse.json();

      const {
        temperature_2m,
        wind_speed_10m,
        wind_direction_10m,
        weather_code,
      } = weatherData.current;
      const heights = weatherData.daily.temperature_2m_max;
      const times = weatherData.daily.time;
      const temperatures = weatherData.daily.temperature_2m_max;
      const dailyWeatherCodes = weatherData.daily.weather_code;
      const dailyWindSpeeds = weatherData.daily.wind_speed_10m_max || [];
      const dailyWindDirections =
        weatherData.daily.wind_direction_10m_dominant || [];

      setTemperature(temperature_2m);
      setWindSpeed(wind_speed_10m);
      setWindDirection(wind_direction_10m);
      setWeatherCodes(dailyWeatherCodes);
      setDailyWaveHeights(heights);
      setDailyLabels(times);
      setDailyTemperatures(temperatures);
      setDailyWindSpeeds(dailyWindSpeeds.slice(0, 4));
      setDailyWindDirections(dailyWindDirections.slice(0, 4));

      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      setLoading(false);
      setRefreshing(false);
      console.error(error);
    }
  };

  useEffect(() => {
    getUserData();
    getWeatherData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    getWeatherData();
  };

  const weatherIcons: { [key: number]: any; default: any } = {
    0: icons.sunny,
    1: icons.partlyCloudy,
    2: icons.partlyCloudy,
    3: icons.partlyCloudy,
    45: icons.foggy,
    48: icons.foggy,
    51: icons.heavyRain,
    53: icons.heavyRain,
    55: icons.heavyRain,
    61: icons.rainy,
    63: icons.rainy,
    65: icons.rainy,
    80: icons.foggy,
    81: icons.foggy,
    82: icons.foggy,
    95: icons.windy,
    96: icons.windy,
    99: icons.windy,
    default: icons.cloud,
  };

  const getWeatherDescription = (code: number | null) => {
    if (code === null) return "Data Unavailable";
    switch (code) {
      case 0:
        return "Clear Sky";
      case 1:
      case 2:
      case 3:
        return "Partly Cloudy";
      case 45:
      case 48:
        return "Foggy";
      case 51:
      case 53:
      case 55:
        return "Drizzle";
      case 61:
      case 63:
      case 65:
        return "Rainy";
      case 80:
      case 81:
      case 82:
        return "Showers";
      case 95:
      case 96:
      case 99:
        return "Thunderstorm";
      default:
        return "Unknown Weather";
    }
  };

  const getWeatherIcon = (code: number | null) => {
    if (code === null) return weatherIcons.default;
    return weatherIcons[code] || weatherIcons.default;
  };

  const getCustomWeatherPhrase = (description: string) => {
    if (description.includes("Rainy") || description.includes("Showers")) {
      return "Grab an umbrella before heading out!";
    } else if (description.includes("Clear Sky")) {
      return "It's a great day for outdoor activities!";
    } else if (description.includes("Partly Cloudy")) {
      return "It might be a bit cloudy, but still a nice day.";
    } else {
      return "Check the weather before heading out!";
    }
  };

  const getNextDays = () => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date().getDay();
    return Array.from({ length: 5 }, (_, i) => daysOfWeek[(today + i) % 7]);
  };

  const nextDays = getNextDays();

  const calculateRotation = (direction: number) => {
    // Rotation angle calculation based on wind direction
    // 0° is North, 90° is East, 180° is South, 270° is West
    return direction - 180;
  };

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="w-full">
          <Text className="text-black text-2xl font-psemibold pt-4">
            Hello {firstName ? firstName : "User"}!
          </Text>
          <Text className="text-black text-lg font-regular ">
            {loading
              ? "Loading..."
              : getCustomWeatherPhrase(getWeatherDescription(weatherCodes[0]))}
          </Text>

          {/* Weather Forecast */}
          <LinearGradient
            colors={["#4a90e2", "#0e4483"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            locations={[0, 1]}
            style={{ borderRadius: 10, padding: 16, marginTop: 24 }}
          >
            <View className="flex flex-row justify-between">
              <View className="flex-col justify-between">
                <Text className="text-white text-lg mb-2 font-medium">
                  {loading
                    ? "Loading..."
                    : getWeatherDescription(weatherCodes[0])}
                </Text>
                <Text className="text-white text-5xl font-semibold">
                  {loading
                    ? "Loading..."
                    : temperature !== null
                    ? `${temperature}°`
                    : "Data Unavailable"}
                </Text>
                <Text className="text-white text-lg font-semibold">
                  {nextDays[0]}
                </Text>
                <Text className="text-white text-md mb-2 font-regular">
                  {new Date().toLocaleDateString()}
                </Text>
              </View>
              <View className="flex-row justify-between mt-2 space-x-3">
                {nextDays.slice(1).map((day, index) => (
                  <View key={index} className="items-center">
                    <Text className="text-white font-semibold mb-5">{day}</Text>
                    <Image
                      source={
                        loading
                          ? icons.cloud
                          : getWeatherIcon(weatherCodes[index + 1])
                      }
                      className="w-7 h-7"
                      resizeMode="contain"
                    />
                    <Text className="text-white text-md font-medium mt-5">
                      {loading ? "Loading..." : `${dailyTemperatures[index]}°C`}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </LinearGradient>

          {/* Wind Speed */}
          <LinearGradient
            colors={["#4a90e2", "#0e4483"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            locations={[0, 1]}
            style={{
              borderRadius: 10,
              paddingTop: 16,
              paddingBottom: 13,
              paddingLeft: 10,
              paddingRight: 10,
              marginTop: 6,
            }}
          >
            <View className="flex justify-between">
              <View className="flex-row items-center justify-between">
                <View className="ml-2 mr-3">
                  <Image
                    source={icons.wind}
                    className="w-12 h-12"
                    resizeMode="contain"
                    style={{ tintColor: "white" }}
                  />
                </View>
                <View className="flex-row mx-2">
                {nextDays.slice(1, 5).map((day, index) => (
                  <View key={index} className="flex-col items-center mx-4">
                    <Image
                      source={icons.pointer}
                      className="w-6 h-6"
                      resizeMode="contain"
                      style={{
                        tintColor: "white",
                        transform: [
                          {
                            rotate: `${calculateRotation(
                              dailyWindDirections[index]
                            )}deg`,
                          },
                        ],
                      }}
                    />
                    <Text className="text-white text-md mt-2 font-medium">
                      {loading ? "Loading..." : dailyWindSpeeds[index] || "N/A"}
                    </Text>
                    <Text className="text-white text-md mb-2 font-medium">
                      {loading
                        ? "Loading..."
                        : dailyWindDirections[index] || "N/A"}
                      °
                    </Text>
                  </View>
                ))}
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Wave Height Chart */}
          <View className="mt-6">
            <Text className="text-black text-lg font-semibold">
              Wave Heights (Davao City)
            </Text>
            {loading ? (
              <Text>Loading...</Text>
            ) : (
              <CustomLineChart
                dailyWaveHeights={dailyWaveHeights}
                dailyLabels={nextDays}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
