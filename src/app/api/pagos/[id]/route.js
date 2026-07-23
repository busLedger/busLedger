import { errorResponse, isAdmin, verifyAuth } from "../../../../lib/auth";
import { getBus } from "../../../../server/buses";
import { deletePago, getPago } from "../../../../server/pagos";

const canManageBus = (auth, bus) =>
  isAdmin(auth) || bus.id_dueño === auth.uid;

export async function DELETE(request, { params }) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);

  try {
    const { id } = await params;
    const pagoId = Number(id);
    if (!Number.isInteger(pagoId) || pagoId <= 0) {
      return errorResponse("ID inválido", 400);
    }

    const pago = await getPago(pagoId);
    if (!pago) return errorResponse("Pago no encontrado", 404);
    const bus = await getBus(pago.id_bus);
    if (!bus) return errorResponse("Unidad del alumno no encontrada", 404);
    if (!canManageBus(auth.data, bus)) {
      return errorResponse("No tienes permiso para eliminar este pago", 403);
    }

    const data = await deletePago(pagoId);
    return Response.json({ data });
  } catch (error) {
    console.error("DELETE /api/pagos/[id]:", error);
    return errorResponse("Error al eliminar el pago", 500);
  }
}
