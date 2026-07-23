import { authFetch } from "../lib/clientApi";

const createGasto = (newGasto) =>
  authFetch("/api/gastos", {
    method: "POST",
    body: JSON.stringify(newGasto),
  });
const getGasto = (gastoId) => authFetch(`/api/gastos/${gastoId}`);
const getGastosByBus = (busId) =>
  authFetch(`/api/gastos?busId=${encodeURIComponent(busId)}`);
const getGastosByUser = () => authFetch("/api/gastos");
const deleteGasto = (gastoId) =>
  authFetch(`/api/gastos/${gastoId}`, { method: "DELETE" });
const getMesesYAniosConRegistros = () =>
  authFetch("/api/gastos/periodos");

export {
  createGasto,
  getGasto,
  getGastosByBus,
  getGastosByUser,
  deleteGasto,
  getMesesYAniosConRegistros,
};
