import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Image } from "react-native";
import Collapsible from "react-native-collapsible";
import icons from "../../constants/icons"; // Adjust path as needed

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqData = [
    {
      question: "What is this app about?",
      answer: "This app helps you track and log your activities efficiently.",
    },
    {
      question: "How do I reset my password?",
      answer: "Go to the settings page, and click on 'Reset Password'.",
    },
    {
      question: "Is this app free?",
      answer: "Yes, the app is free with optional premium features.",
    },
  ];

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <SafeAreaView className="flex-1 p-4 bg-white">
      <View className="mt-12">
        <Text className="text-xl text-primary font-pbold mb-4">Frequently Asked Questions</Text>
        {faqData.map((item, index) => (
          <View key={index}>
            <TouchableOpacity
              onPress={() => toggleAccordion(index)}
              className="bg-gray-100 p-4 rounded-lg mb-2 shadow flex-row justify-between items-center"
            >
              <Text className="text-lg font-medium flex-1">{item.question}</Text>
              <Image
                source={icons.down}
                className="w-4 h-4"
                style={{
                  transform: [{ rotate: activeIndex === index ? '180deg' : '0deg' }],
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <Collapsible collapsed={activeIndex !== index}>
              <View className="bg-gray-200 p-4 rounded-lg mb-4">
                <Text className="text-base font-regular text-gray-700">{item.answer}</Text>
              </View>
            </Collapsible>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}