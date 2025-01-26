import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import {getStorage} from 'firebase/storage';
import  AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration object from Firebase Console
const firebaseConfig = {
  apiKey: 
     "AIzaSyCV2gD8uEQCbbANCPTd3e1i10a51GotlGU",
    
  
  authDomain: "flowstate-2ccd4.firebaseapp.com",

  projectId: "flowstate-2ccd4",

  storageBucket: "flowstate-2ccd4.firebasestorage.app",

  messagingSenderId: "711003563965",

  appId: "1:711003563965:android:20070188a7fbd73d5594d4",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage=getStorage(app);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });

export { db, auth, storage };