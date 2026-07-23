import { request } from "../lib/clientApi";

const createBus = async (newBus) => request("buses", "createBus", { newBus }).catch(() => null);
const getBusWithFinancials = async (busId) => request("buses", "getBusWithFinancials", { busId }).catch(() => null);
const getBusesWithFinancials = async (userId) => request("buses", "getBusesWithFinancials", { userId }).catch(() => []);
const getAllBusesWithFinancials = async () => request("buses", "getAllBusesWithFinancials").catch(() => []);
const updateBus = async (busId, updatedData) => request("buses", "updateBus", { busId, updatedData }).catch(() => null);
const getBusesByUser = async (userId) => request("buses", "getBusesByUser", { userId }).catch(() => []);
const deleteBus = async (busId) => request("buses", "deleteBus", { busId }).catch(() => false);

export {
  getBusesByUser,
  createBus,
  getBusWithFinancials,
  getBusesWithFinancials,
  updateBus,
  deleteBus,
  getAllBusesWithFinancials,
};
