import { authFetch } from "../lib/clientApi";

const registrarPagoAlumno = (pagoData) =>
  authFetch("/api/pagos", {
    method: "POST",
    body: JSON.stringify(pagoData),
  });

const obtenerPagosAlumno = (alumnoId, anio_correspondiente) =>
  authFetch(
    `/api/pagos?alumnoId=${encodeURIComponent(alumnoId)}&anio=${encodeURIComponent(anio_correspondiente)}`
  );

const eliminarPagoAlumno = (data) =>
  authFetch(`/api/pagos/${data.id}`, { method: "DELETE" });

export {
  registrarPagoAlumno,
  obtenerPagosAlumno,
  eliminarPagoAlumno,
};
