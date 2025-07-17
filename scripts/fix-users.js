// This script fixes the user data in Firebase

const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
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

// Function to fix user data
async function fixUserData() {
  console.log("Starting user data fix...");

  try {
    // Get all users
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);

    let updatedCount = 0;

    // Check each user document
    for (const userDoc of querySnapshot.docs) {
      const userData = userDoc.data();
      const updates = {};
      let needsUpdate = false;

      // Check for incorrect field names
      if (userData.namee && !userData.name) {
        updates.name = userData.namee;
        needsUpdate = true;
        console.log(
          `User ${userDoc.id} has incorrect field 'namee', fixing...`
        );
      }

      // Add any other field checks here

      // Update the document if needed
      if (needsUpdate) {
        await updateDoc(doc(db, "users", userDoc.id), updates);
        updatedCount++;
        console.log(`Fixed user ${userDoc.id}`);
      }
    }

    console.log(`User data fix completed. Updated ${updatedCount} users.`);
  } catch (error) {
    console.error("Error fixing user data:", error);
  }
}

// Run the fix
fixUserData()
  .then(() => {
    console.log("Script completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
