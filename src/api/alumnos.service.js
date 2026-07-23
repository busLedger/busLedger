import { authFetch } from "../lib/clientApi";

const createAlumno = (newAlumno) =>
  authFetch("/api/alumnos", {
    method: "POST",
    body: JSON.stringify(newAlumno),
  });
const updateAlumno = (alumnoId, updatedData) =>
  authFetch(`/api/alumnos/${alumnoId}`, {
    method: "PATCH",
    body: JSON.stringify(updatedData),
  });
const getAlumno = (alumnoId) => authFetch(`/api/alumnos/${alumnoId}`);
const getAlumnosByBus = (busId) =>
  authFetch(`/api/alumnos?busId=${encodeURIComponent(busId)}`);
const getAllAlumnosByUser = () => authFetch("/api/alumnos");
const toggleAlumnoStatus = (alumnoId, isActive) =>
  updateAlumno(alumnoId, { activo: isActive });
const deleteAlumno = (alumnoId) =>
  authFetch(`/api/alumnos/${alumnoId}`, { method: "DELETE" });

export {
  createAlumno,
  updateAlumno,
  getAlumno,
  getAlumnosByBus,
  getAllAlumnosByUser,
  toggleAlumnoStatus,
  deleteAlumno,
};
