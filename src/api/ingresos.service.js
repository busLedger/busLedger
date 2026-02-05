import { supabase } from "../../supabase_connection";

/** Registrar un ingreso manualmente */
const createIngreso = async (newIngreso) => {
  try {
    const { data, error } = await supabase
      .from("ingresos")
      .insert([newIngreso])
      .select("*")
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error registrando ingreso:", error);
    return null;
  }
};

/** Obtener un ingreso por su ID */
const getIngreso = async (ingresoId) => {
  try {
    const { data, error } = await supabase
      .from("ingresos")
      .select("*")
      .eq("id", ingresoId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error obteniendo ingreso:", error);
    return null;
  }
};

/** Obtener todos los ingresos de un bus */
const getIngresosByBus = async (busId) => {
  try {
    const { data, error } = await supabase
      .from("ingresos")
      .select("*")
      .eq("id_bus", busId);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error obteniendo ingresos del bus:", error);
    return [];
  }
};

/** Obtener todos los ingresos de los buses de un usuario */
const getIngresosByUser = async (userId) => {
  try {
    const { data: buses, error } = await supabase
      .from("buses")
      .select(`
        id, placa, nombre_ruta, id_dueño, modelo,
        ingresos(*)
      `)
      .eq("id_dueño", userId);

    if (error) throw error;

    return buses || [];
  } catch (error) {
    console.error("Error obteniendo ingresos por usuario:", error);
    return [];
  }
};

/** Obtener meses y años con registros de ingresos/gastos */
const getMesesYAniosConRegistros = async (userId) => {
  try {
    // Obtener los buses del usuario
    const { data: buses, error: busError } = await supabase
      .from("buses")
      .select("id")
      .eq("id_dueño", userId);

    if (busError) throw busError;
    if (!buses.length) return [];

    const busIds = [...new Set(buses.map((bus) => bus.id))];

    // Obtener ingresos
    const { data: ingresos, error: ingresosError } = await supabase
      .from("ingresos")
      .select("fecha")
      .in("id_bus", busIds);

    if (ingresosError) throw ingresosError;

    // Obtener gastos
    const { data: gastos, error: gastosError } = await supabase
      .from("gastos")
      .select("fecha_gasto")
      .in("id_bus", busIds);

    if (gastosError) throw gastosError;

    const registros = {};

    // Procesar ingresos
    ingresos.forEach((ingreso) => {
      const fecha = new Date(ingreso.fecha);
      const anio = fecha.getFullYear();
      const mes = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(fecha);

      if (!registros[anio]) {
        registros[anio] = new Set();
      }
      registros[anio].add(mes);
    });

    // Procesar gastos
    gastos.forEach((gasto) => {
      const fecha = new Date(gasto.fecha_gasto);
      const anio = fecha.getFullYear();
      const mes = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(fecha);

      if (!registros[anio]) {
        registros[anio] = new Set();
      }
      registros[anio].add(mes);
    });

    const resultado = Object.keys(registros).map((anio) => ({
      anio: parseInt(anio),
      meses: [...registros[anio]].sort(
        (a, b) =>
          new Date(`${anio}-${a}-01`).getMonth() -
          new Date(`${anio}-${b}-01`).getMonth()
      ),
    }));

    return resultado.sort((a, b) => b.anio - a.anio);
  } catch (error) {
    console.error("Error obteniendo meses y años con registros:", error);
    return [];
  }
};

/** Obtener resumen financiero por mes (ACUMULATIVO) */
const getResumenFinancieroPorMes = async (userId, anio, mes) => {
  try {
    // Mapeo de nombres de meses a números
    const mesesMap = {
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

    const mesFormateado = mesesMap[mes.toLowerCase().trim()];
    if (!mesFormateado) throw new Error(`Mes inválido: ${mes}`);

    const ultimoDia = new Date(anio, parseInt(mesFormateado, 10), 0).getDate();

    // Obtener los buses del usuario
    const { data: buses, error: busError } = await supabase
      .from("buses")
      .select("id")
      .eq("id_dueño", userId);

    if (busError) throw busError;

    if (!buses.length) {
      return {
        totalIngresos: 0,
        totalGastos: 0,
        disponibleMes: 0,
        disponibleAcumulado: 0,
      };
    }

    const busIds = [...new Set(buses.map((bus) => bus.id))];

    // 1️⃣ INGRESOS DEL MES ACTUAL
    const { data: ingresosMes, error: ingresosError } = await supabase
      .from("ingresos")
      .select("total_ingreso")
      .filter("fecha", "gte", `${anio}-${mesFormateado}-01`)
      .filter("fecha", "lte", `${anio}-${mesFormateado}-${ultimoDia}`)
      .in("id_bus", busIds);

    if (ingresosError) throw ingresosError;

    // 2️⃣ GASTOS DEL MES ACTUAL
    const { data: gastosMes, error: gastosError } = await supabase
      .from("gastos")
      .select("monto")
      .filter("fecha_gasto", "gte", `${anio}-${mesFormateado}-01`)
      .filter("fecha_gasto", "lte", `${anio}-${mesFormateado}-${ultimoDia}`)
      .in("id_bus", busIds);

    if (gastosError) throw gastosError;

    const totalIngresos = ingresosMes.reduce(
      (acc, ingreso) => acc + ingreso.total_ingreso,
      0
    );

    const totalGastos = gastosMes.reduce((acc, gasto) => acc + gasto.monto, 0);

    const disponibleMes = totalIngresos - totalGastos;

    // 3️⃣ CALCULAR DISPONIBLE ACUMULADO (desde inicio del año hasta el mes actual)
    const { data: ingresosAcumulados, error: ingresosAcumError } = await supabase
      .from("ingresos")
      .select("total_ingreso")
      .filter("fecha", "gte", `${anio}-01-01`)
      .filter("fecha", "lte", `${anio}-${mesFormateado}-${ultimoDia}`)
      .in("id_bus", busIds);

    if (ingresosAcumError) throw ingresosAcumError;

    const { data: gastosAcumulados, error: gastosAcumError } = await supabase
      .from("gastos")
      .select("monto")
      .filter("fecha_gasto", "gte", `${anio}-01-01`)
      .filter("fecha_gasto", "lte", `${anio}-${mesFormateado}-${ultimoDia}`)
      .in("id_bus", busIds);

    if (gastosAcumError) throw gastosAcumError;

    const totalIngresosAcumulados = ingresosAcumulados.reduce(
      (acc, ingreso) => acc + ingreso.total_ingreso,
      0
    );

    const totalGastosAcumulados = gastosAcumulados.reduce(
      (acc, gasto) => acc + gasto.monto,
      0
    );

    const disponibleAcumulado = totalIngresosAcumulados - totalGastosAcumulados;

    return {
      totalIngresos,
      totalGastos,
      disponibleMes,
      disponibleAcumulado,
    };
  } catch (error) {
    console.error("Error obteniendo resumen financiero por mes:", error);
    return {
      totalIngresos: 0,
      totalGastos: 0,
      disponibleMes: 0,
      disponibleAcumulado: 0,
    };
  }
};

/** Eliminar un ingreso por ID */
const deleteIngreso = async (ingreso) => {
  console.log("Ingreso a eliminar:", ingreso);
  try {
    const { error } = await supabase
      .from("ingresos")
      .delete()
      .eq("id", ingreso.id);

    if (error) throw error;

    if (ingreso.id_pago !== null) {
      const { error: errorPago } = await supabase
        .from("pagos_alumnos")
        .delete()
        .eq("id", ingreso.id_pago);
      if (errorPago) throw errorPago;
    }

    return true;
  } catch (error) {
    console.error("Error eliminando ingreso:", error);
    return false;
  }
};

export {
  createIngreso,
  getIngreso,
  getIngresosByBus,
  getIngresosByUser,
  deleteIngreso,
  getMesesYAniosConRegistros,
  getResumenFinancieroPorMes,
};