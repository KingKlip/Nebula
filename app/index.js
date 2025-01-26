import React, { useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AuthNavigator from "../src/navigation/StackNavigator"; // SignUp and Login
import  BottomTabs from '../src/navigation/BottomTabNavigation'; // Main App Navigation
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase"; // Your Firebase setup

export default function App() {
  const Stack = createStackNavigator();
  const [user, setUser] = useState(null); // Track authentication state
  const [loading, setLoading] = useState(true);

  // Listen to authentication changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Finish loading when the auth state is resolved
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  if (loading) {
    return null; // Optionally show a loading spinner while checking auth
  }

 
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="App" component={BottomTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};





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