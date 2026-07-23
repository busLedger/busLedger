import { errorResponse, hasRole, isAdmin, verifyAuth } from "../../../../lib/auth";
import { getMonthlySummary } from "../../../../server/ingresos";

export async function GET(request) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);
  if (!hasRole(auth.data, ["Dueño"])) {
    return errorResponse("No tienes permiso para consultar el resumen", 403);
  }

  try {
    const { searchParams } = new URL(request.url);
    const anio = Number(searchParams.get("anio"));
    const mes = searchParams.get("mes");
    if (!Number.isInteger(anio) || anio < 2000 || anio > 2100 || !mes) {
      return errorResponse("Año y mes son requeridos", 400);
    }

    const data = await getMonthlySummary(
      auth.data.uid,
      anio,
      mes,
      isAdmin(auth.data)
    );
    return Response.json({ data });
  } catch (error) {
    if (error.message === "MES_INVALIDO") {
      return errorResponse("Mes inválido", 400);
    }
    console.error("GET /api/ingresos/resumen:", error);
    return errorResponse("Error al consultar el resumen financiero", 500);
  }
}
