import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  FlatList,Image,
  Dimensions,
} from 'react-native';
import UserProfile from '../components/features/userProfileHeader';
import UserPosts from '../components/fetchUserPosts';
import { auth, db } from './firebase';
import { getDoc, doc } from 'firebase/firestore';
import CustomInputArea from '../components/features/uploadbuttons'
 

const { height } = Dimensions.get('window');

const ProfilePage = () => {
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [posts, setPosts] = useState([]);

  const [userData, setUserData] = useState(null);
  
 


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          console.error('User is not logged in');
          return;
        }

        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);


  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <Text style={styles.postTitle}>{item.title}</Text>
      {item.fileType === 'mp4' || item.fileType === 'mov' ? (
        <Text style={styles.placeholderText}>
          Video file: {item.title}
        </Text> // Replace with a video player if needed
      ) : (
        <Image source={{ uri: item.url }} style={styles.postImage} />
      )}
      <Text style={styles.postDescription}>{item.description}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <UserProfile />

        {userData && (
        <Text style={styles.username}>
          {userData.name}
        </Text>
       )}  
       
        <TextInput
          placeholder="Location"
          value={location}
          style={styles.input}
          onChangeText={(text) => setLocation(text)}
        />
         <TextInput
          placeholder="Bio"
          multiline
          value={bio}
          style={styles.input}
          onChangeText={(text) => setBio(text)}
        />

        <View style={{alignItems:'center'}}>
        <Text style={styles.new}>Posts</Text>
        </View>
      </View>

      {/* Posts Section */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.postsList}
        ListEmptyComponent={<Text style={styles.noPostsText}>No posts yet. Start uploading!</Text>}
        scrollEnabled={false} // Disable FlatList scrolling to allow ScrollView to handle it
      />

      {/* Fetch posts */}
      <UserPosts onFetchPosts={setPosts} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
     
    backgroundColor: 'white',
  },
  username: {
    fontWeight: '500',
    fontSize: 20,
    marginBottom: 10,
    padding:10
  },
  header: {
    marginBottom: 10,
  },
  input: {
    fontSize: 18,
    marginBottom: 10,
    padding:15
  },
  new: {
    fontSize: 22,
    fontWeight: '700',
    color: 'grey',
    marginTop: 30,
   
  },
  postsList: {
    paddingHorizontal: 5,
  },
  postContainer: {
    marginBottom: 20,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  postDescription: {
    fontSize: 14,
    color: 'gray',
  },
  postImage: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
  noPostsText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
});

export default CustomInputArea;



/*import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';
import UserProfile from '../components/features/userProfileHeader';
import UserPosts from '../components/fetchUserPosts';
import { auth, db } from './firebase';
import { getDoc, doc } from 'firebase/firestore';

const { height } = Dimensions.get('window');

const ProfilePage = () => {
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          console.error('User is not logged in');
          return;
        }

        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Header component for Bio, Location, etc.
  const renderHeader = () => (
    <View style={{backgroundColor:'white'}} >
      <UserProfile />

      {userData && (
        <Text style={styles.username}>
          {userData.name}
        </Text>
      )}

      
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={(text) => setLocation(text)}
      />

<TextInput
        placeholder="Bio"
        multiline
        value={bio}
        style={styles.input}
        onChangeText={(text) => setBio(text)}
      />


       
     <View style={{alignItems:'center'}}>
      <Text style={styles.new}>
        Posts
      </Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={[]} // Empty data for posts handled in UserPosts
      ListHeaderComponent={renderHeader} // Add header for user info
      ListFooterComponent={<UserPosts />} // Add UserPosts as a footer
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={true}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    fontSize: 18,
    marginBottom: 30,
    padding:15
  },
  new: {
    fontSize: 22,
    fontWeight: '700',
    color: 'grey',
    marginTop: 15,
   
    

  },
  username: {
    fontWeight: '500',
    fontSize: 20,
    marginBottom: 10,
    padding:15
  },
});

export default ProfilePage;








/*
import {View, Text,StyleSheet, ScrollView, TextInput} from 'react-native'
import UserProfile from  '../components/features/userProfileHeader'
import Entypo from '@expo/vector-icons/Entypo';
import React,{useEffect, useState} from 'react';
import { db} from './firebase';
import { getDoc,doc } from 'firebase/firestore';
import { auth} from './firebase';
import UserPosts from '../components/fetchUserPosts';
import { Dimensions } from 'react-native';
const { height } = Dimensions.get('window');







const  ProfilePage=()=>{



const [location, setLocation]=useState('');
const [bio,setBio]=useState('');
const [userData, setUserData] = useState(null);

useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = auth.currentUser?.uid; // Get the current user's ID
        if (!userId) {
          console.error('User is not logged in');
          return;
        }

        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setUserData(userDoc.data()); // Store the data in state
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);






return(
    <ScrollView 
    contentContainerStyle={{flexGrow: 1}}
    keyboardShouldPersistTaps='handled'
    showsVerticalScrollIndicator={true}
  >
    
    <View style={{flex:1, backgroundColor:'white'}}>
    
    <View style={{height: height * 0.2}}> {/* 20% of screen height }
  <UserProfile />
     </View>

    <View style={{height: height * 0.8,
        marginLeft:15,
        justifyContent:'space-evenly',  
        fontSize:18,}}>
    {userData && (
    <Text style={styles.username}>
            {userData.name}
    </Text>
    )}

    <TextInput placeholder='Bio'
    multiline
    value= {bio} 
    style={styles.input}
     onChangeText={(text) => setBio(text) } />

    <TextInput style={styles.input}
   
    placeholder='Location' value= {location}
     onChangeText={(text) => setLocation(text) } />
      

    

    <Text style={styles.input}>
        Location visibility
    </Text>

    <Text style={styles.new}>
      Posts
    </Text>

    </View>

   <UserPosts/>
    

    </View>
   </ScrollView>
)


 }

 const styles = StyleSheet.create({
    Text:{
       marginLeft:15,
        justifyContent:'space-evenly',
        
        fontSize:18,
        

    },
    input:{
        fontSize:18,
    },
    new:{
        fontSize:20,
        fontWeight:700,
        color:'grey',
    },
    username:{
fontWeight:'500',
fontSize:20
    }

 })

 export default ProfilePage 
 
*/





 