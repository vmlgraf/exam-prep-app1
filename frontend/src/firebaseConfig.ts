import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyAuAyi5PZOGG-A4cNLPmAfTCCHz_1gFFWE",
  authDomain: "bugchase-istqb1.firebaseapp.com",
  projectId: "bugchase-istqb1",
  storageBucket: "bugchase-istqb1.appspot.com",
  messagingSenderId: "833474806171",
  appId: "1:833474806171:web:a93db43598832303d2613e",
  measurementId: "G-ZW5BK17LW1",
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app); 
export const db = getFirestore(app); 
export const storage = getStorage(app);

export { app };
