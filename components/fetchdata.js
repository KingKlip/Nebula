 
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../app/firebase"; // Adjust the import path
import { useVideoPlayer, VideoView, useEvent } from "expo-video";
 

const FirestoreExample = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderVideo = ({ item }) => {
    const player = useVideoPlayer(item.video, (player) => {
      player.loop = false;
      player.play();
    });

    const { isPlaying } = useEvent(player, "playingChange", {
      isPlaying: player.playing,
    });

    if (!item.video) {
      return (
        <View style={styles.item}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.errorText}>No video available</Text>
        </View>
      );
    }

    return (
      <View style={styles.item}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.videoContainer}>
          <VideoView
            style={styles.video}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
            nativeControls={false}
          />
          {!isPlaying && <ActivityIndicator style={styles.videoLoader} size="large" color="#0000ff" />}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderVideo}
    />
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  title: {
    fontWeight: "bold",
  },
  video: {
    width: 350,
    height: 275,
  },
  videoContainer: {
    height: 275,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    overflow: "hidden",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    padding: 10, 
  },
  videoLoader: {
    position: "absolute",
    zIndex: 1,
  },
});

export default FirestoreExample;
 