import { query, transaction } from "../lib/db";

const OWNER_COLUMN = '"id_dueño"';
const MONTHS = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

const getIngreso = async (ingresoId) => {
  const { rows } = await query("SELECT * FROM ingresos WHERE id = $1", [
    ingresoId,
  ]);
  return rows[0] || null;
};

const getIngresosByBus = async (busId) => {
  const { rows } = await query(
    "SELECT * FROM ingresos WHERE id_bus = $1 ORDER BY fecha DESC",
    [busId]
  );
  return rows;
};

const getAccessibleBusesWithIngresos = async (uid, includeAll = false) => {
  const params = includeAll ? [] : [uid];
  const where = includeAll ? "" : `WHERE b.${OWNER_COLUMN} = $1`;
  const { rows } = await query(
    `
    SELECT
      b.*,
      COALESCE(
        json_agg(i.* ORDER BY i.fecha DESC) FILTER (WHERE i.id IS NOT NULL),
        '[]'
      ) AS ingresos
    FROM buses b
    LEFT JOIN ingresos i ON i.id_bus = b.id
    ${where}
    GROUP BY b.id
    ORDER BY b.nombre_ruta
    `,
    params
  );
  return rows;
};

const createIngreso = async (values) => {
  const { rows } = await query(
    `
    INSERT INTO ingresos (
      id_bus,
      fecha,
      descripcion_ingreso,
      total_ingreso
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [
      values.id_bus,
      values.fecha,
      values.descripcion_ingreso,
      values.total_ingreso,
    ]
  );
  return rows[0];
};

const deleteIngreso = async (ingreso) =>
  transaction(async (client) => {
    await client.query("DELETE FROM ingresos WHERE id = $1", [ingreso.id]);
    if (ingreso.id_pago !== null && ingreso.id_pago !== undefined) {
      await client.query("DELETE FROM pagos_alumnos WHERE id = $1", [
        ingreso.id_pago,
      ]);
    }
    return true;
  });

const getAccessibleBusIds = async (uid, includeAll = false) => {
  const { rows } = includeAll
    ? await query("SELECT id FROM buses")
    : await query(`SELECT id FROM buses WHERE ${OWNER_COLUMN} = $1`, [uid]);
  return rows.map((row) => row.id);
};

const getPeriods = async (uid, includeAll = false) => {
  const busIds = await getAccessibleBusIds(uid, includeAll);
  if (!busIds.length) return [];

  const { rows } = await query(
    `
    SELECT DISTINCT
      EXTRACT(YEAR FROM fecha)::int AS anio,
      EXTRACT(MONTH FROM fecha)::int AS mes_numero
    FROM (
      SELECT fecha FROM ingresos WHERE id_bus = ANY($1::int[])
      UNION
      SELECT fecha_gasto AS fecha FROM gastos WHERE id_bus = ANY($1::int[])
    ) registros
    ORDER BY anio DESC, mes_numero
    `,
    [busIds]
  );

  const monthFormatter = new Intl.DateTimeFormat("es-ES", { month: "long" });
  const periods = new Map();
  for (const row of rows) {
    if (!periods.has(row.anio)) periods.set(row.anio, []);
    periods
      .get(row.anio)
      .push(monthFormatter.format(new Date(Date.UTC(row.anio, row.mes_numero - 1, 1))));
  }
  return [...periods].map(([anio, meses]) => ({ anio, meses }));
};

const getMonthlySummary = async (uid, anio, mes, includeAll = false) => {
  const monthNumber = MONTHS[String(mes).toLowerCase()];
  if (!monthNumber) throw new Error("MES_INVALIDO");
  const busIds = await getAccessibleBusIds(uid, includeAll);
  if (!busIds.length) {
    return {
      totalIngresos: 0,
      totalGastos: 0,
      disponibleMes: 0,
      disponibleAcumulado: 0,
    };
  }

  const start = `${anio}-${String(monthNumber).padStart(2, "0")}-01`;
  const nextMonth =
    monthNumber === 12
      ? `${anio + 1}-01-01`
      : `${anio}-${String(monthNumber + 1).padStart(2, "0")}-01`;
  const yearStart = `${anio}-01-01`;

  const { rows } = await query(
    `
    SELECT
      COALESCE((
        SELECT SUM(total_ingreso) FROM ingresos
        WHERE id_bus = ANY($1::int[]) AND fecha >= $2 AND fecha < $3
      ), 0) AS "totalIngresos",
      COALESCE((
        SELECT SUM(monto) FROM gastos
        WHERE id_bus = ANY($1::int[]) AND fecha_gasto >= $2 AND fecha_gasto < $3
      ), 0) AS "totalGastos",
      COALESCE((
        SELECT SUM(total_ingreso) FROM ingresos
        WHERE id_bus = ANY($1::int[]) AND fecha >= $4 AND fecha < $3
      ), 0) -
      COALESCE((
        SELECT SUM(monto) FROM gastos
        WHERE id_bus = ANY($1::int[]) AND fecha_gasto >= $4 AND fecha_gasto < $3
      ), 0) AS "disponibleAcumulado"
    `,
    [busIds, start, nextMonth, yearStart]
  );
  const summary = rows[0];
  return {
    totalIngresos: summary.totalIngresos,
    totalGastos: summary.totalGastos,
    disponibleMes: summary.totalIngresos - summary.totalGastos,
    disponibleAcumulado: summary.disponibleAcumulado,
  };
};

export {
  createIngreso,
  deleteIngreso,
  getAccessibleBusesWithIngresos,
  getIngreso,
  getIngresosByBus,
  getMonthlySummary,
  getPeriods,
};
