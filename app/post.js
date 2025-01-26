import { View, Text, StyleSheet,Alert,Image,TouchableOpacity, TextInput } from "react-native"
import React from 'react'
import * as ImagePicker from 'expo-image-picker'
import {db, storage } from "./firebase"
import * as FileSystem from 'expo-file-system'
import { useState } from "react"
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { uploadBytes, ref, getDownloadURL } from "firebase/storage"
import { addDoc, collection, serverTimestamp, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";; // Import Firestore functions
import { auth} from './firebase';
 


const UploadMediaFile=()=>{

    
const[image, setImage]=useState(null);
const [title,setTitle]=useState('')
const[description,setDescription]=useState('')
const [uploading,setUploading]=useState(false);
const user = auth.currentUser; 
const postRef = doc(collection(db, "posts")); // Generate a unique post ID
const postId = postRef.id; // Extract the ID

 const saveImageToFirestore = async (field, storageRef) => {
    try {
      const downloadUrl = await getDownloadURL(storageRef);
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { [field]: downloadUrl });
      console.log(`${field} URL saved to Firestore.`);
    } catch (error) {
      console.error(`Error saving ${field} URL to Firestore:`, error);
    }
  };

const pickImage=async()=>{
    let result= await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,

    });

    if (!result.canceled){
        setImage(result.assets[0].uri);
    }
};

const uploadMedia=async()=>{

    if (!image) {
        Alert.alert("No image selected", "Please select an image to upload.");
        return;
      }

      if (!title || !description) {
        Alert.alert("Missing Information", "Please provide both a title and description.");
        return;
      }

    setUploading(true);

   try {
    const {uri}=await FileSystem.getInfoAsync(image);
    const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload=()=>{
            resolve(xhr.response);
        };
        xhr.onerror=(e)=>{
            reject(new TypeError('Network request Failed'));

        };
        xhr.responseType='blob'
        xhr.open('GET',uri,true);
        xhr.send(null);

    })

    const filename= image.substring(image.lastIndexOf('/')+1);
    const fileType = filename.split(".").pop().toLowerCase();

    const storageRef = ref(storage, `users/${user.uid}/posts/${postId}/${filename}`);;

    await uploadBytes(storageRef,blob)
    await saveImageToFirestore('posts', storageRef);
          console.log('post uploaded successfully!');
    blob.close(); // Close the blob after uploading

      // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

     // Collect metadata
     const metadata = {
        userId: user.uid,
        postId,
        filename,
        fileType: filename.split(".").pop(), // Extract file type (extension)
        url: downloadURL,
        timestamp: serverTimestamp(), // Server-generated timestamp
        title,
        description
      };

      await addDoc(collection(db, "mediaFiles"), metadata);
      Alert.alert("Success", "Post uploaded successfully!");
      setImage(null);
      setTitle("");
      setDescription("");

   } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Upload failed", "An error occurred while uploading.");
    }finally {
        setUploading(false);
      }
    
};

return(

    <View>
    <TextInput placeholder='Post title' value={title} onChangeText={setTitle} style={{paddingBottom:20, 
        fontSize:22}}
        autoCorrect={false}/>

    
    <TextInput placeholder='Enter description' value={description} onChangeText={setDescription} style={{fontSize: 16,
    paddingBottom:20,
    minHeight:80}}
    multiline
    
    autoCorrect={false}/>


    <View style={{padding:12}}>
    
    <FontAwesome onPress= {pickImage} name="image" size={24} color="black" style={{paddingBottom:10}} />
    </View>

    {image &&<Image src={image} style= {{width:'100%', aspectRatio :1}} />}



    <View style={{justifyContent:'center', alignItems:'center'}}>
        <TouchableOpacity style={styles.uploadButton} onPress={uploadMedia}>
        <Text style={styles.buttontext}>
        {uploading ? "Uploading..." : "Post"}  
        </Text>
             
    </TouchableOpacity>
    </View>

    

 </View>


)
}
const styles= StyleSheet.create({
   
    uploadButton:{
        borderRadius:20,
        marginVertical:20,
        width:90,
        height:40,
        backgroundColor:'midnightblue',
        alignItems:'center',
        justifyContent:'center',
    },

    buttontext:{
        fontSize:12,
        color:'white',
        alignItems:'center',
        justifyContent:'center',
        

    },
    imageContainer:{
        marginTop :30,
        marginBottom:50,
        alignItems: 'center',
    }
})


export default UploadMediaFile 
