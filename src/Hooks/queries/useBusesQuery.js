import { useQuery } from "@tanstack/react-query";
import {
  getAllBusesWithFinancials,
  getBusesByUser,
  getBusesWithFinancials,
} from "@/api/buses.service";
import { queryKeys } from "./queryKeys";

const useBusesByUserQuery = (userId) =>
  useQuery({
    queryKey: queryKeys.buses.byUser(userId),
    queryFn: () => getBusesByUser(userId),
    enabled: Boolean(userId),
  });

const useBusesFinancialsQuery = (userId, isAdmin = false) =>
  useQuery({
    queryKey: isAdmin
      ? queryKeys.buses.allFinancials
      : queryKeys.buses.financialsByUser(userId),
    queryFn: () =>
      isAdmin ? getAllBusesWithFinancials() : getBusesWithFinancials(userId),
    enabled: isAdmin || Boolean(userId),
  });

export { useBusesByUserQuery, useBusesFinancialsQuery };
