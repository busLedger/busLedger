"use client";

import useSWR from "swr";
import { useAuthFetch, useFirebaseSession } from "./useAuthApi";

const useDashboardPeriods = () => {
  const { firebaseUser, authLoading } = useFirebaseSession();
  const authFetch = useAuthFetch();
  const { data, error, isLoading, mutate } = useSWR(
    firebaseUser ? "/api/dashboard/periodos" : null,
    authFetch
  );
  return {
    periods: data?.data ?? [],
    isLoading: authLoading || isLoading,
    error: error?.message ?? null,
    mutate,
  };
};

const useDashboardSummary = (anio, mes) => {
  const { firebaseUser, authLoading } = useFirebaseSession();
  const authFetch = useAuthFetch();
  const params = new URLSearchParams({ anio: String(anio) });
  if (mes && mes !== "todos") params.set("mes", mes);
  const key = `/api/dashboard/resumen?${params}`;
  const { data, error, isLoading, mutate } = useSWR(
    firebaseUser && anio ? key : null,
    authFetch
  );
  return {
    summary: data?.data ?? null,
    isLoading: authLoading || isLoading,
    error: error?.message ?? null,
    mutate,
  };
};

const usePaymentSummary = (anio, mes) => {
  const { firebaseUser, authLoading } = useFirebaseSession();
  const authFetch = useAuthFetch();
  const params = new URLSearchParams({ anio: String(anio) });
  if (mes && mes !== "todos") params.set("mes", mes);
  const key = `/api/dashboard/pagos?${params}`;
  const { data, error, isLoading, mutate } = useSWR(
    firebaseUser && anio ? key : null,
    authFetch
  );
  return {
    summary: data?.data ?? null,
    isLoading: authLoading || isLoading,
    error: error?.message ?? null,
    mutate,
  };
};

export { useDashboardPeriods, useDashboardSummary, usePaymentSummary };
