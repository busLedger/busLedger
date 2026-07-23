"use client";

import { useCallback } from "react";
import { useAuth } from "../../components/providers/AuthProvider";
import { authFetch } from "../../lib/clientApi";

const useFirebaseSession = () => {
  const { firebaseUser, authLoading } = useAuth();
  return { firebaseUser, authLoading };
};

const useAuthFetch = () =>
  useCallback((url, options = {}) => authFetch(url, options), []);

export { useAuthFetch, useFirebaseSession };
