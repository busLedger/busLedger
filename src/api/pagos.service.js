import { request } from "../lib/clientApi";

const registrarPagoAlumno = async (pagoData, alumnoData) =>
  request("pagos", "registrarPagoAlumno", { pagoData, alumnoData }).catch(() => null);

const obtenerPagosAlumno = async (alumnoId, anio_correspondiente) =>
  request("pagos", "obtenerPagosAlumno", { alumnoId, anio_correspondiente }).catch(() => []);

const eliminarPagoAlumno = async (data) =>
  request("pagos", "eliminarPagoAlumno", { data }).catch(() => false);

export {
  registrarPagoAlumno,
  obtenerPagosAlumno,
  eliminarPagoAlumno,
};
