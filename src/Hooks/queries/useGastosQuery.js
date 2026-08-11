import { useQuery } from "@tanstack/react-query";
import {
  getGastosByUser,
  getMesesYAniosConRegistros,
} from "@/api/gastos.service";
import { queryKeys } from "./queryKeys";

const useGastosByUserQuery = (userId) =>
  useQuery({
    queryKey: queryKeys.gastos.byUser(userId),
    queryFn: () => getGastosByUser(userId),
    enabled: Boolean(userId),
  });

const useGastoPeriodsQuery = (userId) =>
  useQuery({
    queryKey: queryKeys.gastos.periods(userId),
    queryFn: () => getMesesYAniosConRegistros(userId),
    enabled: Boolean(userId),
  });

export { useGastoPeriodsQuery, useGastosByUserQuery };
