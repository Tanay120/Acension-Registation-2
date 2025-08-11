// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your app's Firebase configuration from the Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyDsuYhBN_Qq_IUSndwBA5QUoqIK4OFws0w",
  authDomain: "ascension-tournament.firebaseapp.com",
  projectId: "ascension-tournament",
  storageBucket: "ascension-tournament.firebasestorage.app",
  messagingSenderId: "1018752087165",
  appId: "1:1018752087165:web:d0e341c70e696f0d6b6d14"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firestore for use in other files
export const db = getFirestore(app);