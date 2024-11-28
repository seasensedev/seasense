import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

export default function Help() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I get started?",
      answer: "To get started, create an account and complete your profile setup. You can then access all features of the app."
    },
    {
      question: "What features are available?",
      answer: "Our app offers real-time monitoring, data visualization, weather updates, and more."
    },
    {
      question: "How can I contact support?",
      answer: "You can reach our support team through the feedback form or email us at support@seasense.com"
    }
  ];

  return (
    <ScrollView className="flex-1 bg-white p-5 pt-10">
      <Text className="text-2xl font-bold mb-6">Help Center</Text>

      <View className="mb-6">
        <Text className="text-xl font-semibold mb-4">Frequently Asked Questions</Text>
        {faqs.map((faq, index) => (
          <TouchableOpacity
            key={index}
            className="bg-gray-100 rounded-lg mb-2 p-4"
            onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
          >
            <View className="flex-row justify-between items-center">
              <Text className="font-medium text-base flex-1">{faq.question}</Text>
              <AntDesign 
                name={expandedIndex === index ? "minus" : "plus"} 
                size={20} 
                color="#4F8EF7" 
              />
            </View>
            {expandedIndex === index && (
              <Text className="mt-2 text-gray-600">{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View className="bg-gray-100 rounded-lg p-4">
        <Text className="text-xl font-semibold mb-3">Need More Help?</Text>
        <Text className="text-gray-600 mb-4">
          If you can't find what you're looking for, our support team is here to help.
        </Text>
        <View className="space-y-2">
          <Text className="text-base">
            <Text className="font-medium">Email: </Text>
            support@seasense.com
          </Text>
          <Text className="text-base">
            <Text className="font-medium">Hours: </Text>
            Monday - Friday, 9:00 AM - 5:00 PM EST
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
