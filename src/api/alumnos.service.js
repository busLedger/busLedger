import { request } from "../lib/clientApi";

const createAlumno = async (newAlumno) => request("alumnos", "createAlumno", { newAlumno }).catch(() => null);
const updateAlumno = async (alumnoId, updatedData) => request("alumnos", "updateAlumno", { alumnoId, updatedData }).catch(() => null);
const getAlumno = async (alumnoId) => request("alumnos", "getAlumno", { alumnoId }).catch(() => null);
const getAlumnosByBus = async (busId) => request("alumnos", "getAlumnosByBus", { busId }).catch(() => []);
const getAllAlumnosByUser = async (userId) => request("alumnos", "getAllAlumnosByUser", { userId }).catch(() => []);
const toggleAlumnoStatus = async (alumnoId, isActive) => request("alumnos", "toggleAlumnoStatus", { alumnoId, isActive }).catch(() => null);
const deleteAlumno = async (alumnoId) => request("alumnos", "deleteAlumno", { alumnoId }).catch(() => false);

export {
  createAlumno,
  updateAlumno,
  getAlumno,
  getAlumnosByBus,
  getAllAlumnosByUser,
  toggleAlumnoStatus,
  deleteAlumno,
};
