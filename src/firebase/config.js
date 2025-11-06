import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// TODO: Replace with your Firebase project configuration
// Get this from your Firebase Console: Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "AIzaSyAYmzZBtEkfpVhEwB8okvVI2lIa_AvoFu8",
  authDomain: "anonymous-feedback-9d17d.firebaseapp.com",
  projectId: "anonymous-feedback-9d17d",
  storageBucket: "anonymous-feedback-9d17d.firebasestorage.app",
  messagingSenderId: "812112013739",
  appId: "1:812112013739:web:15a97b4434aba866858aee",
  measurementId: "G-LGG0CF5MM8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
