import { errorResponse, hasRole, isAdmin, verifyAuth } from "../../../../lib/auth";
import { getDashboardSummary } from "../../../../server/dashboard";

export async function GET(request) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);
  if (!hasRole(auth.data, ["Dueño"])) {
    return errorResponse("No tienes permiso para consultar el dashboard", 403);
  }

  try {
    const { searchParams } = new URL(request.url);
    const anio = Number(searchParams.get("anio"));
    const mes = searchParams.get("mes") || undefined;
    if (!Number.isInteger(anio) || anio < 2000 || anio > 2100) {
      return errorResponse("Año inválido", 400);
    }
    const data = await getDashboardSummary({
      uid: auth.data.uid,
      anio,
      mes,
      includeAll: isAdmin(auth.data),
    });
    return Response.json({ data });
  } catch (error) {
    if (error.message === "MES_INVALIDO") return errorResponse("Mes inválido", 400);
    console.error("GET /api/dashboard/resumen:", error);
    return errorResponse("Error al consultar el dashboard", 500);
  }
}
