import { NextResponse } from "next/server";
import { query, transaction } from "../../../lib/db";
import { errorResponse, hasRole, isAdmin, verifyAuth } from "../../../lib/auth";

const qid = (identifier) => `"${String(identifier).replaceAll('"', '""')}"`;
const OWNER = qid("id_dueño");

const monthNumber = (mes) => {
  const meses = {
    enero: "01",
    febrero: "02",
    marzo: "03",
    abril: "04",
    mayo: "05",
    junio: "06",
    julio: "07",
    agosto: "08",
    septiembre: "09",
    octubre: "10",
    noviembre: "11",
    diciembre: "12",
  };
  return meses[String(mes || "").toLowerCase().trim()];
};

const capitalize = (value) => {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const insertRow = async (table, values, client = { query }) => {
  const keys = Object.keys(values).filter((key) => values[key] !== undefined);
  const columns = keys.map(qid).join(", ");
  const params = keys.map((key) => values[key]);
  const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");
  const { rows } = await client.query(
    `INSERT INTO ${qid(table)} (${columns}) VALUES (${placeholders}) RETURNING *`,
    params
  );
  return rows[0];
};

const updateRow = async (table, values, whereColumn, whereValue) => {
  const keys = Object.keys(values).filter((key) => values[key] !== undefined);
  const setClause = keys.map((key, index) => `${qid(key)} = $${index + 1}`).join(", ");
  const params = [...keys.map((key) => values[key]), whereValue];
  const { rows } = await query(
    `UPDATE ${qid(table)} SET ${setClause} WHERE ${qid(whereColumn)} = $${params.length} RETURNING *`,
    params
  );
  return rows[0] || null;
};

const deleteWhere = async (table, column, value, client = { query }) => {
  await client.query(`DELETE FROM ${qid(table)} WHERE ${qid(column)} = $1`, [value]);
  return true;
};

const rowsByIds = async (table, column, ids, select = "*") => {
  if (!ids.length) return [];
  const { rows } = await query(
    `SELECT ${select} FROM ${qid(table)} WHERE ${qid(column)} = ANY($1::int[])`,
    [ids]
  );
  return rows;
};

const getBusesForUser = async (userId) => {
  const { rows } = await query(`SELECT * FROM buses WHERE ${OWNER} = $1`, [userId]);
  return rows;
};

const financialBusRows = async (whereSql = "", params = []) => {
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
      COALESCE(ingresos.total, 0) - COALESCE(gastos.total, 0) - COALESCE(salarios.total, 0) AS balance
    FROM buses b
    LEFT JOIN usuarios dueno ON dueno.uid = b.${OWNER}
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
    ${whereSql}
    `,
    params
  );

  return rows.map((row) => ({
    ...row,
    dueño: row.dueño || "Desconocido",
    conductor: row.conductor || "Desconocido",
  }));
};

const dateRange = (anio, mes) => {
  const mesFormateado = monthNumber(mes);
  if (!mesFormateado) throw new Error(`Mes invalido: ${mes}`);
  const lastDay = new Date(Number(anio), Number(mesFormateado), 0).getDate();
  return {
    start: `${anio}-${mesFormateado}-01`,
    end: `${anio}-${mesFormateado}-${lastDay}`,
  };
};

const paymentSummary = async ({ userId, mes, anio }) => {
  const buses = await getBusesForUser(userId);
  const busIds = buses.map((bus) => bus.id);
  const empty = {
    totalAlumnos: 0,
    alumnosPagaron: 0,
    alumnosNoPagaron: 0,
    totalDineroObtenido: 0,
    totalDineroFaltante: 0,
  };
  if (!busIds.length) return empty;

  const alumnos = await rowsByIds("alumnos", "id_bus", busIds, "id, pago_mensual");
  if (!alumnos.length) return empty;

  const params = [anio, alumnos.map((a) => a.id)];
  let whereMes = "";
  if (mes) {
    params.unshift(capitalize(mes));
    whereMes = "mes_correspondiente = $1 AND";
  }

  const { rows: pagos } = await query(
    `SELECT id_alumno, monto FROM pagos_alumnos WHERE ${whereMes} anio_correspondiente = $${params.length - 1} AND id_alumno = ANY($${params.length}::int[])`,
    params
  );

  const alumnosQuePagaron = new Set(pagos.map((pago) => pago.id_alumno));
  const totalDineroObtenido = pagos.reduce((acc, pago) => acc + pago.monto, 0);
  const totalDineroFaltante = alumnos.reduce(
    (acc, alumno) => (alumnosQuePagaron.has(alumno.id) ? acc : acc + alumno.pago_mensual),
    0
  );

  return {
    totalAlumnos: alumnos.length,
    alumnosPagaron: alumnosQuePagaron.size,
    alumnosNoPagaron: alumnos.length - alumnosQuePagaron.size,
    totalDineroObtenido,
    totalDineroFaltante,
  };
};

const expenseIncomeMonths = async (userId, includeGastos = true) => {
  const buses = await getBusesForUser(userId);
  const busIds = buses.map((bus) => bus.id);
  if (!busIds.length) return [];

  const ingresos = await rowsByIds("ingresos", "id_bus", busIds, "fecha");
  const gastos = includeGastos ? await rowsByIds("gastos", "id_bus", busIds, "fecha_gasto") : [];
  const registros = {};

  [...ingresos.map((item) => item.fecha), ...gastos.map((item) => item.fecha_gasto)].forEach((value) => {
    const fecha = new Date(value);
    const anio = fecha.getFullYear();
    const mes = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(fecha);
    registros[anio] ||= new Set();
    registros[anio].add(mes);
  });

  return Object.keys(registros)
    .map((anio) => ({
      anio: Number(anio),
      meses: [...registros[anio]].sort((a, b) => new Date(`${anio}-${a}-01`).getMonth() - new Date(`${anio}-${b}-01`).getMonth()),
    }))
    .sort((a, b) => b.anio - a.anio);
};

const monthlyFinancialSummary = async (userId, anio, mes) => {
  const buses = await getBusesForUser(userId);
  const busIds = buses.map((bus) => bus.id);
  if (!busIds.length) {
    return { totalIngresos: 0, totalGastos: 0, disponibleMes: 0, disponibleAcumulado: 0 };
  }

  const { start, end } = dateRange(anio, mes);
  const { rows } = await query(
    `
    SELECT
      COALESCE((SELECT SUM(total_ingreso) FROM ingresos WHERE id_bus = ANY($1::int[]) AND fecha BETWEEN $2 AND $3), 0) AS "totalIngresos",
      COALESCE((SELECT SUM(monto) FROM gastos WHERE id_bus = ANY($1::int[]) AND fecha_gasto BETWEEN $2 AND $3), 0) AS "totalGastos",
      COALESCE((SELECT SUM(total_ingreso) FROM ingresos WHERE id_bus = ANY($1::int[]) AND fecha BETWEEN $4 AND $3), 0) -
      COALESCE((SELECT SUM(monto) FROM gastos WHERE id_bus = ANY($1::int[]) AND fecha_gasto BETWEEN $4 AND $3), 0) AS "disponibleAcumulado"
    `,
    [busIds, start, end, `${anio}-01-01`]
  );
  const row = rows[0];
  return {
    totalIngresos: row.totalIngresos,
    totalGastos: row.totalGastos,
    disponibleMes: row.totalIngresos - row.totalGastos,
    disponibleAcumulado: row.disponibleAcumulado,
  };
};

const dashboardSummary = async ({ userId, anio, mes }) => {
  const buses = await getBusesForUser(userId);
  const busIds = buses.map((bus) => bus.id);
  if (!busIds.length) {
    return {
      totalBuses: 0,
      totalAlumnos: 0,
      alumnosPagaron: 0,
      alumnosNoPagaron: 0,
      totalDineroObtenido: 0,
      totalDineroFaltante: 0,
      totalIngresos: 0,
      totalGastos: 0,
      totalCombustible: 0,
    };
  }

  const pagos = await paymentSummary({ userId, anio, mes });
  const params = [busIds];
  let ingresoWhere = "id_bus = ANY($1::int[])";
  let gastoWhere = "id_bus = ANY($1::int[])";
  if (mes) {
    const range = dateRange(anio, mes);
    params.push(range.start, range.end);
    ingresoWhere += " AND fecha BETWEEN $2 AND $3";
    gastoWhere += " AND fecha_gasto BETWEEN $2 AND $3";
  } else {
    params.push(`${anio}-01-01`, `${anio}-12-31`);
    ingresoWhere += " AND fecha BETWEEN $2 AND $3";
    gastoWhere += " AND fecha_gasto BETWEEN $2 AND $3";
  }

  const { rows } = await query(
    `
    SELECT
      COALESCE((SELECT SUM(total_ingreso) FROM ingresos WHERE ${ingresoWhere}), 0) AS "totalIngresos",
      COALESCE((SELECT SUM(monto) FROM gastos WHERE ${gastoWhere}), 0) AS "totalGastos",
      COALESCE((SELECT SUM(monto) FROM gastos WHERE ${gastoWhere} AND descripcion_gasto = 'Combustible'), 0) AS "totalCombustible"
    `,
    params
  );

  return {
    totalBuses: buses.length,
    ...pagos,
    ...rows[0],
  };
};

const handlers = {
  alumnos: {
    createAlumno: ({ newAlumno }) => insertRow("alumnos", newAlumno),
    updateAlumno: ({ alumnoId, updatedData }) => updateRow("alumnos", updatedData, "id", alumnoId),
    getAlumno: async ({ alumnoId }) => {
      const { rows } = await query(
        `
        SELECT a.*, COALESCE(json_agg(p.*) FILTER (WHERE p.id IS NOT NULL), '[]') AS pagos_alumnos
        FROM alumnos a
        LEFT JOIN pagos_alumnos p ON p.id_alumno = a.id
        WHERE a.id = $1
        GROUP BY a.id
        `,
        [alumnoId]
      );
      return rows;
    },
    getAlumnosByBus: async ({ busId }) => {
      const { rows } = await query("SELECT * FROM alumnos WHERE id_bus = $1", [busId]);
      return rows;
    },
    getAllAlumnosByUser: async ({ userId }) => {
      const { rows } = await query(
        `
        SELECT b.*, COALESCE(json_agg(a.*) FILTER (WHERE a.id IS NOT NULL), '[]') AS alumnos
        FROM buses b
        LEFT JOIN alumnos a ON a.id_bus = b.id AND a.activo = true
        WHERE b.${OWNER} = $1 OR b.id_conductor = $1
        GROUP BY b.id
        `,
        [userId]
      );
      return rows;
    },
    toggleAlumnoStatus: ({ alumnoId, isActive }) => updateRow("alumnos", { activo: isActive }, "id", alumnoId),
    deleteAlumno: ({ alumnoId }) => deleteWhere("alumnos", "id", alumnoId),
  },
  buses: {
    createBus: ({ newBus }) => insertRow("buses", newBus),
    getBusWithFinancials: async ({ busId }) => (await financialBusRows("WHERE b.id = $1", [busId]))[0] || null,
    getBusesWithFinancials: ({ userId }) => financialBusRows(`WHERE b.${OWNER} = $1`, [userId]),
    getAllBusesWithFinancials: () => financialBusRows(),
    updateBus: ({ busId, updatedData }) => updateRow("buses", updatedData, "id", busId),
    getBusesByUser: ({ userId }) => getBusesForUser(userId),
    deleteBus: ({ busId }) => deleteWhere("buses", "id", busId),
  },
  gastos: {
    createGasto: ({ newGasto }) => insertRow("gastos", newGasto),
    getGasto: async ({ gastoId }) => {
      const { rows } = await query("SELECT * FROM gastos WHERE id = $1", [gastoId]);
      return rows[0] || null;
    },
    getGastosByBus: async ({ busId }) => {
      const { rows } = await query("SELECT * FROM gastos WHERE id_bus = $1", [busId]);
      return rows;
    },
    getGastosByUser: async ({ userId }) => {
      const { rows } = await query(
        `
        SELECT b.*, COALESCE(json_agg(g.*) FILTER (WHERE g.id IS NOT NULL), '[]') AS gastos
        FROM buses b
        LEFT JOIN gastos g ON g.id_bus = b.id
        WHERE b.${OWNER} = $1
        GROUP BY b.id
        `,
        [userId]
      );
      return rows;
    },
    deleteGasto: ({ gastoId }) => deleteWhere("gastos", "id", gastoId),
    getMesesYAniosConRegistros: ({ userId }) => expenseIncomeMonths(userId, true),
  },
  ingresos: {
    createIngreso: ({ newIngreso }) => insertRow("ingresos", newIngreso),
    getIngreso: async ({ ingresoId }) => {
      const { rows } = await query("SELECT * FROM ingresos WHERE id = $1", [ingresoId]);
      return rows[0] || null;
    },
    getIngresosByBus: async ({ busId }) => {
      const { rows } = await query("SELECT * FROM ingresos WHERE id_bus = $1", [busId]);
      return rows;
    },
    getIngresosByUser: async ({ userId }) => {
      const { rows } = await query(
        `
        SELECT b.*, COALESCE(json_agg(i.*) FILTER (WHERE i.id IS NOT NULL), '[]') AS ingresos
        FROM buses b
        LEFT JOIN ingresos i ON i.id_bus = b.id
        WHERE b.${OWNER} = $1
        GROUP BY b.id
        `,
        [userId]
      );
      return rows;
    },
    deleteIngreso: async ({ ingreso }) =>
      transaction(async (client) => {
        await deleteWhere("ingresos", "id", ingreso.id, client);
        if (ingreso.id_pago !== null && ingreso.id_pago !== undefined) {
          await deleteWhere("pagos_alumnos", "id", ingreso.id_pago, client);
        }
        return true;
      }),
    getMesesYAniosConRegistros: ({ userId }) => expenseIncomeMonths(userId, true),
    getResumenFinancieroPorMes: ({ userId, anio, mes }) => monthlyFinancialSummary(userId, anio, mes),
  },
  pagos: {
    registrarPagoAlumno: async ({ pagoData, alumnoData }) =>
      transaction(async (client) => {
        const pago = await insertRow(
          "pagos_alumnos",
          {
            ...pagoData,
            anio_correspondiente: pagoData.anio_correspondiente ?? new Date().getFullYear(),
          },
          client
        );
        const anio = new Date().getFullYear();
        const ingreso = await insertRow(
          "ingresos",
          {
            id_bus: alumnoData.id_bus,
            fecha: pago.fecha_pago,
            total_ingreso: pago.monto,
            descripcion_ingreso: `Pago ${pagoData.mes_correspondiente} ${anio} ${alumnoData.nombre}`,
            id_pago: pago.id,
          },
          client
        );
        return { pago, ingreso };
      }),
    obtenerPagosAlumno: async ({ alumnoId, anio_correspondiente }) => {
      const { rows } = await query(
        "SELECT * FROM pagos_alumnos WHERE id_alumno = $1 AND anio_correspondiente = $2",
        [alumnoId, anio_correspondiente]
      );
      return rows;
    },
    eliminarPagoAlumno: async ({ data }) =>
      transaction(async (client) => {
        await deleteWhere("ingresos", "id_pago", data.id, client);
        await deleteWhere("pagos_alumnos", "id", data.id, client);
        return true;
      }),
  },
  users: {
    getAllUsers: async () => {
      const { rows } = await query(
        `
        SELECT u.*, COALESCE(json_agg(r.nombre) FILTER (WHERE r.nombre IS NOT NULL), '[]') AS roles
        FROM usuarios u
        LEFT JOIN usuarios_roles ur ON ur.uid_usuario = u.uid
        LEFT JOIN roles r ON r.id = ur.id_rol
        GROUP BY u.uid
        `
      );
      return rows;
    },
    getUserData: async ({ uid }) => {
      if (!uid) return null;
      const { rows } = await query(
        `
        SELECT u.*, COALESCE(json_agg(r.nombre) FILTER (WHERE r.nombre IS NOT NULL), '[]') AS roles
        FROM usuarios u
        LEFT JOIN usuarios_roles ur ON ur.uid_usuario = u.uid
        LEFT JOIN roles r ON r.id = ur.id_rol
        WHERE u.uid = $1
        GROUP BY u.uid
        `,
        [uid]
      );
      return rows[0] || null;
    },
    createUser: async ({ newUser, roles }) =>
      transaction(async (client) => {
        const user = await insertRow(
          "usuarios",
          {
            uid: newUser.uid,
            nombre: newUser.nombre,
            correo: newUser.correo,
            whatsapp: newUser.whatsapp || null,
            activo: newUser.activo ?? true,
          },
          client
        );
        for (const roleId of roles) {
          await insertRow("usuarios_roles", { uid_usuario: newUser.uid, id_rol: roleId }, client);
        }
        return { ...user, roles };
      }),
    updateUser: ({ uid, updatedUser }) => updateRow("usuarios", updatedUser, "uid", uid),
    toggleUserStatus: ({ uid, isActive }) => updateRow("usuarios", { activo: isActive }, "uid", uid),
    getRoles: async () => {
      const { rows } = await query("SELECT * FROM roles ORDER BY id");
      return rows;
    },
  },
  dashboard: {
    getResumenPagosPorMes: ({ userId, mes, anio }) => paymentSummary({ userId, mes, anio }),
    getResumenPagosPorAnio: ({ userId, anio }) => paymentSummary({ userId, anio }),
    getResumenPorMes: ({ userId, anio, mes }) => dashboardSummary({ userId, anio, mes }),
    getResumenPorAnio: ({ userId, anio }) => dashboardSummary({ userId, anio }),
    getMesesYAniosConRegistros: ({ userId }) => expenseIncomeMonths(userId, true),
  },
};

export async function POST(request) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);

  try {
    const { service, action, payload: clientPayload = {} } = await request.json();
    const payload = { ...clientPayload, userId: auth.data.uid };

    if (["buses", "alumnos", "pagos", "ingresos", "gastos"].includes(service)) {
      return errorResponse(`Este módulo fue migrado a /api/${service}`, 410);
    }

    const adminActions = new Set([
      "users.getAllUsers",
      "users.updateUser",
      "users.toggleUserStatus",
    ]);
    if (adminActions.has(`${service}.${action}`) && !isAdmin(auth.data)) {
      return errorResponse("Se requiere rol de administrador", 403);
    }

    if (
      service === "users" &&
      action === "createUser" &&
      !hasRole(auth.data, ["Dueño"])
    ) {
      return errorResponse("No tienes permiso para crear usuarios", 403);
    }

    if (
      service === "users" &&
      action === "createUser" &&
      !isAdmin(auth.data) &&
      (payload.roles?.length !== 1 || Number(payload.roles[0]) !== 3)
    ) {
      return errorResponse("Un dueño solo puede registrar conductores", 403);
    }

    if (
      ["gastos", "ingresos", "pagos", "dashboard"].includes(service) &&
      !hasRole(auth.data, ["Dueño"])
    ) {
      return errorResponse("No tienes permiso para esta operación", 403);
    }

    if (service === "users" && action === "getUserData") {
      payload.uid = auth.data.uid;
    }

    const handler = handlers[service]?.[action];

    if (!handler) {
      return NextResponse.json({ error: "Operacion no soportada" }, { status: 404 });
    }

    const data = await handler(payload);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("RPC API error:", error);
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}
