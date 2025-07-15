// Firebase configuration - Disabled for now, using mock data
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
// import { getStorage, connectStorageEmulator } from "firebase/storage";

// Mock exports for now - replace with actual Firebase when ready
export const db = null;
export const storage = null;
export const auth = null;

console.log("Using mock data - Firebase integration disabled");

// Firebase configuration - Replace with your actual config when ready
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
};

// Uncomment below when ready to integrate Firebase:
/*
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Initialize Auth
export const auth = getAuth(app);

// For development - uncomment these lines to use emulators
// if (__DEV__) {
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectStorageEmulator(storage, 'localhost', 9199);
// }
*/
