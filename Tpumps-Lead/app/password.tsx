import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { auth } from "../firebaseConfig";
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const user = auth.currentUser;

  const handleChangePassword = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to change your password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Reauthenticate with the current password
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // 2️⃣ Update password
      await updatePassword(user, newPassword);

      Alert.alert("Success", "Your password has been updated!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.back();
    } catch (error: any) {
      console.error("Error changing password:", error);
      let message = "Failed to update password.";
      if (error.code === "auth/wrong-password") {
        message = "Your current password is incorrect.";
      } else if (error.code === "auth/weak-password") {
        message = "Your new password is too weak.";
      } else if (error.code === "auth/requires-recent-login") {
        message = "Please log in again before changing your password.";
      }
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <KeyboardAvoidingView style={styles.keyboardAvoidingView}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.loadingText}>Updating password...</ThemedText>
        </ThemedView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>Change Password</ThemedText>

          <TextInput
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            placeholderTextColor="#999"
            style={styles.input}
          />

          <TextInput
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            placeholderTextColor="#999"
            style={styles.input}
          />

          <TextInput
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor="#999"
            style={styles.input}
          />

          <TouchableOpacity 
            style={[styles.updateButton, loading && styles.disabledButton]} 
            onPress={handleChangePassword}
            disabled={loading}
          >
            <ThemedText style={styles.updateButtonText}>
              {loading ? "Updating..." : "Update Password"}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 50,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 500,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  title: {
    marginBottom: 32,
    textAlign: "center",
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
  updateButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  updateButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});