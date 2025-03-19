import {View, Text, StyleSheet, TouchableOpacity} from 'react-native'
import { useState } from 'react';
import Entypo from '@expo/vector-icons/Entypo';
import { Link, router } from 'expo-router';
 


const OptionsMenu=()=>{

const [menuVisible, setMenuVisible]= useState(false)

const toggleMenu=()=>{
    setMenuVisible(!menuVisible)

}

const MenuOptions=()=>{
    if (!menuVisible) return null;  //Don't render the menu if it's not visible
   


    return (
        <View style={styles.menuContainer}>
            <Text style={styles.menuOption}> <Link href="FindInstructor"> Find Instructor</Link> </Text>
            <Text style={styles.menuOption}> My Subscriptions</Text>
            <Text style={styles.menuOption}> Playlists</Text>
            <Text style={styles.menuOption}> Notifications</Text>
            <Text style={styles.menuOption}> Categories</Text>
        </View>
    )
};


    return(

<View>
      {/* Top Bar */}
      <View>
        <TouchableOpacity onPress={toggleMenu}>
          <Entypo name="menu" size={30} color="black" />
        </TouchableOpacity>
      
      </View>
    

      {/* Menu Options */}
      <MenuOptions />
    </View>
  );
};
const styles = StyleSheet.create({
   
    menuContainer: {
    
      marginTop: 10,
      position:'absolute',
      top: 50, // Adjust based on where you want it to appear
      left:0,
     
      width:250,
      padding: 15,
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      elevation: 5, // Shadow for Android
      shadowColor: '#000', // Shadow for iOS
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 5,
      zIndex: 10, // Ensure it appears above other contentc
    },
    menuOption: {
      marginVertical: 5,
      fontSize: 16,
    },
    overlay: {
    position: 'absolute', // Covers the entire screen
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    zIndex: 5, // Below the menu but above other content
  },
  });
export default OptionsMenu