// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database'; // Import Realtime Database
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAemi9enHfC_GEG7ZAnQZiXsyzmZrMZoNI",
  authDomain: "geomapper-d2b26.firebaseapp.com",
  projectId: "geomapper-d2b26",
  storageBucket: "geomapper-d2b26.appspot.com",
  messagingSenderId: "246358053582",
  appId: "1:246358053582:web:f9bfbeee8c0189d7b6369f",
  databaseURL: "https://geomapper-d2b26-default-rtdb.asia-southeast1.firebasedatabase.app" // Add the Database URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Realtime Database
export const database = getDatabase(app);



// clientId: '246358053582-95e65gm2ti0chd85b9dmrs8dleiu63rn.apps.googleusercontent.com',
   // androidClientId: '246358053582-95e65gm2ti0chd85b9dmrs8dleiu63rn.apps.googleusercontent.com',
  //  iosClientId: '1080386554290-cq3m5krr8cgutrkku7jq0nk90ij4ff37.apps.googleusercontent.com'