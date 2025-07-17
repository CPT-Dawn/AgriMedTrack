import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, getFirestore, Timestamp } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

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

// Initialize Storage
export const storage = getStorage(app);

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

// Helper function to upload an image to Firebase Storage
export const uploadImage = async (
  uri: string,
  path: string,
  fileName: string
): Promise<string> => {
  try {
    // Fetch the image
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create storage reference
    const storageRef = ref(storage, `${path}/${fileName}`);

    // Upload image
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// For development - uncomment these lines to use emulators
// if (__DEV__) {
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectStorageEmulator(storage, 'localhost', 9199);
// }
