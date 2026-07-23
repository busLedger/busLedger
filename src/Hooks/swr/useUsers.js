"use client";

import { useState } from "react";
import useSWR, { mutate as mutateCache } from "swr";
import { useAuthFetch, useFirebaseSession } from "./useAuthApi";

const USERS_KEY = "/api/usuarios";
const ME_KEY = "/api/usuarios/me";
const ROLES_KEY = "/api/usuarios/roles";

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

const useMe = () => {
  const { firebaseUser, authLoading } = useFirebaseSession();
  const authFetch = useAuthFetch();
  const { data, error, isLoading, mutate } = useSWR(
    firebaseUser ? ME_KEY : null,
    authFetch
  );
  return {
    user: data?.data ?? null,
    isLoading: authLoading || isLoading,
    error: error?.message ?? null,
    mutate,
  };
};

const useRoles = () => {
  const { firebaseUser, authLoading } = useFirebaseSession();
  const authFetch = useAuthFetch();
  const { data, error, isLoading, mutate } = useSWR(
    firebaseUser ? ROLES_KEY : null,
    authFetch
  );
  return {
    roles: data?.data ?? [],
    isLoading: authLoading || isLoading,
    error: error?.message ?? null,
    mutate,
  };
};

const useCreateUser = () => {
  const authFetch = useAuthFetch();
  const [isCreating, setIsCreating] = useState(false);

  const createUser = async (input) => {
    setIsCreating(true);
    try {
      const result = await authFetch(USERS_KEY, {
        method: "POST",
        body: JSON.stringify(input),
      });
      await mutateCache(USERS_KEY);
      return result;
    } finally {
      setIsCreating(false);
    }
  };

  return { createUser, isCreating };
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

export {
  ME_KEY,
  ROLES_KEY,
  USERS_KEY,
  useCreateUser,
  useMe,
  useRoles,
  useToggleUserStatus,
  useUsers,
};
