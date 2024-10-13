import React from "react";
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import { ViewStyle } from "react-native";

interface ProfileButtonProps extends TouchableOpacityProps {
  title: string;
  buttonStyle?: ViewStyle;
  textStyle?: ViewStyle;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({
  title,
  buttonStyle,
  textStyle,
  ...props
}) => {
  return (
    <TouchableOpacity {...props} className="bg-[#1e5aa0] rounded-full py-2 px-8 mb-2">
      <View className="flex-row items-center space-x-3">
        <Text className="text-white text-md font-psemibold">{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ProfileButton;
