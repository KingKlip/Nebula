import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import 'react-native-get-random-values'
import React from "react";
import { View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const GooglePlacesAutocompleteScreen = () => {
  const navigation = useNavigation(); // ✅ Get navigation object

  const saveLocationAndContinue = async () => {
    await AsyncStorage.setItem("hasSetLocation", "true");
    navigation.navigate("HomeScreen"); // ✅ Correct navigation usage
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Text>Set Your Location</Text>
      <GooglePlacesAutocomplete
        placeholder="Enter your location"
        query={{
          key: "AIzaSyBjYmDpZDQADF3paqCbu3uAXu3xeeV6qLo", 
          language: "en",
        }}
        onPress={(data, details = null) => {
          saveLocationAndContinue(); 
        }}
      />
    </View>
  );
};

export default GooglePlacesAutocompleteScreen;