import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth } from "firebase/auth";
import { getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCcbY7nmXNBSuAEHEmFHzPQ4x8zlI2fL08",
  authDomain: "patel-krishi-kendra.firebaseapp.com",
  projectId: "patel-krishi-kendra",
  storageBucket: "patel-krishi-kendra.firebasestorage.app",
  messagingSenderId: "402698276074",
  appId: "1:402698276074:web:87d96ff4f301b3f0395b93",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
