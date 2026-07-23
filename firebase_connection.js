import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let authInstance = null;

const getFirebaseAuth = () => {
  if (typeof window === "undefined") return null;
  if (!authInstance) {
    const app = getApps()[0] || initializeApp(firebaseConfig);
    authInstance = getAuth(app);
  }
  return authInstance;
};

export { getFirebaseAuth };
