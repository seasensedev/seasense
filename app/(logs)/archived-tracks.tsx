import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { collection, query, getDocs, doc, deleteDoc, addDoc, where, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { logTrackingData } from '../../utils/dataLogger';

interface ArchivedTrack {
  id: string;
  location?: {
    details?: {
      city?: string;
    };
  };
  archivedAt: string;
  userId: string;
  routeCoordinates: Array<{ latitude: number; longitude: number }>;
  elapsedTime: number;
  temperature?: number;
  timestamp: {
    date: string;
    time: string;
  };
  pinnedLocations?: Array<{
    latitude: number;
    longitude: number;
    timestamp: number;
  }>;
  isHidden?: boolean;
}

export default function ArchivedTracks() {
  const [archivedTracks, setArchivedTracks] = useState<ArchivedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (auth.currentUser?.isAnonymous) {
      setLoading(false);
      Alert.alert(
        "Guest Account",
        "Create an account to access archived tracks. Guest accounts cannot view or restore archived tracks.",
        [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );
      return;
    }

    loadArchivedTracks();
  }, []);

  const loadArchivedTracks = async () => {
    try {
      if (!auth.currentUser || auth.currentUser.isAnonymous) {
        setLoading(false);
        setArchivedTracks([]);
        return;
      }

      const q = query(
        collection(db, 'archived_tracks'),
        where('userId', '==', auth.currentUser.uid),
        where('isArchived', '==', true),
        where('isHidden', '==', false)  
      );
      
      const querySnapshot = await getDocs(q);
      const tracks: ArchivedTrack[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId === auth.currentUser?.uid) {
          tracks.push({
            id: doc.id,
            ...data,
          } as ArchivedTrack);
        }
      });
      
      tracks.sort((a, b) => 
        new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime()
      );
      
      setArchivedTracks(tracks);
    } catch (error) {
      console.error("Error loading archived tracks:", error);
      Alert.alert("Error", "Failed to load archived tracks");
      setArchivedTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (track: ArchivedTrack) => {
    if (!auth.currentUser || auth.currentUser.isAnonymous || 
        track.userId !== auth.currentUser.uid) {
      Alert.alert("Error", "You don't have permission to restore this track");
      return;
    }
    
    setRestoring(true);
    try {
      const { id, archivedAt, ...trackData } = track;
      
      // Create restored document
      const restoredDoc = await addDoc(collection(db, 'tracking_data'), {
        ...trackData,
        userId: auth.currentUser.uid,
        restoredAt: new Date().toISOString(),
        restoredBy: auth.currentUser.uid,
        isRestored: true
      });

      // Log the restore action
      await logTrackingData({
        userId: auth.currentUser.uid,
        action: 'restore',
        timestamp: Date.now(),
        trackId: track.id,
        originalData: track,
        details: {
          location: {
            city: track.location?.details?.city,
            coordinates: track.routeCoordinates[0]
          },
          temperature: track.temperature,
          elapsedTime: track.elapsedTime,
          pinnedLocations: track.pinnedLocations?.length
        }
      });

      await deleteDoc(doc(db, 'archived_tracks', track.id));
      
      Alert.alert(
        "Success", 
        "Track restored successfully",
        [{ text: "OK", onPress: () => loadArchivedTracks() }]
      );
    } catch (error) {
      console.error("Error restoring track:", error);
      Alert.alert("Error", "Failed to restore track");
    } finally {
      setRestoring(false);
    }
  };

  const handleHideTrack = async (track: ArchivedTrack) => {
    if (!auth.currentUser || auth.currentUser.isAnonymous || 
        track.userId !== auth.currentUser.uid) {
      Alert.alert("Error", "You don't have permission to delete this track");
      return;
    }

    try {
      const trackRef = doc(db, 'archived_tracks', track.id);
      
      // Update the document to mark it as hidden instead of deleting it
      await updateDoc(trackRef, {
        isHidden: true,
        hiddenAt: new Date().toISOString(),
        hiddenBy: auth.currentUser.uid
      });

      // Refresh the tracks list
      await loadArchivedTracks();
      
      Alert.alert("Success", "Track removed from your archive");
    } catch (error) {
      console.error("Error hiding track:", error);
      Alert.alert("Error", "Failed to remove track");
    }
  };

  if (auth.currentUser?.isAnonymous) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Ionicons name="archive-outline" size={48} color="#666" />
        <Text className="text-gray-600 mt-4 text-center px-4">
          Create an account to access archived tracks
        </Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#1e5aa0" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-pbold mb-4">Archived Tracks</Text>
        
        {archivedTracks.length === 0 ? (
          <View className="flex-1 justify-center items-center py-8">
            <Ionicons name="archive-outline" size={48} color="#666" />
            <Text className="text-gray-600 mt-4 text-center">
              No archived tracks found
            </Text>
          </View>
        ) : (
          archivedTracks.map((track) => (
            <View key={track.id} className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-pbold text-lg">
                  {track.location?.details?.city || 'Unknown Location'}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {new Date(track.archivedAt).toLocaleDateString()}
                </Text>
              </View>
              
              <View className="flex-row justify-between mt-3">
                <TouchableOpacity
                  className="bg-[#1e5aa0] rounded-full py-2 px-4 flex-1 mr-2"
                  onPress={() => handleRestore(track)}
                  disabled={restoring}
                >
                  <Text className="text-white text-center font-pmedium">
                    {restoring ? 'Restoring...' : 'Restore Track'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="bg-red-600 rounded-full py-2 px-4 flex-1 ml-2"
                  onPress={() => {
                    Alert.alert(
                      "Remove Track",
                      "Are you sure you want to remove this track from your archive?",
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Remove", style: "destructive", onPress: () => handleHideTrack(track) }
                      ]
                    );
                  }}
                >
                  <Text className="text-white text-center font-pmedium">
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
