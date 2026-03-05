
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBZAYR-e00YXxyftVePJzYLWZG8315ZkDc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sylsas-fashion-b8975.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://sylsas-fashion-b8975-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sylsas-fashion-b8975",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sylsas-fashion-b8975.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "208397183597",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:208397183597:web:0f4323a562550321de6d64",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-TS8MHXG4Q3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

/**
 * RECOMMENDED FIRESTORE SECURITY RULES:
 * 
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /{document=**} {
 *       allow read, write: if true; // FOR DEMO ONLY - Update for production!
 *     }
 *   }
 * }
 */
