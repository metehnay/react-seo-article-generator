import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAndgM7ORhGBErqt87VDjCe8iTjXncXYU0",
  authDomain: "unludetay-8c60a.firebaseapp.com",
  projectId: "unludetay-8c60a",
  storageBucket: "unludetay-8c60a.appspot.com",
  messagingSenderId: "948593696729",
  appId: "1:948593696729:web:897a908f362e6b63d643c8",
  measurementId: "G-B4JTJ6MCCR",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
