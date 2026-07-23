import { request } from "../lib/clientApi";

const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  return JSON.parse(localStorage.getItem("user") || "null");
};

const getAllUsers = async () => request("users", "getAllUsers").catch(() => []);
const getUserData = async () => request("users", "getUserData", { uid: getStoredUser()?.uid }).catch(() => null);
const createUser = async (newUser, roles) => request("users", "createUser", { newUser, roles }).catch(() => null);
const updateUser = async (uid, updatedUser) => request("users", "updateUser", { uid, updatedUser }).catch(() => null);
const toggleUserStatus = async (uid, isActive) => request("users", "toggleUserStatus", { uid, isActive }).catch(() => null);
const getRoles = async () => request("users", "getRoles").catch(() => null);

export { getAllUsers, getUserData, createUser, updateUser, toggleUserStatus, getRoles };
