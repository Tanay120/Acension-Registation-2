// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your app's Firebase configuration
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firestore
export const db = getFirestore(app);