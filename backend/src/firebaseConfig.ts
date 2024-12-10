import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyAuAyi5PZOGG-A4cNLPmAfTCCHz_1gFFWE",
  authDomain: "bugchase-istqb1.firebaseapp.com",
  projectId: "bugchase-istqb1",
  storageBucket: "bugchase-istqb1.firebasestorage.app",
  messagingSenderId: "833474806171",
  appId: "1:833474806171:web:a93db43598832303d2613e",
  measurementId: "G-ZW5BK17LW1"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

