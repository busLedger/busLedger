import { errorResponse, hasRole, isAdmin, verifyAuth } from "../../../lib/auth";
import { getBus } from "../../../server/buses";
import {
  createIngreso,
  getAccessibleBusesWithIngresos,
  getIngresosByBus,
} from "../../../server/ingresos";

const canManageBus = (auth, bus) =>
  isAdmin(auth) || bus.id_dueño === auth.uid;

export async function GET(request) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);
  if (!hasRole(auth.data, ["Dueño"])) {
    return errorResponse("No tienes permiso para consultar ingresos", 403);
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
      if (!canManageBus(auth.data, bus)) {
        return errorResponse("No tienes acceso a los ingresos de esta unidad", 403);
      }
      return Response.json({ data: await getIngresosByBus(busId) });
    }

    const data = await getAccessibleBusesWithIngresos(
      auth.data.uid,
      isAdmin(auth.data)
    );
    return Response.json({ data });
  } catch (error) {
    console.error("GET /api/ingresos:", error);
    return errorResponse("Error al consultar ingresos", 500);
  }
}

export async function POST(request) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);
  if (!hasRole(auth.data, ["Dueño"])) {
    return errorResponse("No tienes permiso para registrar ingresos", 403);
  }

  try {
    const body = await request.json();
    const busId = Number(body.id_bus);
    const total = Number(body.total_ingreso);
    if (
      !Number.isInteger(busId) ||
      busId <= 0 ||
      !body.descripcion_ingreso?.trim() ||
      !body.fecha ||
      !Number.isFinite(total) ||
      total <= 0
    ) {
      return errorResponse("Los datos del ingreso no son válidos", 400);
    }

    const bus = await getBus(busId);
    if (!bus) return errorResponse("Unidad no encontrada", 404);
    if (!canManageBus(auth.data, bus)) {
      return errorResponse("No puedes registrar ingresos en esta unidad", 403);
    }

    const data = await createIngreso({
      id_bus: busId,
      fecha: body.fecha,
      descripcion_ingreso: body.descripcion_ingreso.trim(),
      total_ingreso: total,
    });
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/ingresos:", error);
    return errorResponse("Error al registrar el ingreso", 500);
  }
}
