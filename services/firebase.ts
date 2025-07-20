import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, getFirestore, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCwdZmaX1SUbGdo-MmpabGMOUjdT7IvVzg",
  authDomain: "agrimedtrack.firebaseapp.com",
  projectId: "agrimedtrack",
  storageBucket: "agrimedtrack.appspot.com",
  messagingSenderId: "614502989101",
  appId: "1:614502989101:web:eed20758c964e317bde7a4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Collection references
export const usersCollection = collection(db, "users");
export const productsCollection = collection(db, "products");
export const suppliersCollection = collection(db, "suppliers");
export const packagingSizesCollection = collection(db, "packagingSizes");
export const stockEntriesCollection = collection(db, "stockEntries");
export const stockBatchesCollection = collection(db, "stockBatches");
export const stockActivitiesCollection = collection(db, "stockActivities");
export const salesCollection = collection(db, "sales");

// Helper function to convert Firestore timestamps to JS Date
export const convertTimestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

// Helper function to convert JS Date to Firestore timestamp
export const convertDateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// For development - uncomment these lines to use emulators
// if (__DEV__) {
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectStorageEmulator(storage, 'localhost', 9199);
// }
