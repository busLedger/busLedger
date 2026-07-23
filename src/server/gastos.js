import { query } from "../lib/db";

const OWNER_COLUMN = '"id_dueño"';

const getGasto = async (gastoId) => {
  const { rows } = await query("SELECT * FROM gastos WHERE id = $1", [gastoId]);
  return rows[0] || null;
};

const getGastosByBus = async (busId) => {
  const { rows } = await query(
    "SELECT * FROM gastos WHERE id_bus = $1 ORDER BY fecha_gasto DESC",
    [busId]
  );
  return rows;
};

const getAccessibleBusesWithGastos = async (uid, includeAll = false) => {
  const params = includeAll ? [] : [uid];
  const where = includeAll ? "" : `WHERE b.${OWNER_COLUMN} = $1`;
  const { rows } = await query(
    `
    SELECT
      b.*,
      COALESCE(
        json_agg(g.* ORDER BY g.fecha_gasto DESC) FILTER (WHERE g.id IS NOT NULL),
        '[]'
      ) AS gastos
    FROM buses b
    LEFT JOIN gastos g ON g.id_bus = b.id
    ${where}
    GROUP BY b.id
    ORDER BY b.nombre_ruta
    `,
    params
  );
  return rows;
};

const createGasto = async (values) => {
  const { rows } = await query(
    `
    INSERT INTO gastos (id_bus, descripcion_gasto, monto, fecha_gasto)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [values.id_bus, values.descripcion_gasto, values.monto, values.fecha_gasto]
  );
  return rows[0];
};

const deleteGasto = async (gastoId) => {
  const { rowCount } = await query("DELETE FROM gastos WHERE id = $1", [
    gastoId,
  ]);
  return rowCount > 0;
};

export {
  createGasto,
  deleteGasto,
  getAccessibleBusesWithGastos,
  getGasto,
  getGastosByBus,
};
