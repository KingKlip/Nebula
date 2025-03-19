import React, { useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AuthNavigator from "../src/navigation/StackNavigator"; // SignUp and Login
import  BottomTabs from '../src/navigation/BottomTabNavigation'; // Main App Navigation
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase"; // Your Firebase setup
import AsyncStorage from "@react-native-async-storage/async-storage";

import GooglePlacesAutocompleteScreen from "../Screens/Home/SetLocation"


export default function App() {
  const Stack = createStackNavigator();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstLogin, setFirstLogin] = useState(false);

  // Check if the user has set their location before
  useEffect(() => {
    const checkFirstLogin = async () => {
      const hasSetLocation = await AsyncStorage.getItem("hasSetLocation");
      setFirstLogin(hasSetLocation !== "true"); // firstLogin = true if no location is set
    };

    checkFirstLogin();
  }, []);

  // Listen to authentication changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        firstLogin ? (
          <Stack.Screen
            name="SetLocation"
            component={GooglePlacesAutocompleteScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen name="App" component={BottomTabs} />
        )
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}





/*
// Define a Stack Navigator


const HomeScreen = ({ navigation }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Home Screen</Text>
    <Button
      title="Go to Details"
      onPress={() => navigation.navigate('Details')}
    />
  </View>
);

const DetailsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Details Screen</Text>
  </View>
);

export default function App() {
  return (
 
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    
  );
}
*/