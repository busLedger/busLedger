import { query, transaction } from "../lib/db";

const getPago = async (pagoId) => {
  const { rows } = await query(
    `
    SELECT
      p.*,
      a.id_bus,
      a.nombre AS alumno_nombre
    FROM pagos_alumnos p
    JOIN alumnos a ON a.id = p.id_alumno
    WHERE p.id = $1
    `,
    [pagoId]
  );
  return rows[0] || null;
};

const getPagosByAlumno = async (alumnoId, anio) => {
  const { rows } = await query(
    `
    SELECT *
    FROM pagos_alumnos
    WHERE id_alumno = $1 AND anio_correspondiente = $2
    ORDER BY fecha_pago DESC
    `,
    [alumnoId, anio]
  );
  return rows;
};

const createPago = async ({ alumno, pago }) =>
  transaction(async (client) => {
    const duplicate = await client.query(
      `
      SELECT id
      FROM pagos_alumnos
      WHERE id_alumno = $1
        AND mes_correspondiente = $2
        AND anio_correspondiente = $3
      LIMIT 1
      `,
      [alumno.id, pago.mes_correspondiente, pago.anio_correspondiente]
    );
    if (duplicate.rows.length) {
      const error = new Error("El alumno ya tiene registrado ese mes");
      error.code = "PAGO_DUPLICADO";
      throw error;
    }

    const pagoResult = await client.query(
      `
      INSERT INTO pagos_alumnos (
        id_alumno,
        fecha_pago,
        mes_correspondiente,
        monto,
        anio_correspondiente
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        alumno.id,
        pago.fecha_pago,
        pago.mes_correspondiente,
        pago.monto,
        pago.anio_correspondiente,
      ]
    );
    const createdPago = pagoResult.rows[0];

    const ingresoResult = await client.query(
      `
      INSERT INTO ingresos (
        id_bus,
        fecha,
        total_ingreso,
        descripcion_ingreso,
        id_pago
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        alumno.id_bus,
        createdPago.fecha_pago,
        createdPago.monto,
        `Pago ${createdPago.mes_correspondiente} ${createdPago.anio_correspondiente} ${alumno.nombre}`,
        createdPago.id,
      ]
    );

    return { pago: createdPago, ingreso: ingresoResult.rows[0] };
  });

const deletePago = async (pagoId) =>
  transaction(async (client) => {
    await client.query("DELETE FROM ingresos WHERE id_pago = $1", [pagoId]);
    const result = await client.query(
      "DELETE FROM pagos_alumnos WHERE id = $1",
      [pagoId]
    );
    return result.rowCount > 0;
  });

export { createPago, deletePago, getPago, getPagosByAlumno };
