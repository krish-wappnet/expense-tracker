// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDJqTOFhD6qsIiRvYHIXT7yYbRkXoTLFag",
  authDomain: "expense-tracker-dae7e.firebaseapp.com",
  projectId: "expense-tracker-dae7e",
  storageBucket: "expense-tracker-dae7e.firebasestorage.app",
  messagingSenderId: "759608683764",
  appId: "1:759608683764:web:d6d4283addafa728b4c2a1",
  measurementId: "G-BC3VPJPCZL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);