"use client";

import { useState } from "react";
import useSWR from "swr";
import { revalidatePrefix } from "./cache";
import { useAuthFetch, useFirebaseSession } from "./useAuthApi";

const usePagosAlumno = (alumnoId, anio) => {
  const { firebaseUser, authLoading } = useFirebaseSession();
  const authFetch = useAuthFetch();
  const key =
    alumnoId && anio
      ? `/api/pagos?alumnoId=${encodeURIComponent(alumnoId)}&anio=${encodeURIComponent(anio)}`
      : null;
  const { data, error, isLoading, mutate } = useSWR(
    firebaseUser ? key : null,
    authFetch
  );
  return {
    pagos: data?.data ?? [],
    isLoading: authLoading || isLoading,
    error: error?.message ?? null,
    mutate,
  };
};

const usePagoMutations = () => {
  const authFetch = useAuthFetch();
  const [isMutating, setIsMutating] = useState(false);
  const run = async (url, options) => {
    setIsMutating(true);
    try {
      const result = await authFetch(url, options);
      await Promise.all([
        revalidatePrefix("/api/pagos"),
        revalidatePrefix("/api/alumnos"),
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
    createPago: (input) =>
      run("/api/pagos", { method: "POST", body: JSON.stringify(input) }),
    deletePago: (id) => run(`/api/pagos/${id}`, { method: "DELETE" }),
    isMutating,
  };
};

export { usePagoMutations, usePagosAlumno };
