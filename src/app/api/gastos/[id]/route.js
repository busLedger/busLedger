import { errorResponse, isAdmin, verifyAuth } from "../../../../lib/auth";
import { getBus } from "../../../../server/buses";
import { deleteGasto, getGasto } from "../../../../server/gastos";

const canManageExpense = (auth, bus) =>
  isAdmin(auth) || bus.id_dueño === auth.uid;

const loadGasto = async (params) => {
  const { id } = await params;
  const gastoId = Number(id);
  if (!Number.isInteger(gastoId) || gastoId <= 0) {
    return { error: "ID inválido", status: 400 };
  }
  const gasto = await getGasto(gastoId);
  if (!gasto) return { error: "Gasto no encontrado", status: 404 };
  const bus = await getBus(gasto.id_bus);
  if (!bus) return { error: "Unidad no encontrada", status: 404 };
  return { gastoId, gasto, bus };
};

export async function GET(request, { params }) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);

  try {
    const resource = await loadGasto(params);
    if (resource.error) return errorResponse(resource.error, resource.status);
    if (!canManageExpense(auth.data, resource.bus)) {
      return errorResponse("No tienes acceso a este gasto", 403);
    }
    return Response.json({ data: resource.gasto });
  } catch (error) {
    console.error("GET /api/gastos/[id]:", error);
    return errorResponse("Error al consultar el gasto", 500);
  }
}

export async function DELETE(request, { params }) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);

  try {
    const resource = await loadGasto(params);
    if (resource.error) return errorResponse(resource.error, resource.status);
    if (!canManageExpense(auth.data, resource.bus)) {
      return errorResponse("No tienes permiso para eliminar este gasto", 403);
    }

    const data = await deleteGasto(resource.gastoId);
    return Response.json({ data });
  } catch (error) {
    console.error("DELETE /api/gastos/[id]:", error);
    return errorResponse("Error al eliminar el gasto", 500);
  }
}
