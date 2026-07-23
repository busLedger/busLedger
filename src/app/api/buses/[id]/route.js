import { errorResponse, hasRole, isAdmin, verifyAuth } from "../../../../lib/auth";
import {
  deleteBus,
  getBus,
  getFinancialBuses,
  updateBus,
} from "../../../../server/buses";

const canAccessBus = (auth, bus) =>
  isAdmin(auth) ||
  bus.id_dueño === auth.uid ||
  bus.id_conductor === auth.uid;

const canManageBus = (auth, bus) =>
  isAdmin(auth) || bus.id_dueño === auth.uid;

const loadBus = async (params) => {
  const { id } = await params;
  const busId = Number(id);
  if (!Number.isInteger(busId) || busId <= 0) return { error: "ID inválido" };
  return { busId, bus: await getBus(busId) };
};

export async function GET(request, { params }) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);
  if (!hasRole(auth.data, ["Dueño", "Conductor"])) {
    return errorResponse("No tienes permiso para consultar unidades", 403);
  }

  try {
    const loaded = await loadBus(params);
    if (loaded.error) return errorResponse(loaded.error, 400);
    if (!loaded.bus) return errorResponse("Unidad no encontrada", 404);
    if (!canAccessBus(auth.data, loaded.bus)) {
      return errorResponse("No tienes acceso a esta unidad", 403);
    }

    const { searchParams } = new URL(request.url);
    const data =
      searchParams.get("view") === "financials"
        ? (await getFinancialBuses({ busId: loaded.busId }))[0] || null
        : loaded.bus;
    return Response.json({ data });
  } catch (error) {
    console.error("GET /api/buses/[id]:", error);
    return errorResponse("Error al consultar la unidad", 500);
  }
}

export async function PATCH(request, { params }) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);

  try {
    const loaded = await loadBus(params);
    if (loaded.error) return errorResponse(loaded.error, 400);
    if (!loaded.bus) return errorResponse("Unidad no encontrada", 404);
    if (!canManageBus(auth.data, loaded.bus)) {
      return errorResponse("No tienes permiso para editar esta unidad", 403);
    }

    const body = await request.json();
    if (!isAdmin(auth.data)) delete body.id_dueño;
    const data = await updateBus(loaded.busId, body);
    return Response.json({ data });
  } catch (error) {
    console.error("PATCH /api/buses/[id]:", error);
    return errorResponse("Error al actualizar la unidad", 500);
  }
}

export async function DELETE(request, { params }) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);

  try {
    const loaded = await loadBus(params);
    if (loaded.error) return errorResponse(loaded.error, 400);
    if (!loaded.bus) return errorResponse("Unidad no encontrada", 404);
    if (!canManageBus(auth.data, loaded.bus)) {
      return errorResponse("No tienes permiso para eliminar esta unidad", 403);
    }

    const data = await deleteBus(loaded.busId);
    return Response.json({ data });
  } catch (error) {
    console.error("DELETE /api/buses/[id]:", error);
    return errorResponse("Error al eliminar la unidad", 500);
  }
}
