import { authFetch } from "../lib/clientApi";

const getResumenPagosPorMes = (_userId, mes, anio) =>
  authFetch(
    `/api/dashboard/pagos?anio=${encodeURIComponent(anio)}&mes=${encodeURIComponent(mes)}`
  );

const getResumenPagosPorAnio = (_userId, anio) =>
  authFetch(`/api/dashboard/pagos?anio=${encodeURIComponent(anio)}`);

const getResumenPorMes = (_userId, anio, mes) =>
  authFetch(
    `/api/dashboard/resumen?anio=${encodeURIComponent(anio)}&mes=${encodeURIComponent(mes)}`
  );

const getResumenPorAnio = (_userId, anio) =>
  authFetch(`/api/dashboard/resumen?anio=${encodeURIComponent(anio)}`);

const getMesesYAniosConRegistros = () =>
  authFetch("/api/dashboard/periodos");

export {
  getResumenPagosPorMes,
  getResumenPagosPorAnio,
  getResumenPorMes,
  getResumenPorAnio,
  getMesesYAniosConRegistros,
};
