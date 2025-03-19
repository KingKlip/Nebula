import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { getDoc, doc, getDocs } from "firebase/firestore";
import { db } from './firebase';
import Geolocation from 'react-native-geolocation-service';
import { query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { where } from 'firebase/firestore';
 
import haversine from 'haversine';
 import { collection } from 'firebase/firestore';
import { auth } from './firebase';
import { Platform } from 'react-native';


let MapView, Marker;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
} 
 
 
const fetchCoordinatesFromAddress = async (address) => {
  try {
    const apiKey = "AIzaSyBjYmDpZDQADF3paqCbu3uAXu3xeeV6qLo";  
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      console.error("Geocoding failed:", data);
      return null;
    }

    const location = data.results[0]?.geometry?.location;
    return location ? { latitude: location.lat, longitude: location.lng } : null;
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
};

const getUserProfileLocation = async (userId) => {
  try {
    const userId = auth.currentUser?.uid;

    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error(`User not found: ${userId}`);
      return null;
    }

    const userData = userDoc.data();
    console.log("User data:", userData);

    if (!userData.location) {
      console.error("User location not found in Firestore");
      return null;
    }

    // Convert address to coordinates
    console.log("Fetching coordinates for:", userData.location);
    const coordinates = await fetchCoordinatesFromAddress(userData.location);

    if (!coordinates) {
      console.error("Failed to convert address to coordinates.");
      return null;
    }

    console.log("User coordinates:", coordinates);
    return coordinates;
  } catch (error) {
    console.error("Error fetching user profile location:", error);
    return null;
  }
};

const getTrainers = async () => {
  try {
    console.log("Fetching trainers...");

    const locationQuery = query(collection(db, "users"), where("HasPosted", "==", true));
    const snapshot = await getDocs(locationQuery);

    if (snapshot.empty) {
      console.warn("No trainers found.");
      return [];
    }

    const trainers = await Promise.all(snapshot.docs.map(async (doc) => {
      const trainerData = doc.data();

      // Convert address to coordinates
      const coordinates = await fetchCoordinatesFromAddress(trainerData.location);

      return {
        id: doc.id,
        name: trainerData.name,
        location: coordinates, // Now trainers have { latitude, longitude }
        avatar:trainerData.avatar
      };
    }));

    console.log("Trainers with coordinates:", trainers);
    return trainers.filter(trainer => trainer.location); // Remove any null locations
  } catch (error) {
    console.error("Error fetching trainers:", error);
    return [];
  }
};
 

  const findNearestTrainers = async (userLocation) => {
    const trainers = await getTrainers(); // Fetch trainers dynamically

    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      console.error('User location is invalid');
      return [];
    }

     
    return trainers
    .filter(trainer => trainer.location && trainer.location.latitude && trainer.location.longitude) // Only include trainers with valid locations
    .map(trainer => ({
      ...trainer,
      distance: haversine(userLocation, trainer.location, { unit: 'km' }).toFixed(2)
    }))
    .sort((a, b) => a.distance - b.distance);
};

  const TrainerMap = ({ userId }) => {
    if (Platform.OS === 'web') {
      return null; // or render a fallback component
    }
    const [userLocation, setUserLocation] = useState(null);
    const [nearestTrainers, setNearestTrainers] = useState([]);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          console.log('Fetching user profile location...');
          const profileLocation = await getUserProfileLocation(userId);
          console.log('User profile location:', profileLocation);
    
          if (!profileLocation || !profileLocation.latitude || !profileLocation.longitude) {
            console.error('Invalid profile location:', profileLocation);
            return;
          }
    
          setUserLocation(profileLocation);
    
          console.log('Fetching trainers...');
          const trainersNearby = await findNearestTrainers(profileLocation);
          console.log('Nearest trainers:', trainersNearby);
    
          setNearestTrainers(trainersNearby);
        } catch (error) {
          console.error('Error fetching trainers:', error);
        }
      };
    
      fetchData();
    }, [userId]);
    
    return (
        <View style={styles.container}>
          
          {/* Map View */}
          
         
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: userLocation?.latitude || 37.7749,
              longitude: userLocation?.longitude || -122.4194,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1
            }}
          >
            {/* User Marker */}
            {userLocation && (
              <Marker coordinate={userLocation} title="You" pinColor="blue" />
            )}
    
            {/* Trainer Markers */}
            {nearestTrainers.map(trainer => (
              <Marker
                key={trainer.id}
                coordinate={trainer.location}
                title={trainer.name} 
                description={`${trainer.distance} km away`}
                >
                <Image
                source={{ uri: trainer.avatar }}
                style={{ width: 40, height: 40, borderRadius: 20 }} // Circular avatar        
                
                />
              </Marker>
            ))}
          </MapView>
          
    
          {/* Trainer List */}
          <FlatList
            data={nearestTrainers}
            keyExtractor={item => item.id}
            style={styles.list}
            renderItem={({ item }) => (
              <View style={styles.trainerCard}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />

                <Text style={styles.trainerName}>{item.name}</Text>
                <Text style={styles.trainerDistance}>{item.distance} km away</Text>
              </View>
            )}
          />
        </View>
      );
    };
    
  
    const styles = StyleSheet.create({
      container: { flex: 1 },
      map: { flex: 0.7},
      list: { flex:0.3,backgroundColor: 'white', padding: 10 },
      trainerCard: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#ddd'
      },
      trainerName: {
        fontSize: 18,
        fontWeight: 'bold'
      },
      avatar: {
        width: '50',
        height: '55',
        borderRadius: 50,
      },
      trainerDistance: {
        fontSize: 16,
        color: 'gray'
      }
    });
    
export default TrainerMap


  