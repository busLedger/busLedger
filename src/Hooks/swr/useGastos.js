"use client";

import { useState } from "react";
import useSWR from "swr";
import { revalidatePrefix } from "./cache";
import { useAuthFetch, useFirebaseSession } from "./useAuthApi";

const useGastos = () => {
  const { firebaseUser, authLoading } = useFirebaseSession();
  const authFetch = useAuthFetch();
  const { data, error, isLoading, mutate } = useSWR(
    firebaseUser ? "/api/gastos" : null,
    authFetch
  );
  return {
    buses: data ?? [],
    isLoading: authLoading || isLoading,
    error: error?.message ?? null,
    mutate,
  };
};

const useGastoPeriods = () => {
  const { firebaseUser, authLoading } = useFirebaseSession();
  const authFetch = useAuthFetch();
  const { data, error, isLoading } = useSWR(
    firebaseUser ? "/api/gastos/periodos" : null,
    authFetch
  );
  return {
    periods: data ?? [],
    isLoading: authLoading || isLoading,
    error: error?.message ?? null,
  };
};

const useGastoMutations = () => {
  const authFetch = useAuthFetch();
  const [isMutating, setIsMutating] = useState(false);
  const run = async (url, options) => {
    setIsMutating(true);
    try {
      const result = await authFetch(url, options);
      await Promise.all([
        revalidatePrefix("/api/gastos"),
        revalidatePrefix("/api/buses"),
        revalidatePrefix("/api/ingresos/resumen"),
        revalidatePrefix("/api/dashboard"),
      ]);
      return result;
    } finally {
      setIsMutating(false);
    }
  };
  return {
    createGasto: (input) =>
      run("/api/gastos", { method: "POST", body: JSON.stringify(input) }),
    deleteGasto: (id) => run(`/api/gastos/${id}`, { method: "DELETE" }),
    isMutating,
  };
};

export { useGastoMutations, useGastoPeriods, useGastos };
