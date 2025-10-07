import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { auth, db, storage } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function EditScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePhotoURL, setProfilePhotoURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || "");
        setEmail(data.email || "");
        setProfilePhotoURL(data.profilePhotoURL || "");
      }
    };
    fetchProfile();
  }, []);

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email input change with validation
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text.length > 0 && !validateEmail(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setProfilePhotoURL(imageUri); // Set local URI for preview
        
        // Upload to Firebase Storage
        await uploadImageToStorage(imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImageToStorage = async (imageUri: string) => {
    try {
      setUploading(true);
      const user = auth.currentUser;
      if (!user) return;

      // Convert image URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Create a reference to the image in Firebase Storage
      const imageRef = ref(storage, `profile-images/${user.uid}`);

      // Upload the image
      await uploadBytes(imageRef, blob);

      // Get the download URL
      const downloadURL = await getDownloadURL(imageRef);

      // Update the profilePhotoURL state with the download URL
      setProfilePhotoURL(downloadURL);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    // Validate email before saving
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        name,
        email,
        profilePhotoURL, // Now contains Firebase Storage download URL
      });

      Alert.alert("Success", "Profile updated!");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity onPress={pickImage} disabled={uploading}>
        <Image
          source={profilePhotoURL ? { uri: profilePhotoURL } : require('@/assets/images/icon.png')}
          style={styles.avatar}
        />
      </TouchableOpacity>
      
      {uploading && (
        <ThemedText style={styles.uploadingText}>Uploading image...</ThemedText>
      )}

      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={[styles.input, emailError ? styles.inputError : null]}
        placeholder="Enter your email"
        value={email}
        onChangeText={handleEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      {emailError ? (
        <ThemedText style={styles.errorText}>{emailError}</ThemedText>
      ) : null}

      <TouchableOpacity 
        style={[styles.saveButton, (loading || uploading || emailError) && styles.disabledButton]} 
        onPress={handleSave} 
        disabled={loading || uploading || !!emailError}
      >
        <ThemedText style={styles.saveText}>
          {loading ? "Saving..." : uploading ? "Uploading..." : "Save"}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 24,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  saveText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  uploadingText: {
    marginBottom: 16,
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  inputError: {
    borderColor: "#FF3B30",
    borderWidth: 2,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginTop: -20,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
});