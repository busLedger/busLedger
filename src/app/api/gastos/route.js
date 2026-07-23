import { errorResponse, hasRole, isAdmin, verifyAuth } from "../../../lib/auth";
import { getBus } from "../../../server/buses";
import {
  createGasto,
  getAccessibleBusesWithGastos,
  getGastosByBus,
} from "../../../server/gastos";

const canViewFinancials = (auth, bus) =>
  isAdmin(auth) || bus.id_dueño === auth.uid;

const canRegisterExpense = (auth, bus) =>
  canViewFinancials(auth, bus) || bus.id_conductor === auth.uid;

export async function GET(request) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);
  if (!hasRole(auth.data, ["Dueño"])) {
    return errorResponse("No tienes permiso para consultar gastos", 403);
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
      if (!canViewFinancials(auth.data, bus)) {
        return errorResponse("No tienes acceso a los gastos de esta unidad", 403);
      }
      return Response.json({ data: await getGastosByBus(busId) });
    }

    const data = await getAccessibleBusesWithGastos(
      auth.data.uid,
      isAdmin(auth.data)
    );
    return Response.json({ data });
  } catch (error) {
    console.error("GET /api/gastos:", error);
    return errorResponse("Error al consultar gastos", 500);
  }
}

export async function POST(request) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);
  if (!hasRole(auth.data, ["Dueño", "Conductor"])) {
    return errorResponse("No tienes permiso para registrar gastos", 403);
  }

  try {
    const body = await request.json();
    const busId = Number(body.id_bus);
    const monto = Number(body.monto);
    if (
      !Number.isInteger(busId) ||
      busId <= 0 ||
      !body.descripcion_gasto?.trim() ||
      !body.fecha_gasto ||
      !Number.isFinite(monto) ||
      monto <= 0
    ) {
      return errorResponse("Los datos del gasto no son válidos", 400);
    }

    const bus = await getBus(busId);
    if (!bus) return errorResponse("Unidad no encontrada", 404);
    if (!canRegisterExpense(auth.data, bus)) {
      return errorResponse("No puedes registrar gastos en esta unidad", 403);
    }

    const data = await createGasto({
      id_bus: busId,
      descripcion_gasto: body.descripcion_gasto.trim(),
      monto,
      fecha_gasto: body.fecha_gasto,
    });
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/gastos:", error);
    return errorResponse("Error al registrar el gasto", 500);
  }
}
