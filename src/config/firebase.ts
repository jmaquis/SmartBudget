import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBmPrujvWCR01erpVt6z7V-uTELmxzhRbA",
  authDomain: "smartbudget-b130b.firebaseapp.com",
  projectId: "smartbudget-b130b",
  storageBucket: "smartbudget-b130b.firebasestorage.app",
  messagingSenderId: "621089539326",
  appId: "1:621089539326:web:f314ec7617f9a2739a51af",
  measurementId: "G-P0QZYEGLMJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Enable offline persistence
try {
  enableIndexedDbPersistence(db);
} catch (err: any) {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser doesn\'t support persistence.');
  }
}