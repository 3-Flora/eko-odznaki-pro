import { Capacitor } from "@capacitor/core";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

/*
  Fix do tego zeby firebase dzialal na ios
  https://github.com/capawesome-team/capacitor-firebase/issues/221
*/
let auth;
try {
  if (Capacitor.isNativePlatform()) {
    auth = initializeAuth(app, { persistence: indexedDBLocalPersistence });
  } else {
    auth = getAuth(app);
  }
} catch (error) {
  console.error("Błąd inicjalizacji Firebase Auth:", error);
  // Fallback do getAuth jeśli initializeAuth nie działa
  auth = getAuth(app);
}

export { auth };

export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const googleProvider = new GoogleAuthProvider();

// W trybie deweloperskim można połączyć z emulatorem functions
// if (import.meta.env.DEV) {
//   connectFunctionsEmulator(functions, 'localhost', 5001);
// }
