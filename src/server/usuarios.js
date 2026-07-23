import { randomUUID } from "node:crypto";
import { query, transaction } from "../lib/db";

const getUser = async (uid) => {
  const { rows } = await query(
    `
    SELECT u.*,
      COALESCE(json_agg(r.nombre) FILTER (WHERE r.nombre IS NOT NULL), '[]') AS roles
    FROM usuarios u
    LEFT JOIN usuarios_roles ur ON ur.uid_usuario = u.uid
    LEFT JOIN roles r ON r.id = ur.id_rol
    WHERE u.uid = $1
    GROUP BY u.uid
    `,
    [uid]
  );
  return rows[0] || null;
};

const getUsers = async () => {
  const { rows } = await query(
    `
    SELECT u.*,
      COALESCE(json_agg(r.nombre) FILTER (WHERE r.nombre IS NOT NULL), '[]') AS roles
    FROM usuarios u
    LEFT JOIN usuarios_roles ur ON ur.uid_usuario = u.uid
    LEFT JOIN roles r ON r.id = ur.id_rol
    GROUP BY u.uid
    ORDER BY u.nombre
    `
  );
  return rows;
};

const getRoles = async () => {
  const { rows } = await query("SELECT * FROM roles ORDER BY id");
  return rows;
};

const validateRoleIds = async (roleIds) => {
  const normalized = [...new Set(roleIds.map(Number))];
  if (!normalized.length || normalized.some((id) => !Number.isInteger(id))) {
    return null;
  }
  const { rows } = await query(
    "SELECT id, nombre FROM roles WHERE id = ANY($1::int[])",
    [normalized]
  );
  return rows.length === normalized.length ? rows : null;
};

const createUser = async ({ uid, nombre, correo, whatsapp, roleIds }) =>
  transaction(async (client) => {
    const userUid = uid || randomUUID();
    const userResult = await client.query(
      `
      INSERT INTO usuarios (uid, nombre, correo, whatsapp, activo)
      VALUES ($1, $2, $3, $4, true)
      RETURNING *
      `,
      [userUid, nombre, correo, whatsapp || null]
    );
    for (const roleId of roleIds) {
      await client.query(
        "INSERT INTO usuarios_roles (uid_usuario, id_rol) VALUES ($1, $2)",
        [userUid, roleId]
      );
    }
    return userResult.rows[0];
  });

const updateUser = async (uid, values) => {
  const allowed = ["nombre", "correo", "whatsapp", "activo"];
  const keys = allowed.filter((key) => values[key] !== undefined);
  if (!keys.length) return getUser(uid);
  const setClause = keys
    .map((key, index) => `"${key}" = $${index + 1}`)
    .join(", ");
  const params = [...keys.map((key) => values[key]), uid];
  const { rows } = await query(
    `UPDATE usuarios SET ${setClause} WHERE uid = $${params.length} RETURNING *`,
    params
  );
  return rows[0] || null;
};

export {
  createUser,
  getRoles,
  getUser,
  getUsers,
  updateUser,
  validateRoleIds,
};
