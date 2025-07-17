// This script lists all users in Firebase

const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

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

// Function to list all users
async function listUsers() {
  console.log("Listing all users in Firebase...");

  try {
    // Get all users
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);

    console.log(`Found ${querySnapshot.size} users:`);

    // Print each user's data
    querySnapshot.docs.forEach((doc, index) => {
      const userData = doc.data();
      console.log(`\nUser ${index + 1}:`);
      console.log(`  ID: ${doc.id}`);
      console.log(`  Fields: ${JSON.stringify(userData, null, 2)}`);
    });

    console.log("\nUser listing completed.");
  } catch (error) {
    console.error("Error listing users:", error);
  }
}

// Run the listing
listUsers()
  .then(() => {
    console.log("Script completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
