import {View,Text,StyleSheet, FlatList, Pressable} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { auth, db } from '../firebase';
import { getDoc, collection, getDocs,doc, onSnapshot, setDoc,} from 'firebase/firestore';
 import {useVideoPlayer,VideoView} from 'expo-video';
 import { useEvent } from 'expo';
  import React, { useState, useEffect} from 'react';
import { Image } from 'react-native';
import { query } from 'firebase/firestore';
import { where } from 'firebase/firestore';
import { useEventListener } from 'expo';
import { ScrollView } from 'react-native';
import { deleteDoc } from 'firebase/firestore';

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
const CreatorProfile = ()=>{

    const { userId } = useLocalSearchParams(); // Get creatorId from URL
    const [userData, setUserData] = useState(null);
    const [uploads, setUploads] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isSubscribed,setIsSubscribed]= useState(false);

    const creatorId= userId

    const subscriberId = auth.currentUser.uid;
    const subscriptionRef= doc(collection(db,"subscriptions"))


  // This useEffect hook checks the subscription status on component load
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      const subscriptionsQuery = query(
        collection(db, "subscriptions"),
        where("subscriberId", "==", subscriberId),
        where("creatorId", "==", userId)
      );

      const querySnapshot = await getDocs(subscriptionsQuery);

      // If there's a matching subscription, set isSubscribed to true
      if (!querySnapshot.empty) {
        setIsSubscribed(true);
      } else {
        setIsSubscribed(false);
      }
    };

    checkSubscriptionStatus();
  }, [userId, subscriberId]); // Runs on component load or when userId or subscriberId changes



    const subscribetoCreator = async () => {
      console.log('Subscribing to creator');
    
      // First, check if the user is already subscribed
      const subscriptionsQuery = query(
        collection(db, "subscriptions"),
        where("subscriberId", "==", subscriberId),
        where("creatorId", "==", userId)
      );
    
      const querySnapshot = await getDocs(subscriptionsQuery);
    
      if (!querySnapshot.empty) {
        console.log('Already subscribed');
        setIsSubscribed(true); // Don't need to subscribe again
        return;
      }
    
      const subscriptionData = {
        creatorId: userId,
        subscriberId: subscriberId,
        subscriptionDate: new Date()
      };
    
      // Create a reference for the new subscription document with auto-generated ID
      const newSubscriptionRef = doc(collection(db, "subscriptions"));
    
      try {
        // Create the subscription document
        await setDoc(newSubscriptionRef, subscriptionData);
    
        // Update the state after successful subscription
        setIsSubscribed(true);
        console.log('Subscription successful');
      } catch (error) {
        console.error('Error subscribing: ', error);
      }
    };

    const UnsubscribeFromCreator = async () => {
      console.log('Unsubscribing from creator');
    
      // Find the subscription document by subscriberId and creatorId
      const subscriptionsQuery = query(
        collection(db, "subscriptions"),
        where("subscriberId", "==", subscriberId),
        where("creatorId", "==", userId)
      );
    
      const querySnapshot = await getDocs(subscriptionsQuery);
    
      if (querySnapshot.empty) {
        console.log('Not subscribed yet');
        return; // No subscription to unsubscribe from
      }
    
      try {
        // If a subscription is found, delete it
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref); // Delete the subscription document
          console.log('Unsubscribed successfully');
        });
    
        // Update the state after successful unsubscription
        setIsSubscribed(false);
      } catch (error) {
        console.error('Error unsubscribing: ', error);
      }
    };
  
    useEffect(() => {
      const fetchUserData = async () => {
        try {
          if (!userId) return; 
          // Fetch user info from "users" collection

          const userDocRef = doc(db, 'users', userId);
          const userSnapshot = await getDoc(userDocRef);
  
          if (userSnapshot.exists()) {
            setUserData(userSnapshot.data());
          } else {
            console.log('User not found');
          }
  
          // Fetch user's uploads from "mediaFiles" collection
          const uploadsQuery = query(
            collection(db, 'posts'),
            where('userId', '==', userId)
          );
  
          const uploadsSnapshot = await getDocs(uploadsQuery);
          const uploadsData = uploadsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          setUploads(uploadsData);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchUserData();
    }, [userId]);
    const renderPost = ({ item }) => {
        return (
          <View style={styles.postContainer}>
            <Text style={styles.postTitle}>{item.title}</Text>
            {item.fileType === 'mp4' || item.fileType === 'mov' ? (
              <VideoPlayerComponent url={item.url} />
            ) : (
              <Image source={{ uri: item.url }} style={styles.postImage} />
            )}
             
          </View>
        );
      };
    if (loading) return <Text>Loading...</Text>;

    return (

        <ScrollView>
        <View  >
          {userData ? (
            <View>
            <View style={styles.bannerContainer} >
            <Image source={{ uri: userData.banner }} style={styles.banner} />
            </View>

            <View style= {styles.avatarContainer}> 
              <Image source={{ uri: userData.avatar }} style={styles.avatar} />
            </View>

              <Text style={styles.username}>{userData.name}</Text>

              <Text style={styles.Location}>{userData.location || 'Location Hidden'}</Text>

              <Text style={styles.bio}>{userData.bio || 'No bio available'}</Text>

              <View style={{alignItems:'center', justifyContent:'center'}}> 

              <Pressable
                onPress={() => {
                  console.log("Button pressed! isSubscribed:", isSubscribed);
                  isSubscribed ? UnsubscribeFromCreator() : subscribetoCreator();
                }} 
              style={styles.subscribe}>
                <Text style={{color:'white'}}>  
                {isSubscribed?"Unsubscribe": "Subscribe"}
                </Text>
              </Pressable>

              </View>

              <View style={{flexDirection:'row',justifyContent:'space-around',paddingTop:'15'}}> 

                
                <Text>
                    Posts
                </Text>

                <Text>
                    Catch Up
                </Text>

                <Text>
                    About
                </Text>

              </View>
              <FlatList
                data={uploads}
                keyExtractor={item => item.id}
                renderItem={renderPost}
                scrollEnabled={false}
                
              />
            </View>
           
          ) : (
            <Text>User not found</Text>
          )}

        
        </View>
        </ScrollView>
      );
}

const styles = StyleSheet.create({
    bannerContainer: {
        width: '100%',
        height: 150,
      },
      banner: {
        width: '100%',
        height: '100%',
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
      username: {
        fontWeight: '500',
        fontSize: 22,
        paddingLeft:12   
      },
      Location:{
        fontSize:16,
        color:'grey',
        fontWeight: '500',
        paddingLeft:12
      },
      bio:{
        padding: 15,
        fontSize:19            
      },
      subscribe:{
       borderRadius:30,
       height:35,       
       marginTop:50,
       width:'60%',
       backgroundColor:'midnightblue',
       alignItems:'center',
       justifyContent:'center',
      },
      postImage: {
        aspectRatio: 2/3,
        marginTop: 10,
        borderRadius: 10,
      }, videoContainer: {
        width: '100%',
        aspectRatio: 16/9,
        marginVertical: 10,
        marginBottom:180
      }, videoPlayer: {
        width: '100%',
        height: 400,
      },postTitle: {
        fontSize: 20,
        padding:12
      },
})

export default CreatorProfile