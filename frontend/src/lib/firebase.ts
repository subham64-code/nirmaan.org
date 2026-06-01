// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCG8j3p4bH7ZVdXyDWMVnbYIKUmAfH8peM",
  authDomain: "nirmaan-71322.firebaseapp.com",
  projectId: "nirmaan-71322",
  storageBucket: "nirmaan-71322.firebasestorage.app",
  messagingSenderId: "581876389943",
  appId: "1:581876389943:web:fe45fa80a1c834c128c7b2",
  measurementId: "G-VX1P6P567F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services only in browser environment
let analytics: ReturnType<typeof getAnalytics> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let storage: ReturnType<typeof getStorage> | null = null;
let firestore: ReturnType<typeof getFirestore> | null = null;

if (typeof window !== 'undefined') {
  try {
    // Only initialize analytics in supported environments
    import('firebase/analytics').then(({ getAnalytics }) => {
      analytics = getAnalytics(app);
    }).catch(() => {
      console.log('Analytics not available in this environment');
    });
    
    auth = getAuth(app);
    storage = getStorage(app);
    firestore = getFirestore(app);
  } catch (error) {
    console.log('Firebase services initialization failed:', error);
  }
}

export { app, analytics, auth, storage, firestore };
