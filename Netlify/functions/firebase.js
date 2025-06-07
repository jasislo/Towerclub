// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLuxhWskLzVZTwLkYCFSI4YaMJ0HCrr9s",
  authDomain: "towerclub-b33dc.firebaseapp.com",
  projectId: "towerclub-b33dc",
  storageBucket: "towerclub-b33dc.firebasestorage.app",
  messagingSenderId: "176994227269",
  appId: "1:176994227269:web:2005920c1bba944cf6ff2c",
  measurementId: "G-E5BPE8P2YN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export the Firebase instances
export { app, analytics }; 