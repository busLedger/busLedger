import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const getAdminAuth = () => {
  if (getApps().length) return getAuth();

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (
    !projectId ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !privateKey
  ) {
    throw new Error(
      "Faltan credenciales de Firebase Admin: FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY son obligatorias; FIREBASE_PROJECT_ID puede venir de FIREBASE_PROJECT_ID o NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    );
  }

  initializeApp({
    credential: cert({
      projectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });

  return getAuth();
};

export { getAdminAuth };
