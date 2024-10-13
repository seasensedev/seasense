import React from "react";
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import { ViewStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface EmailButtonProps extends TouchableOpacityProps {
  title: string;
  buttonStyle?: ViewStyle;
  textStyle?: ViewStyle;
}

const EmailButton: React.FC<EmailButtonProps> = ({
  title,
  buttonStyle,
  textStyle,
  ...props
}) => {
  return (
    <TouchableOpacity {...props} className="bg-white rounded-full py-3 px-16 mb-2">
      <View className="flex-row items-center space-x-3">
        <MaterialIcons name="email" size={24} color="#0e4483" />
        <Text className="text-[#0e4483] text-lg font-semibold">{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default EmailButton;
