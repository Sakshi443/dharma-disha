// src/services/firebase.js
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Firebase Admin Initialization Using .env Variables
// export const adminApp = admin.initializeApp({
//   credential: admin.credential.cert({
//     project_id: process.env.FIREBASE_PROJECT_ID,
//     private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
//     private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//     client_email: process.env.FIREBASE_CLIENT_EMAIL,
//   }),
// });

// export const db = admin.firestore();

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Replace these values with your Firebase project's config
const firebaseConfig = {
  apiKey: "AIzaSyAbGYg2CcKdLQOoQ_ML_qzh9X8HZeoKLe0",
  authDomain: "dharma-disha-8b093.firebaseapp.com",
  projectId: "dharma-disha-8b093",
  storageBucket: "dharma-disha-8b093.firebasestorage.app",
  messagingSenderId: "555242800887",
  appId: "1:555242800887:web:31943eda83abc3078b75f2",
  measurementId: "G-JR7Y6BB5SL"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();