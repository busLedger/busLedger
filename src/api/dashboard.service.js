import { request } from "../lib/clientApi";

const getResumenPagosPorMes = async (userId, mes, anio) =>
  request("dashboard", "getResumenPagosPorMes", { userId, mes, anio }).catch(() => null);

const getResumenPagosPorAnio = async (userId, anio) =>
  request("dashboard", "getResumenPagosPorAnio", { userId, anio }).catch(() => null);

const getResumenPorMes = async (userId, anio, mes) =>
  request("dashboard", "getResumenPorMes", { userId, anio, mes }).catch(() => null);

const getResumenPorAnio = async (userId, anio) =>
  request("dashboard", "getResumenPorAnio", { userId, anio }).catch(() => null);

const getMesesYAniosConRegistros = async (userId) =>
  request("dashboard", "getMesesYAniosConRegistros", { userId }).catch(() => []);

export {
  getResumenPagosPorMes,
  getResumenPagosPorAnio,
  getResumenPorMes,
  getResumenPorAnio,
  getMesesYAniosConRegistros,
};
