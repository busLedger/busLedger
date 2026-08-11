import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getIngresosByUser,
  getMesesYAniosConRegistros,
  getResumenFinancieroPorMes,
} from "@/api/ingresos.service";
import { queryKeys } from "./queryKeys";

const useIngresosByUserQuery = (userId) =>
  useQuery({
    queryKey: queryKeys.ingresos.byUser(userId),
    queryFn: () => getIngresosByUser(userId),
    enabled: Boolean(userId),
  });

const useIngresoPeriodsQuery = (userId) =>
  useQuery({
    queryKey: queryKeys.ingresos.periods(userId),
    queryFn: () => getMesesYAniosConRegistros(userId),
    enabled: Boolean(userId),
  });

const useFinancialSummaryQuery = (userId, anio, mes) =>
  useQuery({
    queryKey: queryKeys.ingresos.financialSummary(userId, anio, mes),
    queryFn: () => getResumenFinancieroPorMes(userId, anio, mes),
    enabled: Boolean(userId && anio && mes),
    placeholderData: keepPreviousData,
  });

export {
  useFinancialSummaryQuery,
  useIngresoPeriodsQuery,
  useIngresosByUserQuery,
};
