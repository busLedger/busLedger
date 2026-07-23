import { request } from "../lib/clientApi";

const createGasto = async (newGasto) => request("gastos", "createGasto", { newGasto }).catch(() => null);
const getGasto = async (gastoId) => request("gastos", "getGasto", { gastoId }).catch(() => null);
const getGastosByBus = async (busId) => request("gastos", "getGastosByBus", { busId }).catch(() => []);
const getGastosByUser = async (userId) => request("gastos", "getGastosByUser", { userId }).catch(() => []);
const deleteGasto = async (gastoId) => request("gastos", "deleteGasto", { gastoId }).catch(() => false);
const getMesesYAniosConRegistros = async (userId) => request("gastos", "getMesesYAniosConRegistros", { userId }).catch(() => []);

export {
  createGasto,
  getGasto,
  getGastosByBus,
  getGastosByUser,
  deleteGasto,
  getMesesYAniosConRegistros,
};
