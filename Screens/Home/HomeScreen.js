import {View,  Text, StyleSheet, Image, FlatList} from 'react-native'
import { SearchBar } from '@rneui/themed';
import { VideoView,useVideoPlayer } from 'expo-video'; 
 import { useEventListener } from 'expo';
import React, { useState, useEffect } from 'react';
import { db } from '@/app/firebase';
import { documentId, collection, getDocs, query,where, orderBy, limit } from 'firebase/firestore';
import AntDesign from '@expo/vector-icons/AntDesign';
import OptionsMenu from '@/components/features/Menu';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, useLocalSearchParams } from 'expo-router';
import { Route } from 'expo-router/build/Route';

const VideoPlayerComponent = React.memo(({ url }) => {
  const [playerState, setPlayerState] = useState({
    playbackStatus: {},
    isLoading: true,
    error: null
  });

  const videoPlayer = useVideoPlayer(url, player => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  useEventListener(videoPlayer, 'statusChange', (event) => {
    if (event.status) {
      setPlayerState(prev => ({
        ...prev,
        playbackStatus: event.status,
        isLoading: false
      }));
    }
    if (event.error) {
      setPlayerState(prev => ({
        ...prev,
        error: event.error,
        isLoading: false
      }));
    }
  });

  useEffect(() => {
    return () => {
      // Cleanup event listeners
      videoPlayer?.removeAllEventListeners?.();
    };
  }, [videoPlayer]);

  const { isLoading, error } = playerState;

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
          setPlayerState(prev => ({
            ...prev,
            error,
            isLoading: false
          }));
        }}
        onLoad={() => {
          setPlayerState(prev => ({
            ...prev,
            isLoading: false
          }));
        }}
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text>Loading video...</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error loading video: {error.message}
          </Text>
        </View>
      )}
    </View>
  );
});

const PostItem = React.memo(({ item }) => (
  <View style={styles.postContainer}>
    <Text style={styles.postTitle}>{item.title}</Text>
    {item.fileType === 'mp4' || item.fileType === 'mov' ? (
      <VideoPlayerComponent url={item.url} />
    ) : (
      <Image source={{ uri: item.url }} style={styles.postImage} />
    )}
  </View>
));

const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostsWithUsernamesAndAvatars = async () => {
      try {
        console.log("Fetching posts from mediaFiles...");

        const mediaRef = collection(db, "posts");
        const userRef = collection(db, "users");
        console.log("userRef:", userRef);

        // Step 1: Fetch media posts
        const mediaQuery = query(mediaRef, orderBy("timestamp", "desc"), limit(10));
        const mediaSnapshot = await getDocs(mediaQuery);

        const mediaData = mediaSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched mediaData:", mediaData);

        // Step 2: Extract unique userIds
        const userIds = [...new Set(mediaData.map(post => post.userId))];

        if (userIds.length === 0) {
          console.log("No user IDs found.");
          setPosts(mediaData);
          return;
        }

        console.log('userIds:', userIds)

        // Step 3: Fetch user details (userName and avatar) in batches (Firestore limit = 10)
        let userData = {};
        for (let i = 0; i < userIds.length; i += 10) {
          const batchUserIds = userIds.slice(i, i + 10);
          console.log(`Fetching users for userIds: ${batchUserIds}`)

          const userQuery = query(userRef, where(documentId(), "in", batchUserIds));
          const userSnapshot = await getDocs(userQuery);
          console.log(`userSnapshot size for batch ${i}:`, userSnapshot.size);

          userSnapshot.docs.forEach(doc => {
            const user = doc.data();
            console.log("User data from Firestore:", user); // Log each user data to debug
            userData[doc.id] = {  // Use doc.id since it's the userId in your case
              name: user.name,
              avatar: user.avatar,
            };
          });
        }

        console.log("Fetched userData:", userData);

        // Step 4: Merge user names and avatars with media posts
        const combinedData = mediaData.map(post => ({
          ...post,
          name: userData[post.userId]?.name,
          avatar: userData[post.userId]?.avatar || null,  // Handle avatar fallback
        }));

        setPosts(combinedData);
      } catch (err) {
        console.error("Error fetching posts with usernames and avatars:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPostsWithUsernamesAndAvatars();
  }, []);

  return { posts, loading, error };
}; // Empty array ensures the effect runs once when the component mounts

 

const Homepage=()=>{
  const { posts, loading, error } = usePosts();
  const [liked, setLiked] = useState(false);
 

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading posts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading posts: {error.message}</Text>
      </View>
    );
  }

  return (
    <ScrollView>
    <View style={{flex:1}}>
    <View style={{padding:12}}>
    
    <OptionsMenu />
    </View>
    <View style={{alignItems:'center'}} >
    
    <SearchBar
    placeholder="Search"
    fontColor="#c6c6c6"
    iconColor="#c6c6c6"
    //shadowColor="transparent"
    cancelIconColor="#c6c6c6"
    backgroundColor="white"
    containerStyle={{
      justifyContent:'center',
      alignItems:'center',
      width: '90%', // Ensures it takes up full width
      borderRadius: 20,
      padding: 0, // Removes unwanted padding
    }}
    inputContainerStyle={{
      backgroundColor: 'white', // Matches background
      borderRadius: 20,
     
       
    }}
  />
     </View>

    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>  (
          <View style={styles.postContainer}>
            <PostItem item={item} />
            
            {/* Display userName and avatar below each post */}
            <Link href={`/CreatorProfile/${item.userId}`}>
            <View style={styles.userInfo}>

              <Image 
                source={{ uri: item.avatar }} 
                style={styles.avatar} 
              />
              

             <Text style={styles.userName}>{item.name}</Text>
             </View>
             </Link>

             

            </View>
          
          )}
        contentContainerStyle={styles.postsList}
        scrollEnabled={false}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={3}
        removeClippedSubviews={true}
      />
    </View>
    </View>
    </ScrollView>
  );
};

/*
<View style ={styles.likebutton} >

<Pressable onPress={() => setLiked((isLiked) => !isLiked)}>
<MaterialCommunityIcons
name={liked ? "heart" : "heart-outline"}
size={32}
color={liked ? "red" : "black"}
/>
</Pressable>

</View>
*/
const styles= StyleSheet.create({
likebutton:{
marginLeft:170
},
 userInfo:{
  flexDirection:'row',
  padding:8,
  alignItems:'center'
 },
 avatar:{
  width: 50,
  height: 50,
  borderRadius: 50,
   
 },
 userName:{
fontSize:16,
paddingLeft:8
 },
  videoContainer: {
    width: '100%',
    aspectRatio: 16/9,
    marginVertical: 10,
    marginBottom:180
  },
  videoPlayer: {
    width: '100%',
    height: 400,
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
  padding:12,
  fontWeight:500
},
postImage: {
  aspectRatio: 2/3,
  marginTop: 10,
  borderRadius: 10,
},
loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
errorContainer: {
  padding: 20,
},
errorText: {
  color: 'red',
}
})

export default Homepage