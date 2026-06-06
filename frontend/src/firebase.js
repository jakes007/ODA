import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA9NmaXXfzzXmhNSk4LdJDrouISN1MbVao",
  authDomain: "oda-app-90474.firebaseapp.com",
  projectId: "oda-app-90474",
  storageBucket: "oda-app-90474.firebasestorage.app",
  messagingSenderId: "653219960972",
  appId: "1:653219960972:web:09ddcc41dfa272a971c3a9",
  measurementId: "G-WH0M0F3C77"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
