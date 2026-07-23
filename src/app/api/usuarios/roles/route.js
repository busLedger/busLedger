import { errorResponse, hasRole, verifyAuth } from "../../../../lib/auth";
import { getRoles } from "../../../../server/usuarios";

export async function GET(request) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);
  if (!hasRole(auth.data, ["Dueño"])) {
    return errorResponse("No tienes permiso para consultar roles", 403);
  }
  try {
    return Response.json({ data: await getRoles() });
  } catch (error) {
    console.error("GET /api/usuarios/roles:", error);
    return errorResponse("Error al consultar roles", 500);
  }
}
