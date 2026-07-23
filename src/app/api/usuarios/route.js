import { errorResponse, hasRole, isAdmin, verifyAuth } from "../../../lib/auth";
import { getAdminAuth } from "../../../lib/firebaseAdmin";
import { createUser, getUsers, validateRoleIds } from "../../../server/usuarios";

export async function GET(request) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);
  if (!isAdmin(auth.data)) return errorResponse("Se requiere rol de administrador", 403);

  try {
    return Response.json({ data: await getUsers() });
  } catch (error) {
    console.error("GET /api/usuarios:", error);
    return errorResponse("Error al consultar usuarios", 500);
  }
}

export async function POST(request) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);
  if (!hasRole(auth.data, ["Dueño"])) {
    return errorResponse("No tienes permiso para registrar usuarios", 403);
  }

  try {
    const body = await request.json();
    const roles = await validateRoleIds(Array.isArray(body.roles) ? body.roles : []);
    if (
      !body.nombre?.trim() ||
      !body.correo?.trim() ||
      !roles ||
      (!isAdmin(auth.data) && (roles.length !== 1 || roles[0].nombre !== "Conductor"))
    ) {
      return errorResponse("Los datos o roles del usuario no son válidos", 400);
    }

    let uid = null;
    if (isAdmin(auth.data)) {
      if (!body.uid) return errorResponse("El UID de Firebase es requerido", 400);
      try {
        const firebaseUser = await getAdminAuth().getUser(body.uid);
        if (
          firebaseUser.email &&
          firebaseUser.email.toLowerCase() !== body.correo.trim().toLowerCase()
        ) {
          return errorResponse("El correo no coincide con el usuario de Firebase", 409);
        }
        uid = firebaseUser.uid;
      } catch (error) {
        if (error.code === "auth/user-not-found") {
          return errorResponse("El UID no existe en Firebase", 404);
        }
        throw error;
      }
    }

    const user = await createUser({
      uid,
      nombre: body.nombre.trim(),
      correo: body.correo.trim().toLowerCase(),
      whatsapp: body.whatsapp?.trim() || null,
      roleIds: roles.map((role) => role.id),
    });
    const data = { ...user, roles: roles.map((role) => role.nombre) };
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    if (error.code === "23505") {
      return errorResponse("El correo, WhatsApp o UID ya está registrado", 409);
    }
    console.error("POST /api/usuarios:", error);
    return errorResponse("Error al registrar el usuario", 500);
  }
}
