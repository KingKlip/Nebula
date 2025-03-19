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
import {useVideoPlayer,VideoView} from 'expo-video';
import { Dimensions } from "react-native"


const screenWidth = Dimensions.get('window').width; 

const UploadMediaFile=()=>{

const [hasposted,setHasPosted]= useState(false);
    
const [media, setMedia] = useState(null); // Stores the selected media file's URI
const [mediaType, setMediaType] = useState(""); // Tracks if it's an image or video
const [title,setTitle]=useState('')
const[description,setDescription]=useState('')
const [uploading,setUploading]=useState(false);

const user = auth.currentUser; 
const postRef = doc(collection(db, "posts")); // Generate a unique post ID
const postId = postRef.id; // Extract the ID

const videoPlayer = useVideoPlayer(mediaType === "video" ? media : null, (player) => {
  if (player) {
    player.loop = true;
    player.play();
  }
}); 

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

const pickMedia=async()=>{
    let result= await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        aspect: mediaType === 'images' ? [4, 3] : undefined,
        quality: 1,

    });

    if (!result.canceled){
      const selectedFile = result.assets[0];
      setMedia(selectedFile.uri);
      setMediaType(selectedFile.type); // "image" or "video"
    }
};

const uploadMedia=async()=>{

  if (!media) {
    Alert.alert("No media selected", "Please select an image or video to upload.");
    return;
  }

      if (!title || !description) {
        Alert.alert("Missing Information", "Please provide both a title and description.");
        return;
      }

    setUploading(true);

   try {
    const {uri}=await FileSystem.getInfoAsync(media);
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

    

    const filename = media.substring(media.lastIndexOf("/") + 1);
    const fileType = filename.split(".").pop().toLowerCase();

    const formData = new FormData();
    formData.append("file", {
      uri: media,
      type: mediaType === "image" ? `image/${fileType}` : `video/${fileType}`,
      name: filename
    });

    formData.append("title", title);
    formData.append("description", description);
    console.log("FormData created:", formData);

    const user = auth.currentUser;
    if (user){
    const idToken = await user.getIdToken();

    console.log("Uploading to server...");

    const response = await fetch("http://192.168.68.101:5000/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${idToken}`,
      },
      body: formData,
    });

    console.log("Server Response:", response);

    const data = await response.json();
    if (data.success) {
      // Video and preview uploaded, metadata saved
      Alert.alert("Success", "Post uploaded successfully!");
      setMedia(null);
      setTitle("");
      setDescription("");
    } else {
      Alert.alert("Upload failed", "An error occurred during upload.");
    }
  }else {
      Alert.alert("User not authenticated", "Please log in to upload content.");
    }
  }
      catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Upload failed", "An error occurred while uploading. " );
      
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
    
    <FontAwesome onPress= {pickMedia} name="image" size={24} color="black" style={{paddingBottom:10}} />
    </View>

    {media && mediaType === "image" && (
        <Image source={{ uri: media }} style={{ width: "100%", aspectRatio: 4/3 }} />
      )}
      {media && mediaType === "video" && videoPlayer && (
        <View style={styles.contentContainer}>
        <VideoView
         style={{ 
          width: "100%",
          height: 400,
          }}
          player={videoPlayer}
          allowsFullscreen
          allowsPictureInPicture
        />
        </View>
      )}

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
    },
    
    contentContainer: {
       
      width:'100%', 
       
      justifyContent: 'center',
      
    },

})


export default UploadMediaFile 

    /*
     


    const storageRef = ref(storage, `posts/${postId}/${filename}`);

    await uploadBytes(storageRef,blob)
    await saveImageToFirestore('posts', storageRef);
          console.log('post uploaded successfully!');

    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { HasPosted: true });
    setHasPosted(true); // Update local state
    blob.close(); // Close the blob after uploading

    

      // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

     // Collect metadata
     const metadata = {
        userId: user.uid,
        postId,
        filename,
        fileType,
        url: downloadURL,
        timestamp: serverTimestamp(), // Server-generated timestamp
        title,
        description,
    
      };

      await setDoc(postRef, metadata); // Store post directly in "posts" collection

      Alert.alert("Success", "Post uploaded successfully!");
      setMedia(null);
      setTitle("");
      setDescription("");

      */