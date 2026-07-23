import { query } from "../lib/db";

const OWNER_COLUMN = '"id_dueño"';
const ALLOWED_FIELDS = [
  "nombre",
  "encargado",
  "no_encargado",
  "id_bus",
  "direccion",
  "ubicacion",
  "activo",
  "pago_mensual",
];

const getAlumno = async (alumnoId) => {
  const { rows } = await query(
    `
    SELECT
      a.*,
      COALESCE(json_agg(p.*) FILTER (WHERE p.id IS NOT NULL), '[]') AS pagos_alumnos
    FROM alumnos a
    LEFT JOIN pagos_alumnos p ON p.id_alumno = a.id
    WHERE a.id = $1
    GROUP BY a.id
    `,
    [alumnoId]
  );
  return rows[0] || null;
};

const getAlumnosByBus = async (busId) => {
  const { rows } = await query(
    "SELECT * FROM alumnos WHERE id_bus = $1 ORDER BY nombre",
    [busId]
  );
  return rows;
};

const getAccessibleBusesWithAlumnos = async (uid, includeAll = false) => {
  const params = includeAll ? [] : [uid];
  const where = includeAll
    ? ""
    : `WHERE b.${OWNER_COLUMN} = $1 OR b.id_conductor = $1`;
  const { rows } = await query(
    `
    SELECT
      b.*,
      COALESCE(
        json_agg(a.* ORDER BY a.nombre) FILTER (WHERE a.id IS NOT NULL),
        '[]'
      ) AS alumnos
    FROM buses b
    LEFT JOIN alumnos a ON a.id_bus = b.id AND a.activo = true
    ${where}
    GROUP BY b.id
    ORDER BY b.nombre_ruta
    `,
    params
  );
  return rows;
};

const createAlumno = async (values) => {
  const keys = ALLOWED_FIELDS.filter((key) => values[key] !== undefined);
  const columns = keys.map((key) => `"${key}"`).join(", ");
  const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");
  const { rows } = await query(
    `INSERT INTO alumnos (${columns}) VALUES (${placeholders}) RETURNING *`,
    keys.map((key) => values[key])
  );
  return rows[0];
};

const updateAlumno = async (alumnoId, values) => {
  const keys = ALLOWED_FIELDS.filter((key) => values[key] !== undefined);
  if (!keys.length) return getAlumno(alumnoId);

  const setClause = keys
    .map((key, index) => `"${key}" = $${index + 1}`)
    .join(", ");
  const params = [...keys.map((key) => values[key]), alumnoId];
  const { rows } = await query(
    `UPDATE alumnos SET ${setClause} WHERE id = $${params.length} RETURNING *`,
    params
  );
  return rows[0] || null;
};

const deleteAlumno = async (alumnoId) => {
  const { rowCount } = await query("DELETE FROM alumnos WHERE id = $1", [
    alumnoId,
  ]);
  return rowCount > 0;
};

export {
  createAlumno,
  deleteAlumno,
  getAccessibleBusesWithAlumnos,
  getAlumno,
  getAlumnosByBus,
  updateAlumno,
};
