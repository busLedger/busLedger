import { errorResponse, isAdmin, verifyAuth } from "../../../../lib/auth";
import { getAdminAuth } from "../../../../lib/firebaseAdmin";
import { getUser, updateUser } from "../../../../server/usuarios";

export async function PATCH(request, { params }) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);
  if (!isAdmin(auth.data)) return errorResponse("Se requiere rol de administrador", 403);

  try {
    const { uid } = await params;
    if (!(await getUser(uid))) return errorResponse("Usuario no encontrado", 404);
    const body = await request.json();
    if (body.activo !== undefined && typeof body.activo !== "boolean") {
      return errorResponse("El estado activo debe ser booleano", 400);
    }

    if (body.activo !== undefined) {
      try {
        await getAdminAuth().updateUser(uid, { disabled: !body.activo });
      } catch (error) {
        if (error.code !== "auth/user-not-found") throw error;
      }
    }

    return Response.json({ data: await updateUser(uid, body) });
  } catch (error) {
    if (error.code === "23505") {
      return errorResponse("El correo o WhatsApp ya está registrado", 409);
    }
    console.error("PATCH /api/usuarios/[uid]:", error);
    return errorResponse("Error al actualizar el usuario", 500);
  }
}
