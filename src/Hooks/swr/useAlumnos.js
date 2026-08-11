"use client";

import { useState } from "react";
import useSWR from "swr";
import { revalidatePrefix } from "./cache";
import { useAuthFetch, useFirebaseSession } from "./useAuthApi";

const useAlumnos = () => {
  const { firebaseUser, authLoading } = useFirebaseSession();
  const authFetch = useAuthFetch();
  const { data, error, isLoading, mutate } = useSWR(
    firebaseUser ? "/api/alumnos" : null,
    authFetch
  );
  return {
    buses: data ?? [],
    isLoading: authLoading || isLoading,
    error: error?.message ?? null,
    mutate,
  };
};

const useAlumno = (id) => {
  const { firebaseUser, authLoading } = useFirebaseSession();
  const authFetch = useAuthFetch();
  const { data, error, isLoading, mutate } = useSWR(
    firebaseUser && id ? `/api/alumnos/${id}` : null,
    authFetch
  );
  return {
    alumno: data ?? null,
    isLoading: authLoading || isLoading,
    error: error?.message ?? null,
    mutate,
  };
};

const useAlumnoMutations = () => {
  const authFetch = useAuthFetch();
  const [isMutating, setIsMutating] = useState(false);
  const run = async (url, options) => {
    setIsMutating(true);
    try {
      const result = await authFetch(url, options);
      await revalidatePrefix("/api/alumnos");
      return result;
    } finally {
      setIsMutating(false);
    }
  };
  return {
    createAlumno: (input) =>
      run("/api/alumnos", { method: "POST", body: JSON.stringify(input) }),
    updateAlumno: (id, input) =>
      run(`/api/alumnos/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    deleteAlumno: (id) => run(`/api/alumnos/${id}`, { method: "DELETE" }),
    isMutating,
  };
};

export { useAlumno, useAlumnoMutations, useAlumnos };
