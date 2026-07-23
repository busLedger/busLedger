import { errorResponse, verifyAuth } from "../../../../lib/auth";
import { getUser } from "../../../../server/usuarios";

export async function GET(request) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);
  try {
    return Response.json({ data: await getUser(auth.data.uid) });
  } catch (error) {
    console.error("GET /api/usuarios/me:", error);
    return errorResponse("Error al consultar el perfil", 500);
  }
}
