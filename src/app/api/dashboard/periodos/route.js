import { errorResponse, hasRole, isAdmin, verifyAuth } from "../../../../lib/auth";
import { getPeriods } from "../../../../server/ingresos";

export async function GET(request) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);
  if (!hasRole(auth.data, ["Dueño"])) {
    return errorResponse("No tienes permiso para consultar periodos", 403);
  }
  try {
    const data = await getPeriods(auth.data.uid, isAdmin(auth.data));
    return Response.json({ data });
  } catch (error) {
    console.error("GET /api/dashboard/periodos:", error);
    return errorResponse("Error al consultar periodos", 500);
  }
}
