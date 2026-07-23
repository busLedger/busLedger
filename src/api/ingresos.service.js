import { request } from "../lib/clientApi";

const createIngreso = async (newIngreso) => request("ingresos", "createIngreso", { newIngreso }).catch(() => null);
const getIngreso = async (ingresoId) => request("ingresos", "getIngreso", { ingresoId }).catch(() => null);
const getIngresosByBus = async (busId) => request("ingresos", "getIngresosByBus", { busId }).catch(() => []);
const getIngresosByUser = async (userId) => request("ingresos", "getIngresosByUser", { userId }).catch(() => []);
const deleteIngreso = async (ingreso) => request("ingresos", "deleteIngreso", { ingreso }).catch(() => false);
const getMesesYAniosConRegistros = async (userId) => request("ingresos", "getMesesYAniosConRegistros", { userId }).catch(() => []);
const getResumenFinancieroPorMes = async (userId, anio, mes) =>
  request("ingresos", "getResumenFinancieroPorMes", { userId, anio, mes }).catch(() => ({
    totalIngresos: 0,
    totalGastos: 0,
    disponibleMes: 0,
    disponibleAcumulado: 0,
  }));

export {
  createIngreso,
  getIngreso,
  getIngresosByBus,
  getIngresosByUser,
  deleteIngreso,
  getMesesYAniosConRegistros,
  getResumenFinancieroPorMes,
};
