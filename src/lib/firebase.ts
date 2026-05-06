import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  GoogleAuthProvider,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "orderpilot-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "orderpilot-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "orderpilot-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:demo",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

const useEmulator =
  import.meta.env.VITE_USE_EMULATOR === "true" ||
  (import.meta.env.DEV && !import.meta.env.VITE_FIREBASE_API_KEY);

if (useEmulator && typeof window !== "undefined") {
  // guard against double-connect during HMR
  // @ts-ignore
  if (!window.__OP_EMU_CONNECTED__) {
    try {
      connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
      connectFirestoreEmulator(db, "127.0.0.1", 8080);
      connectFunctionsEmulator(functions, "127.0.0.1", 5001);
      connectStorageEmulator(storage, "127.0.0.1", 9199);
      // @ts-ignore
      window.__OP_EMU_CONNECTED__ = true;
      // eslint-disable-next-line no-console
      console.log("[orderpilot] connected to firebase emulator suite");
    } catch (e) {
      console.error("emulator connect failed", e);
    }
  }
}
