import React from "react";
import { TextInput, View, Text, StyleSheet } from "react-native";

interface LocationFormProps {
  onDescribeLocationChange: (text: string) => void;
  describeLocation: string;
}

const LocationForm: React.FC<LocationFormProps> = ({ onDescribeLocationChange, describeLocation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Description:</Text>
      <TextInput
        style={styles.input}
        value={describeLocation}
        onChangeText={onDescribeLocationChange}
        placeholder="Enter location description"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
});

export default LocationForm;
