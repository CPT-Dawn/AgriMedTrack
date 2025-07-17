import {
  addDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { User } from "../types/user";
import { db, usersCollection } from "./firebase";

// Get all users from Firebase
export const getUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(
      query(usersCollection, orderBy("name"))
    );

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        avatar: data.avatar,
      };
    });
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
};

// Get a specific user by ID
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        avatar: data.avatar,
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
};

// Create a new user
export const createUser = async (
  name: string,
  avatar: string
): Promise<User> => {
  try {
    const newUser = {
      name,
      avatar,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(usersCollection, newUser);

    return {
      id: docRef.id,
      name,
      avatar,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Initialize default users if they don't exist
export const initializeDefaultUsers = async (): Promise<User[]> => {
  try {
    // Check if users already exist
    const existingUsers = await getUsers();

    if (existingUsers.length > 0) {
      console.log("Users already exist, skipping initialization");
      return existingUsers;
    }

    // Create default users
    const defaultUsers = [
      { name: "Gopal", avatar: "👨‍💼" },
      { name: "Anil", avatar: "👨‍🌾" },
      { name: "Papa", avatar: "👩‍💼" },
    ];

    const createdUsers = await Promise.all(
      defaultUsers.map((user) => createUser(user.name, user.avatar))
    );

    console.log("Default users created:", createdUsers);
    return createdUsers;
  } catch (error) {
    console.error("Error initializing default users:", error);
    throw error;
  }
};
