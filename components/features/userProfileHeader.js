import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from "firebase/auth";
import { db } from '@/app/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const UserProfile = () => {
  const [avatar, setAvatar] = useState(null);
  const [banner, setBanner] = useState(null);

  const storage = getStorage();
  const auth = getAuth();
  const user = auth.currentUser; // Initialize Firebase Storage

  // Function to upload the image to Firebase Storage
  const uploadImageToBlob = async (imageUri) => {
    try {
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = (e) => reject(new TypeError('Network request failed'));
        xhr.responseType = 'blob';
        xhr.open('GET', imageUri, true);
        xhr.send(null);
      });
      return blob;
    } catch (error) {
      console.error('Error converting image to blob:', error);
      return null;
    }
  };

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

  // Function to pick and upload avatar
  const pickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:  ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setAvatar(imageUri);

        const blob = await uploadImageToBlob(imageUri);
        if (blob) {
          const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
          const avatarRef = ref(storage, `users/${user.uid}/avatars/${filename}`);
          await uploadBytes(avatarRef, blob);
          await saveImageToFirestore('avatar', avatarRef);
          console.log('Avatar uploaded successfully!');
        }
      }
    } catch (error) {
      console.error('Error picking avatar:', error);
    }
  };

  // Function to pick and upload banner
  const pickBanner = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setBanner(imageUri);

        const blob = await uploadImageToBlob(imageUri);
        if (blob) {
          const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
          const bannerRef = ref(storage, `users/${user.uid}/banners/${filename}`);
          await uploadBytes(bannerRef, blob);
          await saveImageToFirestore('banner', bannerRef);

          console.log('Banner uploaded successfully!');
        }
      }
    } catch (error) {
      console.error('Error picking banner:', error);
    }
  }; 

  const fetchUserProfile = async () => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setAvatar(userData.avatar);
        setBanner(userData.banner);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };
  useEffect(() => {
    if (user) fetchUserProfile();
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Banner Section */}
      <TouchableOpacity onPress={pickBanner} style={styles.bannerContainer}>
        {banner ? (
          <Image source={{ uri: banner }} style={styles.banner} />
        ) : (
          <View style={[styles.banner, styles.defaultBanner]}>
            <Text style={styles.bannerText}>Pick a Banner</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Avatar Section */}
      <TouchableOpacity onPress={pickAvatar} style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.defaultAvatar]}>
            <Text style={styles.avatarText}>Pick Avatar</Text>
          </View>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'white',
     
    },
    bannerContainer: {
      width: '100%',
      height: 150,
    },
    banner: {
      width: '100%',
      height: '100%',
    },
    defaultBanner: {
      backgroundColor: 'gainsboro',
      justifyContent: 'center',
      alignItems: 'center',
    },
    bannerText: {
      color: 'white',
      fontSize: 16,
    },
    avatarContainer: {
      marginTop: -50, // Position the avatar on top of the banner
      width: 100,
      height: 100,
      borderRadius: 50,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: 'white',
      marginLeft:15
      
    },
    avatar: {
      width: '100%',
      height: '100%',
      borderRadius: 50,
    },
    defaultAvatar: {
      backgroundColor: 'lightgray',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: 'gray',
      fontSize: 14,
    },
    userInfo: {
      marginTop: 20,
      alignItems: 'center',
    },
    username: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    userBio: {
      fontSize: 14,
      color: 'gray',
      marginTop: 5,
    },
  })

  export default UserProfile;