import React from "react";
import { TouchableOpacity, TouchableOpacityProps, View } from "react-native";
import { ViewStyle } from "react-native";
import { Ionicons } from '@expo/vector-icons';

interface ArchiveButtonProps extends TouchableOpacityProps {
  buttonStyle?: ViewStyle;
  textStyle?: ViewStyle;
}

const ArchiveButton: React.FC<ArchiveButtonProps> = ({
  buttonStyle,
  textStyle,
  ...props
}) => {
  return (
    <TouchableOpacity {...props} className="bg-transparent border border-[#1e5aa0] rounded-md py-2 px-2 mb-2">
      <View className="flex-row items-center space-x-3">
        <Ionicons name="archive-outline" size={12} color="#1e5aa0" />
      </View>
    </TouchableOpacity>
  );
};

export default ArchiveButton;
