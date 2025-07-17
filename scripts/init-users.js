// This script initializes the Firebase database with default users

const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} = require("firebase/firestore");

// Firebase configuration
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
const db = getFirestore(app);

// Default users
const defaultUsers = [
  { name: "Gopal", avatar: "👨‍💼" },
  { name: "Anil", avatar: "👨‍🌾" },
  { name: "Papa", avatar: "👩‍💼" },
];

// Function to check if a user exists
async function userExists(name) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("name", "==", name));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

// Function to create a user
async function createUser(name, avatar) {
  const usersRef = collection(db, "users");
  const userData = {
    name,
    avatar,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(usersRef, userData);
  console.log(`Created user ${name} with ID: ${docRef.id}`);
  return docRef.id;
}

// Main function to initialize users
async function initializeUsers() {
  console.log("Starting user initialization...");

  try {
    for (const user of defaultUsers) {
      const exists = await userExists(user.name);

      if (exists) {
        console.log(`User ${user.name} already exists, skipping...`);
      } else {
        const userId = await createUser(user.name, user.avatar);
        console.log(`Created user ${user.name} with ID ${userId}`);
      }
    }

    console.log("User initialization completed successfully!");
  } catch (error) {
    console.error("Error initializing users:", error);
  }
}

// Run the initialization
initializeUsers()
  .then(() => {
    console.log("Script completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
