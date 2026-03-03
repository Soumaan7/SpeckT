import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  enableIndexedDbPersistence,
  serverTimestamp,
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
  authDomain: "transportapp-ebc27.firebaseapp.com",
  projectId: "transportapp-ebc27",
  storageBucket: "transportapp-ebc27.appspot.com",
  messagingSenderId: "72359441649",
  appId: "1:72359441649:web:674e55171fbe4bbcebe550",
  measurementId: "G-4K9W8T8NLR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Enable offline persistence with error handling
enableIndexedDbPersistence(db)
  .then(() => {
    console.log("Firestore persistence enabled.");
  })
  .catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn(
        "Multiple tabs open, persistence can only be enabled in one tab at a time."
      );
    } else if (err.code === "unimplemented") {
      console.warn("The current browser does not support persistence.");
    }
  });

// Debugging: Log Firestore updates
onSnapshot(collection(db, "updates"), (snapshot) => {
  console.log(
    "🔄 Firestore updates received:",
    snapshot.docs.map((doc) => doc.data())
  );
});

export {
  db,
  auth,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  setDoc,
};
