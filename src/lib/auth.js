import { getAdminAuth } from "./firebaseAdmin";
import { query } from "./db";

const errorResponse = (error, status) =>
  Response.json({ error }, { status });

const isAdmin = (auth) => auth.roles.includes("Admin");
const hasRole = (auth, roles) =>
  isAdmin(auth) || roles.some((role) => auth.roles.includes(role));

const verifyAuth = async (request) => {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return { error: "No autorizado", status: 401, data: null };
  }

  let decodedToken;
  try {
    decodedToken = await getAdminAuth().verifyIdToken(authorization.slice(7));
  } catch {
    return { error: "Token inválido o expirado", status: 401, data: null };
  }

  try {
    const { rows } = await query(
      `
      SELECT
        u.uid,
        u.nombre,
        u.correo,
        u.activo,
        COALESCE(json_agg(r.nombre) FILTER (WHERE r.nombre IS NOT NULL), '[]') AS roles
      FROM usuarios u
      LEFT JOIN usuarios_roles ur ON ur.uid_usuario = u.uid
      LEFT JOIN roles r ON r.id = ur.id_rol
      WHERE u.uid = $1
      GROUP BY u.uid
      `,
      [decodedToken.uid]
    );

    const user = rows[0];
    if (!user) {
      return { error: "Usuario no encontrado", status: 404, data: null };
    }
    if (!user.activo) {
      return { error: "Esta cuenta ha sido deshabilitada", status: 403, data: null };
    }

    return {
      error: null,
      status: 200,
      data: {
        ...user,
        firebaseUid: decodedToken.uid,
        emailVerified: decodedToken.email_verified ?? false,
      },
    };
  } catch (error) {
    console.error("Error verificando autenticación:", error);
    return { error: "Error interno del servidor", status: 500, data: null };
  }
};

export { errorResponse, hasRole, isAdmin, verifyAuth };
