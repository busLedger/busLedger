import { authFetch } from "../lib/clientApi";

const createBus = (newBus) =>
  authFetch("/api/buses", { method: "POST", body: JSON.stringify(newBus) });
const getBusWithFinancials = (busId) =>
  authFetch(`/api/buses/${busId}?view=financials`);
const getBusesWithFinancials = () =>
  authFetch("/api/buses?view=financials");
const getAllBusesWithFinancials = () =>
  authFetch("/api/buses?view=financials&all=true");
const updateBus = (busId, updatedData) =>
  authFetch(`/api/buses/${busId}`, {
    method: "PATCH",
    body: JSON.stringify(updatedData),
  });
const getBusesByUser = () => authFetch("/api/buses");
const deleteBus = (busId) =>
  authFetch(`/api/buses/${busId}`, { method: "DELETE" });

export {
  getBusesByUser,
  createBus,
  getBusWithFinancials,
  getBusesWithFinancials,
  updateBus,
  deleteBus,
  getAllBusesWithFinancials,
};
