import { query } from "../lib/db";

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

const getBusIds = async (uid, includeAll = false) => {
  const { rows } = includeAll
    ? await query("SELECT id FROM buses")
    : await query(`SELECT id FROM buses WHERE ${OWNER_COLUMN} = $1`, [uid]);
  return rows.map((row) => row.id);
};

const getDateRange = (anio, mes) => {
  const monthNumber = MONTHS[String(mes).toLowerCase()];
  if (!monthNumber) throw new Error("MES_INVALIDO");
  return {
    start: `${anio}-${String(monthNumber).padStart(2, "0")}-01`,
    end:
      monthNumber === 12
        ? `${anio + 1}-01-01`
        : `${anio}-${String(monthNumber + 1).padStart(2, "0")}-01`,
  };
};

const getPaymentSummary = async ({ uid, anio, mes, includeAll = false }) => {
  if (mes && !MONTHS[String(mes).toLowerCase()]) {
    throw new Error("MES_INVALIDO");
  }
  const busIds = await getBusIds(uid, includeAll);
  const empty = {
    totalAlumnos: 0,
    alumnosPagaron: 0,
    alumnosNoPagaron: 0,
    totalDineroObtenido: 0,
    totalDineroFaltante: 0,
  };
  if (!busIds.length) return empty;

  const { rows: alumnos } = await query(
    `
    SELECT id, pago_mensual
    FROM alumnos
    WHERE id_bus = ANY($1::int[]) AND activo = true
    `,
    [busIds]
  );
  if (!alumnos.length) return empty;

  const params = [alumnos.map((alumno) => alumno.id), anio];
  let monthWhere = "";
  if (mes) {
    params.push(
      String(mes).charAt(0).toUpperCase() + String(mes).slice(1).toLowerCase()
    );
    monthWhere = "AND mes_correspondiente = $3";
  }
  const { rows: pagos } = await query(
    `
    SELECT id_alumno, monto
    FROM pagos_alumnos
    WHERE id_alumno = ANY($1::int[])
      AND anio_correspondiente = $2
      ${monthWhere}
    `,
    params
  );

  const paidIds = new Set(pagos.map((pago) => pago.id_alumno));
  return {
    totalAlumnos: alumnos.length,
    alumnosPagaron: paidIds.size,
    alumnosNoPagaron: alumnos.length - paidIds.size,
    totalDineroObtenido: pagos.reduce((total, pago) => total + pago.monto, 0),
    totalDineroFaltante: alumnos.reduce(
      (total, alumno) =>
        paidIds.has(alumno.id) ? total : total + alumno.pago_mensual,
      0
    ),
  };
};

const getDashboardSummary = async ({ uid, anio, mes, includeAll = false }) => {
  const busIds = await getBusIds(uid, includeAll);
  const payments = await getPaymentSummary({ uid, anio, mes, includeAll });
  if (!busIds.length) {
    return {
      totalBuses: 0,
      ...payments,
      totalIngresos: 0,
      totalGastos: 0,
      totalCombustible: 0,
    };
  }

  const range = mes
    ? getDateRange(anio, mes)
    : { start: `${anio}-01-01`, end: `${anio + 1}-01-01` };
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
        SELECT SUM(monto) FROM gastos
        WHERE id_bus = ANY($1::int[])
          AND fecha_gasto >= $2 AND fecha_gasto < $3
          AND LOWER(descripcion_gasto) = 'combustible'
      ), 0) AS "totalCombustible"
    `,
    [busIds, range.start, range.end]
  );

  return { totalBuses: busIds.length, ...payments, ...rows[0] };
};

export { getDashboardSummary, getPaymentSummary };
