import { query } from "../lib/db";

const OWNER_COLUMN = '"id_dueño"';

const getBus = async (busId) => {
  const { rows } = await query("SELECT * FROM buses WHERE id = $1", [busId]);
  return rows[0] || null;
};

const getOwnedBuses = async (uid) => {
  const { rows } = await query(
    `SELECT * FROM buses WHERE ${OWNER_COLUMN} = $1`,
    [uid]
  );
  return rows;
};

const getFinancialBuses = async ({ busId, uid } = {}) => {
  const params = [];
  let where = "";

  if (busId !== undefined) {
    params.push(busId);
    where = "WHERE b.id = $1";
  } else if (uid) {
    params.push(uid);
    where = `WHERE b.${OWNER_COLUMN} = $1`;
  }

  const { rows } = await query(
    `
    SELECT
      b.*,
      dueno.nombre AS "dueño",
      conductor.nombre AS conductor,
      COALESCE(alumnos.items, '[]'::json) AS alumnos,
      COALESCE(ingresos.items, '[]'::json) AS ingresos,
      COALESCE(gastos.items, '[]'::json) AS gastos,
      COALESCE(salarios.total, 0) AS salario,
      COALESCE(ingresos.total, 0) AS "totalIngresos",
      COALESCE(gastos.total, 0) AS "totalGastos",
      COALESCE(alumnos.total, 0) AS "totalAlumnos",
      COALESCE(ingresos.total, 0) - COALESCE(gastos.total, 0) -
        COALESCE(salarios.total, 0) AS balance
    FROM buses b
    LEFT JOIN usuarios dueno ON dueno.uid = b.${OWNER_COLUMN}
    LEFT JOIN usuarios conductor ON conductor.uid = b.id_conductor
    LEFT JOIN LATERAL (
      SELECT json_agg(a.*) AS items, COUNT(*)::int AS total
      FROM alumnos a WHERE a.id_bus = b.id
    ) alumnos ON true
    LEFT JOIN LATERAL (
      SELECT json_agg(i.*) AS items, COALESCE(SUM(i.total_ingreso), 0) AS total
      FROM ingresos i WHERE i.id_bus = b.id
    ) ingresos ON true
    LEFT JOIN LATERAL (
      SELECT json_agg(g.*) AS items, COALESCE(SUM(g.monto), 0) AS total
      FROM gastos g WHERE g.id_bus = b.id
    ) gastos ON true
    LEFT JOIN LATERAL (
      SELECT COALESCE(SUM(s.monto), 0) AS total
      FROM salarios_conductores s WHERE s.id_bus = b.id
    ) salarios ON true
    ${where}
    `,
    params
  );

  return rows.map((row) => ({
    ...row,
    dueño: row.dueño || "Desconocido",
    conductor: row.conductor || "Desconocido",
  }));
};

const createBus = async (values) => {
  const allowed = [
    "placa",
    "modelo",
    "año",
    "id_dueño",
    "id_conductor",
    "nombre_ruta",
  ];
  const keys = allowed.filter((key) => values[key] !== undefined);
  const columns = keys.map((key) => `"${key}"`).join(", ");
  const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");
  const { rows } = await query(
    `INSERT INTO buses (${columns}) VALUES (${placeholders}) RETURNING *`,
    keys.map((key) => values[key])
  );
  return rows[0];
};

const updateBus = async (busId, values) => {
  const allowed = [
    "placa",
    "modelo",
    "año",
    "id_dueño",
    "id_conductor",
    "nombre_ruta",
  ];
  const keys = allowed.filter((key) => values[key] !== undefined);
  if (!keys.length) return getBus(busId);

  const setClause = keys
    .map((key, index) => `"${key}" = $${index + 1}`)
    .join(", ");
  const params = [...keys.map((key) => values[key]), busId];
  const { rows } = await query(
    `UPDATE buses SET ${setClause} WHERE id = $${params.length} RETURNING *`,
    params
  );
  return rows[0] || null;
};

const deleteBus = async (busId) => {
  const { rowCount } = await query("DELETE FROM buses WHERE id = $1", [busId]);
  return rowCount > 0;
};

export {
  createBus,
  deleteBus,
  getBus,
  getFinancialBuses,
  getOwnedBuses,
  updateBus,
};
