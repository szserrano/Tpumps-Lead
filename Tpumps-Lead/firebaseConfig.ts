import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDjpUMFObcs51466PYITjU-cp6OGDKLa1E",
  authDomain: "tpumps-lead.firebaseapp.com",
  projectId: "tpumps-lead",
  storageBucket: "tpumps-lead.firebasestorage.app",
  messagingSenderId: "365190760732",
  appId: "1:365190760732:web:ab92df3b3eacffb8a9d2d9",
  measurementId: "G-RNZ7VXGDE8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth (uses default persistence for React Native)
const auth = getAuth(app);

export { app, auth };
