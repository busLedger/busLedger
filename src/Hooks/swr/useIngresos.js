"use client";

import { useState } from "react";
import useSWR from "swr";
import { revalidatePrefix } from "./cache";
import { useAuthFetch, useFirebaseSession } from "./useAuthApi";

const useIngresos = () => {
  const { firebaseUser, authLoading } = useFirebaseSession();
  const authFetch = useAuthFetch();
  const { data, error, isLoading, mutate } = useSWR(
    firebaseUser ? "/api/ingresos" : null,
    authFetch
  );
  return {
    buses: data ?? [],
    isLoading: authLoading || isLoading,
    error: error?.message ?? null,
    mutate,
  };
};

const useIngresoPeriods = () => {
  const { firebaseUser, authLoading } = useFirebaseSession();
  const authFetch = useAuthFetch();
  const { data, error, isLoading } = useSWR(
    firebaseUser ? "/api/ingresos/periodos" : null,
    authFetch
  );
  return {
    periods: data ?? [],
    isLoading: authLoading || isLoading,
    error: error?.message ?? null,
  };
};

const useFinancialSummary = (anio, mes) => {
  const { firebaseUser, authLoading } = useFirebaseSession();
  const authFetch = useAuthFetch();
  const key =
    anio && mes
      ? `/api/ingresos/resumen?anio=${encodeURIComponent(anio)}&mes=${encodeURIComponent(mes)}`
      : null;
  const { data, error, isLoading } = useSWR(
    firebaseUser ? key : null,
    authFetch
  );
  return {
    summary: data ?? null,
    isLoading: authLoading || isLoading,
    error: error?.message ?? null,
  };
};

const useIngresoMutations = () => {
  const authFetch = useAuthFetch();
  const [isMutating, setIsMutating] = useState(false);
  const run = async (url, options) => {
    setIsMutating(true);
    try {
      const result = await authFetch(url, options);
      await Promise.all([
        revalidatePrefix("/api/ingresos"),
        revalidatePrefix("/api/buses"),
        revalidatePrefix("/api/dashboard"),
      ]);
      return result;
    } finally {
      setIsMutating(false);
    }
  };
  return {
    createIngreso: (input) =>
      run("/api/ingresos", { method: "POST", body: JSON.stringify(input) }),
    deleteIngreso: (id) => run(`/api/ingresos/${id}`, { method: "DELETE" }),
    isMutating,
  };
};

export {
  useFinancialSummary,
  useIngresoMutations,
  useIngresoPeriods,
  useIngresos,
};
