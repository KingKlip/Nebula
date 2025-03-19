import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, Button } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SignUpPage from "../../app/signup";
 
import Icon from 'react-native-vector-icons/Ionicons'; 
import UploadMediaFile from '../../app/post' 
import OptionsMenu from '@/components/features/Menu';
import ProfilePage from '../../app/myprofilepage';
import Homepage from '@/Screens/Home/HomeScreen';
const Tab = createBottomTabNavigator();

  function BottomTabs() {
    return (
   
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown:false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
  
              if (route.name === 'Home') {

                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'person' : 'person-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              } else if (route.name === 'Post') {
                // Icon for Post tab (Circle with a Cross)
                iconName = focused ? 'close-circle' : 'add-circle-outline';  // Filled or outlined cross-circle icon
              }
  
              // Return the icon
              return <Icon name={iconName} size={size} color={color} />;
            

              ;
            },
            tabBarActiveTintColor: 'tomato', // Color for the active tab
            tabBarInactiveTintColor: 'gray', // Color for inactive tabs
          })}
        >
          <Tab.Screen name="Home" component={SignUpPage} />

          <Tab.Screen name="Profile" component={ProfilePage} />
          <Tab.Screen name="Settings" component={Homepage} />
          <Tab.Screen name="Post" component={UploadMediaFile} />
        </Tab.Navigator>
    
    );
  }
  
  export default BottomTabs;
