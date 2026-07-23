import { authFetch } from "../lib/clientApi";

const createIngreso = (newIngreso) =>
  authFetch("/api/ingresos", {
    method: "POST",
    body: JSON.stringify(newIngreso),
  });
const getIngreso = (ingresoId) => authFetch(`/api/ingresos/${ingresoId}`);
const getIngresosByBus = (busId) =>
  authFetch(`/api/ingresos?busId=${encodeURIComponent(busId)}`);
const getIngresosByUser = () => authFetch("/api/ingresos");
const deleteIngreso = (ingreso) =>
  authFetch(`/api/ingresos/${ingreso.id}`, { method: "DELETE" });
const getMesesYAniosConRegistros = () =>
  authFetch("/api/ingresos/periodos");
const getResumenFinancieroPorMes = (_userId, anio, mes) =>
  authFetch(
    `/api/ingresos/resumen?anio=${encodeURIComponent(anio)}&mes=${encodeURIComponent(mes)}`
  );

export {
  createIngreso,
  getIngreso,
  getIngresosByBus,
  getIngresosByUser,
  deleteIngreso,
  getMesesYAniosConRegistros,
  getResumenFinancieroPorMes,
};
