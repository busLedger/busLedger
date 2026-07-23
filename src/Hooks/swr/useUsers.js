"use client";

import { useState } from "react";
import useSWR, { mutate as mutateCache } from "swr";
import { useAuthFetch, useFirebaseSession } from "./useAuthApi";

const USERS_KEY = "/api/usuarios";

const useUsers = () => {
  const { firebaseUser, authLoading } = useFirebaseSession();
  const authFetch = useAuthFetch();
  const { data, error, isLoading, mutate } = useSWR(
    firebaseUser ? USERS_KEY : null,
    authFetch
  );
  return {
    users: data?.data ?? [],
    isLoading: authLoading || isLoading,
    error: error?.message ?? null,
    mutate,
  };
};

const useToggleUserStatus = () => {
  const authFetch = useAuthFetch();
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleUserStatus = async (uid, isActive) => {
    setIsUpdating(true);
    try {
      const result = await authFetch(`/api/usuarios/${encodeURIComponent(uid)}`, {
        method: "PATCH",
        body: JSON.stringify({ activo: isActive }),
      });
      await mutateCache(USERS_KEY);
      return result;
    } finally {
      setIsUpdating(false);
    }
  };

  return { toggleUserStatus, isUpdating };
};

export { USERS_KEY, useToggleUserStatus, useUsers };
