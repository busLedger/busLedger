import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getMesesYAniosConRegistros,
  getResumenPorAnio,
  getResumenPorMes,
} from "@/api/dashboard.service";
import { queryKeys } from "./queryKeys";

const useDashboardPeriodsQuery = (userId) =>
  useQuery({
    queryKey: queryKeys.dashboard.periods(userId),
    queryFn: () => getMesesYAniosConRegistros(userId),
    enabled: Boolean(userId),
  });

const useDashboardSummaryQuery = (userId, anio, mes) =>
  useQuery({
    queryKey: queryKeys.dashboard.summary(userId, anio, mes),
    queryFn: () =>
      mes === "todos"
        ? getResumenPorAnio(userId, anio)
        : getResumenPorMes(userId, anio, mes),
    enabled: Boolean(userId && anio && mes),
    placeholderData: keepPreviousData,
  });

export { useDashboardPeriodsQuery, useDashboardSummaryQuery };
