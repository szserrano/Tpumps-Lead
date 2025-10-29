import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function EditScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePhotoURL, setProfilePhotoURL] = useState('');
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
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
      // Request smaller image to fit within Firestore's 1MB limit
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3, // Lower quality to reduce size
        allowsMultipleSelection: false,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setLocalImageUri(imageUri); // Set local URI for preview only
        setUploading(true); // Show uploading state
        
        // Convert to base64 and store in Firestore
        await uploadImageToFirestore(imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImageToFirestore = async (imageUri: string) => {
    try {
      setUploading(true);
      const user = auth.currentUser;
      if (!user) {
        console.log('No user found');
        return;
      }

      console.log('Starting upload to Firestore, imageUri:', imageUri);

      // Convert image URI to base64 string
      const base64String = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
          const reader = new FileReader();
          reader.onloadend = function() {
            const base64data = reader.result as string;
            // Extract base64 data (remove data:image/jpeg;base64, prefix)
            const base64Data = base64data.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(xhr.response);
        };
        xhr.onerror = () => reject(new Error('Failed to load image'));
        xhr.responseType = 'blob';
        xhr.open('GET', imageUri);
        xhr.send();
      });

      console.log('Converted to base64, length:', base64String.length);
      
      // Check if image is too large (Firestore has 1MB limit)
      const sizeInBytes = (base64String.length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      console.log('Image size:', sizeInMB.toFixed(2), 'MB');
      
      if (sizeInMB > 0.9) { // Leave some buffer
        throw new Error('Image is too large. Please choose a smaller image.');
      }

      // Store the base64 string in Firestore
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        profilePhotoURL: base64String, // Store base64 directly
      });

      console.log('Upload successful to Firestore');

      // Update the profilePhotoURL state with the base64 string
      setProfilePhotoURL(base64String);
      setLocalImageUri(null); // Clear local URI since we now have the base64 data
    } catch (error: any) {
      console.error('Upload error details:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error stack:', error.stack);
      Alert.alert('Error', `Failed to upload image: ${error.message || 'Unknown error'}`);
      setLocalImageUri(null); // Clear local URI on error
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
        profilePhotoURL, // Contains base64 string if image was uploaded
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
          source={
            localImageUri 
              ? { uri: localImageUri } 
              : profilePhotoURL 
                ? { uri: `data:image/jpeg;base64,${profilePhotoURL}` } 
                : require('@/assets/images/icon.png')
          }
          style={styles.avatar}
          onError={(error) => console.log('Image load error:', error)}
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