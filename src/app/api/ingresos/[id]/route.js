import { errorResponse, isAdmin, verifyAuth } from "../../../../lib/auth";
import { getBus } from "../../../../server/buses";
import { deleteIngreso, getIngreso } from "../../../../server/ingresos";

const canManageBus = (auth, bus) =>
  isAdmin(auth) || bus.id_dueño === auth.uid;

const loadIngreso = async (params) => {
  const { id } = await params;
  const ingresoId = Number(id);
  if (!Number.isInteger(ingresoId) || ingresoId <= 0) {
    return { error: "ID inválido", status: 400 };
  }
  const ingreso = await getIngreso(ingresoId);
  if (!ingreso) return { error: "Ingreso no encontrado", status: 404 };
  const bus = await getBus(ingreso.id_bus);
  if (!bus) return { error: "Unidad no encontrada", status: 404 };
  return { ingreso, bus };
};

export async function GET(request, { params }) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);

  try {
    const resource = await loadIngreso(params);
    if (resource.error) return errorResponse(resource.error, resource.status);
    if (!canManageBus(auth.data, resource.bus)) {
      return errorResponse("No tienes acceso a este ingreso", 403);
    }
    return Response.json({ data: resource.ingreso });
  } catch (error) {
    console.error("GET /api/ingresos/[id]:", error);
    return errorResponse("Error al consultar el ingreso", 500);
  }
}

export async function DELETE(request, { params }) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);

  try {
    const resource = await loadIngreso(params);
    if (resource.error) return errorResponse(resource.error, resource.status);
    if (!canManageBus(auth.data, resource.bus)) {
      return errorResponse("No tienes permiso para eliminar este ingreso", 403);
    }

    const data = await deleteIngreso(resource.ingreso);
    return Response.json({ data });
  } catch (error) {
    console.error("DELETE /api/ingresos/[id]:", error);
    return errorResponse("Error al eliminar el ingreso", 500);
  }
}
