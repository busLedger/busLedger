import { authFetch } from "../lib/clientApi";

const getAllUsers = () => authFetch("/api/usuarios");
const getUserData = () => authFetch("/api/usuarios/me");
const createUser = (newUser, roles) =>
  authFetch("/api/usuarios", {
    method: "POST",
    body: JSON.stringify({ ...newUser, roles }),
  });
const updateUser = (uid, updatedUser) =>
  authFetch(`/api/usuarios/${encodeURIComponent(uid)}`, {
    method: "PATCH",
    body: JSON.stringify(updatedUser),
  });
const toggleUserStatus = (uid, isActive) => updateUser(uid, { activo: isActive });
const getRoles = () => authFetch("/api/usuarios/roles");

export { getAllUsers, getUserData, createUser, updateUser, toggleUserStatus, getRoles };
