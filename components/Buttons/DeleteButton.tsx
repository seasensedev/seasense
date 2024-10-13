import React from "react";
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import { ViewStyle } from "react-native";

interface DeleteButtonProps extends TouchableOpacityProps {
  title: string;
  buttonStyle?: ViewStyle;
  textStyle?: ViewStyle;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({
  title,
  buttonStyle,
  textStyle,
  ...props
}) => {
  return (
    <TouchableOpacity {...props} className="bg-transparent rounded-full py-2 items-center mb-2 border border-red-600">
      <View className="flex-row items-center">
        <Text className="text-red-600 text-lg font-medium">{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default DeleteButton;
