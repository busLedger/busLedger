"use client";

import { useState } from "react";
import useSWR from "swr";
import { revalidatePrefix } from "./cache";
import { useAuthFetch, useFirebaseSession } from "./useAuthApi";

const useBuses = ({ financials = false, all = false } = {}) => {
  const { firebaseUser, authLoading } = useFirebaseSession();
  const authFetch = useAuthFetch();
  const params = new URLSearchParams();
  if (financials) params.set("view", "financials");
  if (all) params.set("all", "true");
  const key = `/api/buses${params.size ? `?${params}` : ""}`;
  const { data, error, isLoading, mutate } = useSWR(
    firebaseUser ? key : null,
    authFetch
  );
  return {
    buses: data?.data ?? [],
    isLoading: authLoading || isLoading,
    error: error?.message ?? null,
    mutate,
  };
};

const useBusMutations = () => {
  const authFetch = useAuthFetch();
  const [isMutating, setIsMutating] = useState(false);
  const run = async (url, options) => {
    setIsMutating(true);
    try {
      const result = await authFetch(url, options);
      await revalidatePrefix("/api/buses");
      return result;
    } finally {
      setIsMutating(false);
    }
  };
  return {
    createBus: (input) =>
      run("/api/buses", { method: "POST", body: JSON.stringify(input) }),
    updateBus: (id, input) =>
      run(`/api/buses/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    deleteBus: (id) => run(`/api/buses/${id}`, { method: "DELETE" }),
    isMutating,
  };
};

export { useBuses, useBusMutations };
