import { errorResponse, hasRole, isAdmin, verifyAuth } from "../../../lib/auth";
import { getAlumno } from "../../../server/alumnos";
import { getBus } from "../../../server/buses";
import { createPago, getPagosByAlumno } from "../../../server/pagos";

const VALID_MONTHS = new Set([
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]);

const canManageBus = (auth, bus) =>
  isAdmin(auth) || bus.id_dueño === auth.uid;

const loadAlumnoAndBus = async (alumnoId) => {
  const alumno = await getAlumno(alumnoId);
  if (!alumno) return { error: "Alumno no encontrado", status: 404 };
  const bus = await getBus(alumno.id_bus);
  if (!bus) return { error: "Unidad del alumno no encontrada", status: 404 };
  return { alumno, bus };
};

export async function GET(request) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);
  if (!hasRole(auth.data, ["Dueño"])) {
    return errorResponse("No tienes permiso para consultar pagos", 403);
  }

  try {
    const { searchParams } = new URL(request.url);
    const alumnoId = Number(searchParams.get("alumnoId"));
    const anio = Number(searchParams.get("anio"));
    if (
      !Number.isInteger(alumnoId) ||
      alumnoId <= 0 ||
      !Number.isInteger(anio) ||
      anio < 2000 ||
      anio > 2100
    ) {
      return errorResponse("Alumno y año son requeridos", 400);
    }

    const resource = await loadAlumnoAndBus(alumnoId);
    if (resource.error) return errorResponse(resource.error, resource.status);
    if (!canManageBus(auth.data, resource.bus)) {
      return errorResponse("No tienes acceso a los pagos de este alumno", 403);
    }

    const data = await getPagosByAlumno(alumnoId, anio);
    return Response.json({ data });
  } catch (error) {
    console.error("GET /api/pagos:", error);
    return errorResponse("Error al consultar pagos", 500);
  }
}

export async function POST(request) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);
  if (!hasRole(auth.data, ["Dueño"])) {
    return errorResponse("No tienes permiso para registrar pagos", 403);
  }

  try {
    const body = await request.json();
    const alumnoId = Number(body.id_alumno);
    const monto = Number(body.monto);
    const anio = Number(body.anio_correspondiente);
    if (
      !Number.isInteger(alumnoId) ||
      alumnoId <= 0 ||
      !Number.isFinite(monto) ||
      monto <= 0 ||
      !body.fecha_pago ||
      !VALID_MONTHS.has(body.mes_correspondiente) ||
      !Number.isInteger(anio) ||
      anio < 2000 ||
      anio > 2100
    ) {
      return errorResponse("Los datos del pago no son válidos", 400);
    }

    const resource = await loadAlumnoAndBus(alumnoId);
    if (resource.error) return errorResponse(resource.error, resource.status);
    if (!canManageBus(auth.data, resource.bus)) {
      return errorResponse("No puedes registrar pagos para este alumno", 403);
    }

    const data = await createPago({
      alumno: resource.alumno,
      pago: {
        fecha_pago: body.fecha_pago,
        mes_correspondiente: body.mes_correspondiente,
        monto,
        anio_correspondiente: anio,
      },
    });
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    if (error.code === "PAGO_DUPLICADO" || error.code === "23505") {
      return errorResponse("El alumno ya tiene registrado ese mes", 409);
    }
    console.error("POST /api/pagos:", error);
    return errorResponse("Error al registrar el pago", 500);
  }
}
