import { View, Text, StyleSheet, Image, FlatList, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { auth, db } from "../app/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const UserPosts = ({ onFetchPosts }) => {
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchUserPosts = async () => {
        try {
          const user = auth.currentUser; // Get the currently authenticated user
          if (!user) return; // Ensure user is authenticated
          setLoading(true);
  
          // Query Firestore for posts belonging to the current user
          const postsRef = collection(db, 'mediaFiles');
          const q = query(postsRef, where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
  
          // Map through the results
          const fetchedPosts = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          onFetchPosts(fetchedPosts); // Pass posts data back to parent
        } catch (error) {
          console.error('Error fetching posts:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchUserPosts();
    }, [onFetchPosts]);
  
    return loading ? (
      <ActivityIndicator size="large" color="#0000ff" />
    ) : null; // Only show loading spinner and offload rendering to parent
  };
  
  export default UserPosts;


/*

const UserPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = auth.currentUser; // Get the currently authenticated user


    const fetchUserPosts = async () => {
        try {
          if (!user) return; // Ensure user is authenticated
          setLoading(true);
    
          // Query Firestore for posts belonging to the current user
          const postsRef = collection(db, "mediaFiles");
          const q = query(postsRef, where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);
    
          // Map through the results and set posts state
          const fetchedPosts = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
    
          setPosts(fetchedPosts);
        } catch (error) {
          console.error("Error fetching posts:", error);
        } finally {
          setLoading(false);
        }
      };
    
      useEffect(() => {
        fetchUserPosts(); // Fetch posts on component mount
      }, []);

      const renderPost = ({ item }) => (
        <View style={styles.postContainer}>
         <Text style={styles.postTitle}>{item.title}</Text>   
          {item.fileType === "mp4" || item.fileType === "mov" ? (
            <Text style={styles.placeholderText}>Video file: {item.title}</Text> // You can replace this with a video player
          ) : (
            <Image source={{ uri: item.url }} style={styles.postImage} />
          )}
          
          <Text style={styles.postDescription}>{item.description}</Text>
        </View>
      );


  return (
    <View style={styles.container}>
     
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : posts.length > 0 ? (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={styles.postsList}
        />
      ) : (
        <Text style={styles.noPostsText}>No posts yet. Start uploading!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
     
    backgroundColor: "#f9f9f9",
  },
 
  postsList: {
    paddingBottom: 20,
  },
  postContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    padding: 10,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  postDescription: {
    fontSize: 14,
    color: "#555",
  },
  noPostsText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginVertical: 10,
  },
});

export default UserPosts*/