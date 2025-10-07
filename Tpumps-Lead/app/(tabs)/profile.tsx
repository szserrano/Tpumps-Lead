import { Image } from 'expo-image';
import { Platform, StyleSheet, TouchableOpacity, Alert } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, router, useFocusEffect } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useEffect, useState, useCallback } from 'react';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      console.log(user);
      if (!user) return;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      console.log(docSnap.data());

      if(docSnap.exists()) {
        setProfile(docSnap.data());
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch profile data when component mounts
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Refetch profile data when screen comes into focus (e.g., returning from edit screen)
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  if (loading) {
    return <ThemedText>Loading...</ThemedText>;
  }
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="person.fill"
          style={styles.headerImage}
        /> 
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Profile</ThemedText>
        <HelloWave />
      </ThemedView>
      {profile ? (
        <ThemedView style={styles.stepContainer}>
          {profile.profilePhotoURL && (
            <Image
              source={{ uri: profile.profilePhotoURL }}
              style={styles.profileImage}
            />
          )}
          <ThemedText type="subtitle">Welcome, {profile.name || "No Name Set"}</ThemedText>
          <ThemedText>Email: {profile.email}</ThemedText>
          <ThemedText>Date Joined: {profile.dateJoined.toDate().toLocaleDateString() || "No Date Set"}</ThemedText>
        </ThemedView>
      ) : (
        <ThemedView style={styles.stepContainer}>
          <ThemedText>No profile found</ThemedText>
        </ThemedView>
      )}

      <ThemedView style={styles.stepContainer}>
        <TouchableOpacity style={styles.editProfileButton} onPress={() => router.push("../edit")}>
          <ThemedText style={styles.signOutText}>Edit Profile</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  editProfileButton: {
    backgroundColor: '#0065CB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    alignSelf: 'center',
  },
});
