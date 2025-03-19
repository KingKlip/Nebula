import React, {  useEffect, useRef,useState } from 'react';
import { useEventListener } from 'expo';
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  FlatList,
  Image,
  Alert,
  Platform,
  Dimensions,
  ToastAndroid,
} from 'react-native';
import UserProfile from '../components/features/userProfileHeader';
import UserPosts from '../components/fetchUserPosts';
import { auth, db } from './firebase';
import {updateDoc, getDoc, doc, onSnapshot, setDoc, collection} from 'firebase/firestore';
 import {useVideoPlayer,VideoView} from 'expo-video';
 import { useEvent } from 'expo';
 import { query, where } from 'firebase/firestore';
 import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
 

 const useInputHandler = (initialValue, fieldName) => {
  const [value, setValue] = useState(initialValue);
  const [showButtons, setShowButtons] = useState(false);

  // Update value when initialValue changes (important for Firestore data)
  useEffect(() => {
    console.log(`Updating ${fieldName} state:`, initialValue); // Debugging line
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (text, isUserInput = true) => {
    setValue(text);
    if (isUserInput) {
      setShowButtons(text.trim() !== '');
    }
  };

  const handleFocus = () => setShowButtons(true);

  const handleBlur = () => {
    if (value.trim() === '') setShowButtons(false);
  };

  const handleCancel = () => {
    setValue(initialValue); // Reset to last saved value
    setShowButtons(false);
  };

  const handleSubmit = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User is not logged in');
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, { [fieldName]: value }, { merge: true });
      ToastAndroid.show(`${fieldName} updated successfully`, ToastAndroid.SHORT);
      setShowButtons(false);
    } catch (error) {
      console.error(`Error updating ${fieldName}:`, error);
      ToastAndroid.show(`Failed to update ${fieldName}`, ToastAndroid.SHORT);
    }
  };

  return {
    value,
    showButtons,
    handleChange,
    handleFocus,
    handleBlur,
    handleCancel,
    handleSubmit,
  };
};

const VideoPlayerComponent = ({ url }) => {
  const [playbackStatus, setPlaybackStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

   const videoPlayer = useVideoPlayer(url,player => {
    player.loop = true;
    player.muted= true
    player.play();
    
  });

  // Add direct event listener for more detailed debugging
  useEventListener(videoPlayer, 'statusChange', (event) => {
    
    if (event.status) {
      setPlaybackStatus(event.status);
      setIsLoading(false);
    }
    if (event.error) {
      console.error('Status change error:', event.error);
      setError(event.error);
      setIsLoading(false);
    }
  });

  // Add event listener for loading state
  useEventListener(videoPlayer, 'load', () => {
    console.log('Video load event received');
    setIsLoading(false);
  });

  // Update local state when status changes
  useEffect(() => {
    // Log when the component mounts with the URL
    console.log('VideoPlayerComponent mounted with URL:', url);
    
    // Verify the video player initialization
    if (videoPlayer) {
      console.log('Video player initialized:', videoPlayer);
    } else {
      console.error('Video player failed to initialize');
    }
    return () => {
      console.log('VideoPlayerComponent unmounting');
    };
  }, [url, videoPlayer]);

  return (
    <View style={styles.videoContainer}>
      <VideoView
        style={styles.videoPlayer}
        player={videoPlayer}
        showControls={true}
        allowsFullscreen={true}
        allowsPictureInPicture={true}
         
        contentFit="contain"
        onError={(error) => {
          console.error('Video loading error:', error);
          setError(error);
          setIsLoading(false);
        }}
        onLoad={() => {
          console.log('Video loaded successfully');
          setIsLoading(false);
        }}
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text>Loading video...</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading video: {error.message}</Text>
        </View>
      )}
    </View>
  );
};


const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const locationInput = useInputHandler(userData?.location || '', 'location');
  const bioInput = useInputHandler('', 'bio');
  const [posts, setPosts] = useState([]);
  
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
          const data = userDoc.data();
          setUserData(data);
   
          locationInput.handleChange(data.location || '', false);
           
          bioInput.handleChange(data.bio || '', false);
        } else {
          console.error("User document does not exist.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  
    fetchUserData();
  }, [auth.currentUser]);
  
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error("No userId found, skipping Firestore subscription.");
      return;
    }

      
    console.log("Current User ID:", auth.currentUser?.uid);
    console.log("Current User Auth Status:", auth.currentUser);
  
    const postsRef = query(collection(db, "posts"), where("userId", "==", userId));
    const unsubscribe = onSnapshot(
      postsRef,
      (snapshot) => {
        const updatedPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(updatedPosts);
        console.log('Posts updated in real-time:', updatedPosts);
      },
      (error) => {
        console.error('Error fetching posts in real-time:', error);
      }
    );
  
    return () => unsubscribe(); // Cleanup listener on unmount
  }, [auth.currentUser]); // 👈 Runs when user logs in or changes

  
  const handleLocationSelect = async (data, details) => {
    console.log("Location selected:", details); // Debugging line
  
    if (details) {
      const selectedLocation = details.formatted_address;
      console.log("Formatted Address:", selectedLocation); // Debugging line
  
      locationInput.handleChange(selectedLocation, true);
  
      // Update Firebase with new location
      try {
        const userId = auth.currentUser?.uid;
        console.log("User ID:", userId); // Debugging line
  
        if (userId) {
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, { location: selectedLocation });
          console.log("Location updated successfully in Firestore");
        }
      } catch (error) {
        console.error("Error updating location:", error);
      }
    } else {
      console.error("Details object is null");
    }
  };
 
    const renderPost = ({ item }) => {
      return (
        <View style={styles.postContainer}>
          <Text style={styles.postTitle}>{item.title}</Text>
          {item.fileType === 'mp4' || item.fileType === 'video' ? (
            <VideoPlayerComponent url={item.url} />
          ) : (
            <Image source={{ uri: item.url }} style={styles.postImage} />
          )}
           
        </View>
      );
    };



    

  return (
    <ScrollView 
    keyboardShouldPersistTaps='handled' 
    contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={{backgroundColor:'white'}}>
        <UserProfile />

        {userData && (
        <Text style={styles.username}>
          {userData.name}
        </Text>
       )}  
       </View>
      
      <View
        style={[
          styles.inputContainer,
          locationInput.showButtons  && styles.inputContainerWithButtons,
        ]}
      > 
         <GooglePlacesAutocomplete
        placeholder="Enter Location"
        fetchDetails={true}
        onPress={(data, details = null) => {
          console.log("Autocomplete Data:", data);
          console.log("Autocomplete Details:", details);
          handleLocationSelect(data, details);
        }}
        query={{
          key: "AIzaSyBjYmDpZDQADF3paqCbu3uAXu3xeeV6qLo",
          language: 'en',
        }}
        styles={{
          textInput: styles.Locinput,
          listView: styles.listView,
        }}
        textInputProps={{
          value: locationInput.value,
           onChangeText: (text) => locationInput.handleChange(text, true),
        }}
        disableScroll={true}  

        
      />

 
        {locationInput.showButtons && (
          <View style={styles.buttonContainer}>
            <Pressable style={styles.button} onPress={locationInput.handleCancel}>
              <Text style={{color:'blue'}}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={locationInput.handleSubmit}>
              <Text style={{color:'blue'}}>Submit</Text>
            </Pressable>
          </View>
        )}
      </View>

        <View
        style={[
          styles.inputContainer,
          bioInput.showButtons && styles.inputContainerWithButtons,
        ]}
      >
        <TextInput
          
          placeholder="Bio"
          multiline
          value={bioInput.value}
          style={[styles.input, styles.bioInput]} // Apply additional styles for Bio
          onChangeText={bioInput.handleChange}
          onFocus={bioInput.handleFocus}
          onBlur={bioInput.handleBlur}
        />

       
        {bioInput.showButtons && (
          <View style={styles.buttonContainer}>
            <Pressable style={styles.button} onPress={bioInput.handleCancel}>
              <Text style={{color:'blue'}}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={bioInput.handleSubmit}>
              <Text style={{color:'blue'}}>Submit</Text>
            </Pressable>
          </View>
        )}
      </View>
     

        <View style={{alignItems:'center'}}>
        <Text style={styles.new}>Posts</Text>
        </View>
      </View>

      {/* Posts Section */ }
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.postsList}
        ListEmptyComponent={<Text style={styles.noPostsText}>No posts yet. Start uploading!</Text>}
        scrollEnabled={false} // Disable FlatList scrolling to allow ScrollView to handle it
      />

      {/* Fetch posts*/ }
      <UserPosts onFetchPosts={setPosts} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  
  videoContainer: {
    width: '100%',
    aspectRatio: 16/9,
    marginVertical: 10,
    marginBottom:180
  },
  videoPlayer: {
    width: '90%',
    height: 400,
  },
LocationContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 10,
  },
  Locationinput:{
    fontSize:16,
    maxWidth: '90%', 
    color:'grey',
    fontWeight: '500'
  }, 
  listView: {
    backgroundColor: '#fff',
  },
BioContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 10,
  },
  bioInput: {
    backgroundColor: 'white',   // White background for the TextInput
    padding: 10,
    borderRadius: 8,
    textAlignVertical: 'top',   // Ensure text starts at the top
    minHeight: 100,             // Set a fixed minimum height for the Bio input
    maxHeight: 200, 
    lineHeight:20,
    fontSize:19         // Prevent the input from growing indefinitely
  },
  inputContainerWithButtons: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
     justifyContent: 'flex-end',
     flexShrink: 0, 
  },
  inputContainer: {
 
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  button: {
     
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
    borderRadius: 4,
  },
  username: {
    fontWeight: '500',
    fontSize: 22,
    paddingLeft:12
    
   
  },
  header: {
    marginBottom: 10,
    
  },
  input: {
    fontSize: 18,
    marginBottom: 3,
    padding:10,
    maxWidth: '90%', 
    flex:1
  },
  new: {
    fontSize: 22,
    fontWeight: '700',
    color: 'grey',
    marginTop: 15,
   
  },
  postsList: {
    paddingHorizontal: 5,
    paddingBottom: 150
  },
  postContainer: {
    marginBottom: 20,
  },
  postTitle: {
    fontSize: 20,
    padding:12
  },
  postDescription: {
    fontSize: 14,
    color: 'gray',
  },
  postImage: {
    aspectRatio: 2/3,
    marginTop: 10,
    borderRadius: 10,
  },
  noPostsText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
});

export default ProfilePage;


  /*
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [showLocationButtons, setShowLocationButtons] = useState(false);
  const [showBioButtons, setShowBioButtons] = useState(false);

  const userId = auth.currentUser?.uid;
  
    // Handlers for Location input
    const handleLocationChange = (text) => {
      setLocation(text);
      setShowLocationButtons(text !== '');
    };
  
    const handleLocationFocus = () => setShowLocationButtons(true);
  
    const handleLocationBlur = () => {
      if (location === '') setShowLocationButtons(false);
    };
  
    const handleLocationCancel = () => {
      setLocation('');
      setShowLocationButtons(false);
    };
  
    const handleLocationSubmit = async () => {
        const userRef = doc(db, 'users', userId);
        await  setDoc(userRef,{location},{merge:true}) 
      
      setShowLocationButtons(false);
    };
  
    // Handlers for Bio input
    const handleBioChange = (text) => {
      setBio(text);
      setShowBioButtons(text !== '');
    };
  
    const handleBioFocus = () => setShowBioButtons(true);
  
    const handleBioBlur = () => {
      if (bio === '') setShowBioButtons(false);
    };
  
    const handleBioCancel = () => {
      setBio('');
      setShowBioButtons(false);
    };
  
    const handleBioSubmit = async () => {
      // Add submission logic for bio
    const userRef = doc(db, 'users', userId);
    await  setDoc(userRef,{bio},{merge:true});
    setShowBioButtons(false);
    };
*/



/*

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
*/
 