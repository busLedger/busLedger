import { errorResponse, hasRole, isAdmin, verifyAuth } from "../../../lib/auth";
import {
  createAlumno,
  getAccessibleBusesWithAlumnos,
  getAlumnosByBus,
} from "../../../server/alumnos";
import { getBus } from "../../../server/buses";

const canAccessBus = (auth, bus) =>
  isAdmin(auth) ||
  bus.id_dueño === auth.uid ||
  bus.id_conductor === auth.uid;

const canManageBus = (auth, bus) =>
  isAdmin(auth) || bus.id_dueño === auth.uid;

export async function GET(request) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);
  if (!hasRole(auth.data, ["Dueño", "Conductor"])) {
    return errorResponse("No tienes permiso para consultar alumnos", 403);
  }

  try {
    const { searchParams } = new URL(request.url);
    const busIdParam = searchParams.get("busId");

    if (busIdParam) {
      const busId = Number(busIdParam);
      if (!Number.isInteger(busId) || busId <= 0) {
        return errorResponse("ID de unidad inválido", 400);
      }
      const bus = await getBus(busId);
      if (!bus) return errorResponse("Unidad no encontrada", 404);
      if (!canAccessBus(auth.data, bus)) {
        return errorResponse("No tienes acceso a esta unidad", 403);
      }
      return Response.json({ data: await getAlumnosByBus(busId) });
    }

    const data = await getAccessibleBusesWithAlumnos(
      auth.data.uid,
      isAdmin(auth.data)
    );
    return Response.json({ data });
  } catch (error) {
    console.error("GET /api/alumnos:", error);
    return errorResponse("Error al consultar alumnos", 500);
  }
}

export async function POST(request) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);
  if (!hasRole(auth.data, ["Dueño"])) {
    return errorResponse("No tienes permiso para registrar alumnos", 403);
  }

  try {
    const body = await request.json();
    const busId = Number(body.id_bus);
    const bus = await getBus(busId);
    if (!bus) return errorResponse("Unidad no encontrada", 404);
    if (!canManageBus(auth.data, bus)) {
      return errorResponse("No puedes registrar alumnos en esta unidad", 403);
    }
    if (
      !body.nombre ||
      !body.encargado ||
      !body.no_encargado ||
      !body.direccion ||
      body.pago_mensual === undefined
    ) {
      return errorResponse("Faltan datos requeridos del alumno", 400);
    }

    const data = await createAlumno({ ...body, id_bus: busId });
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/alumnos:", error);
    return errorResponse("Error al registrar el alumno", 500);
  }
}
