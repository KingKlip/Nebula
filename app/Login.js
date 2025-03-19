import { signInWithEmailAndPassword } from 'firebase/auth';
import {View, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native'
import { useState } from 'react';
import { auth } from './firebase'; // Your Firebase configuration fil
import { useNavigation} from '@react-navigation/native';
import { getAuth } from 'firebase/auth';

const LoginPage = () => {
  const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
     
const loginUser = async (email,password) => {
  try {
    const auth = getAuth()
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const idToken = await user.getIdToken();

    console.log('User ID token:', idToken);
    console.log('User logged in:', userCredential.user);
     
  } catch (error) {
    console.error('Login error:', error.message);
  }
}

  return ( 
    <View style={{backgroundColor: 'white', flex:1}}>
    <View style={styles.container}>
    <View style={styles.welcome}> 
        <Text style={{fontSize:40}}>
          Log in to account
        </Text>
    </View>

         
    <View style={{paddingBottom:20}}>  
          <TextInput placeholder="Email" 
          style={styles.input}
          value={email} 
          onChangeText={(text)=> setEmail(text)}/> 
    </View>

    <View style={{paddingBottom:20}}>

        <TextInput placeholder="Password"
         style={styles.input} 
         secureTextEntry={true}
         value={password}
         onChangeText={(text)=>setPassword(text)}
         
         /> 
     </View>

<View style={styles.buttonContainer}> 
<TouchableOpacity style={styles.customButton}  onPress={() => loginUser(email, password, navigation)}>
          <Text style={styles.buttonText}>Login</Text>
</TouchableOpacity>

</View>


</View>
 
</View>     

    
    )




}

const styles= StyleSheet.create({

    container: {
        marginHorizontal : 40,
        marginVertical: 70,
         
         
        
    },

    welcome:{
         paddingTop: 80,
        alignItems : 'center',
        paddingBottom: 50,
    },

  buttonContainer: {
    alignItems: "center",
     // Centers the button horizontally
  },

  customButton: {
    height: 50,
    width: 150,
    backgroundColor: "midnightblue",
    justifyContent: "center", // Centers text vertically
    alignItems: "center", // Centers text horizontally
    borderRadius: 10,
    
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10, // Adds padding inside the input
    backgroundColor: "#f9f9f9", // Light background for the input
    fontSize: 16, // Sets a readable font size
},

})
export default LoginPage