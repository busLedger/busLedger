"use client";

import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase_connection";
import { authFetch } from "../../lib/clientApi";

const useFirebaseSession = () => {
  const [firebaseUser, setFirebaseUser] = useState(auth.currentUser);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(auth, (user) => {
        setFirebaseUser(user);
        setAuthLoading(false);
      }),
    []
  );

  return { firebaseUser, authLoading };
};

const useAuthFetch = () =>
  useCallback((url, options = {}) => authFetch(url, options), []);

export { useAuthFetch, useFirebaseSession };
