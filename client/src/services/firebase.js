import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAyKPlW9-iNe-8_AbAHROoSQeDLEtRN228",
  authDomain: "student-portfolio-1c9df.firebaseapp.com",
  databaseURL: "https://student-portfolio-1c9df-default-rtdb.firebaseio.com",
  projectId: "student-portfolio-1c9df",
  storageBucket: "student-portfolio-1c9df.firebasestorage.app",
  messagingSenderId: "210940024031",
  appId: "1:210940024031:web:539437a3caec4bea48c56a",
  measurementId: "G-0RTF78LSF8",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;