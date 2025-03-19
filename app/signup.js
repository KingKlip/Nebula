import {View, TextInput ,Text, StyleSheet} from "react-native"
import { TouchableOpacity } from "react-native"
import { useState } from "react";
import React from 'react'
import { db} from "./firebase.js";
import { createUserWithEmailAndPassword} from '@firebase/auth'
import {auth} from  "./firebase.js";
import { Link } from "expo-router";
import { setDoc,doc } from "firebase/firestore";


    const SignUpPage=() =>{
        const [name, setName] = useState("");
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [address, setAdress] = useState("")
            
            const handleSignUp = async () => {
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const user= userCredential.user;
              
                   await setDoc(doc(db, "users", user.uid), {
                        name: name,
                        email: email,
                    });
                    alert("Account created successfully!");
                    console.log("User Created:", userCredential.user);
                    setName(''),
                    setEmail(''),
                    setPassword('')
                } catch (error) {
                    
                    console.error("Error during sign-up:", error);
                }
            };
        


    return(
     <View style={{backgroundColor: 'white', flex:1}}>
    <View style={styles.container}>
    <View style={styles.welcome}> 
        <Text style={{fontSize:40}}>
           Create account
        </Text>
    </View>
    

    <View style={{paddingBottom:20}}>

        <TextInput placeholder="Name" 
        style={styles.input}
         value={name}
         onChangeText = {(text)=> setName(text)}
         /> 
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
<TouchableOpacity style={styles.customButton} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign up</Text>
</TouchableOpacity>

</View>

<View style={{paddingTop: 15}}>
    <Text>
        Already have an account?  <Link href={`Login`}>Login</Link>
   </Text>
    
</View>
</View>
 
</View>      
    
  
    )
}

const styles= StyleSheet.create({

    container: {
        marginHorizontal : 40,
        marginVertical: 10,
               
    },

    welcome:{
         paddingTop: 80,
        alignItems : 'center',
        paddingBottom: 50,
    },

  buttonContainer: {
    alignItems: "center",
     // Centers the button horizontally
     paddingTop:70
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
export default SignUpPage
 