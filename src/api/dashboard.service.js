import { supabase } from "../../supabase_connection";

const getResumenPagosPorMes = async (userId, mes, anio) => {
  try {
    // 1️⃣ Obtener los buses donde el usuario es dueño o conductor
    const { data: buses, error: busError } = await supabase
      .from("buses")
      .select("id")
      .eq("id_dueño", userId);
    if (busError) throw busError;

    if (!buses.length) {
      return {
        totalAlumnos: 0,
        alumnosPagaron: 0,
        alumnosNoPagaron: 0,
        totalDineroObtenido: 0,
        totalDineroFaltante: 0,
      };
    }

    // Extraer los IDs de los buses sin duplicados
    const busIds = [...new Set(buses.map((bus) => bus.id))];

    // 2️⃣ Obtener la cantidad total de alumnos en estos buses
    const { data: alumnos, error: alumnosError } = await supabase
      .from("alumnos")
      .select("id, pago_mensual")
      .in("id_bus", busIds);

    if (alumnosError) throw alumnosError;

    const totalAlumnos = alumnos.length;

    if (totalAlumnos === 0) {
      return {
        totalAlumnos: 0,
        alumnosPagaron: 0,
        alumnosNoPagaron: 0,
        totalDineroObtenido: 0,
        totalDineroFaltante: 0,
      };
    }

    // 3️⃣ Obtener los pagos registrados en el mes especificado
    const { data: pagos, error: pagosError } = await supabase
      .from("pagos_alumnos")
      .select("id_alumno, monto")
      .eq("mes_correspondiente", mes)
      .eq("anio_correspondiente", anio)
      .in(
        "id_alumno",
        alumnos.map((a) => a.id)
      );

    if (pagosError) throw pagosError;

    const alumnosQuePagaron = new Set(pagos.map((p) => p.id_alumno));

    // 4️⃣ Calcular los alumnos que han pagado y los que no
    const alumnosPagaron = alumnosQuePagaron.size;
    const alumnosNoPagaron = totalAlumnos - alumnosPagaron;

    // 5️⃣ Calcular el total de dinero obtenido y el total de dinero faltante
    const totalDineroObtenido = pagos.reduce(
      (acc, pago) => acc + pago.monto,
      0
    );
    const totalDineroFaltante = alumnos.reduce((acc, alumno) => {
      if (!alumnosQuePagaron.has(alumno.id)) {
        return acc + alumno.pago_mensual;
      }
      return acc;
    }, 0);

    return {
      totalAlumnos,
      alumnosPagaron,
      alumnosNoPagaron,
      totalDineroObtenido,
      totalDineroFaltante,
    };
  } catch (error) {
    console.error("Error obteniendo resumen de pagos de usuario:", error);
    return null;
  }
};

const getResumenPagosPorAnio = async (userId, anio) => {
  try {
    // 1️⃣ Obtener los buses donde el usuario es dueño o conductor
    const { data: buses, error: busError } = await supabase
      .from("buses")
      .select("id")
      .eq("id_dueño", userId);
    if (busError) throw busError;

    if (!buses.length) {
      return {
        totalAlumnos: 0,
        alumnosPagaron: 0,
        alumnosNoPagaron: 0,
        totalDineroObtenido: 0,
        totalDineroFaltante: 0,
      };
    }

    // Extraer los IDs de los buses sin duplicados
    const busIds = [...new Set(buses.map((bus) => bus.id))];

    // 2️⃣ Obtener la cantidad total de alumnos en estos buses
    const { data: alumnos, error: alumnosError } = await supabase
      .from("alumnos")
      .select("id, pago_mensual")
      .in("id_bus", busIds);

    if (alumnosError) throw alumnosError;

    const totalAlumnos = alumnos.length;

    if (totalAlumnos === 0) {
      return {
        totalAlumnos: 0,
        alumnosPagaron: 0,
        alumnosNoPagaron: 0,
        totalDineroObtenido: 0,
        totalDineroFaltante: 0,
      };
    }

    // 3️⃣ Obtener los pagos registrados en el año especificado
    const { data: pagos, error: pagosError } = await supabase
      .from("pagos_alumnos")
      .select("id_alumno, monto")
      .eq("anio_correspondiente", anio)
      .in(
        "id_alumno",
        alumnos.map((a) => a.id)
      );

    if (pagosError) throw pagosError;

    const alumnosQuePagaron = new Set(pagos.map((p) => p.id_alumno));

    // 4️⃣ Calcular los alumnos que han pagado y los que no
    const alumnosPagaron = alumnosQuePagaron.size;
    const alumnosNoPagaron = totalAlumnos - alumnosPagaron;

    // 5️⃣ Calcular el total de dinero obtenido y el total de dinero faltante
    const totalDineroObtenido = pagos.reduce(
      (acc, pago) => acc + pago.monto,
      0
    );
    const totalDineroFaltante = alumnos.reduce((acc, alumno) => {
      if (!alumnosQuePagaron.has(alumno.id)) {
        return acc + alumno.pago_mensual;
      }
      return acc;
    }, 0);

    return {
      totalAlumnos,
      alumnosPagaron,
      alumnosNoPagaron,
      totalDineroObtenido,
      totalDineroFaltante,
    };
  } catch (error) {
    console.error(
      "Error obteniendo resumen de pagos de usuario por año:",
      error
    );
    return null;
  }
};

///Función para obtener el resumen de pagos, ingresos y gastos por mes:
const getResumenPorMes = async (userId, anio, mes) => {
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

    // Convertir el nombre del mes a número
    const mesFormateado = mesesMap[mes.toLowerCase().trim()];
    if (!mesFormateado) throw new Error(`Mes inválido: ${mes}`);

    const ultimoDia = new Date(anio, parseInt(mesFormateado, 10), 0).getDate();
    const { data: buses, error: busError } = await supabase
      .from("buses")
      .select("id")
      .eq("id_dueño", userId);
    if (busError) throw busError;
    const totalBuses = buses.length;
    if (!buses.length) {
      return {
        totalBuses: 0,
        totalAlumnos: 0,
        alumnosPagaron: 0,
        alumnosNoPagaron: 0,
        totalDineroObtenido: 0,
        totalDineroFaltante: 0,
        totalIngresos: 0,
        totalGastos: 0,
      };
    }

    const busIds = [...new Set(buses.map((bus) => bus.id))];

    // Obtener la cantidad total de alumnos en estos buses
    const { data: alumnos, error: alumnosError } = await supabase
      .from("alumnos")
      .select("id, pago_mensual")
      .in("id_bus", busIds);

    if (alumnosError) throw alumnosError;

    const totalAlumnos = alumnos.length;

    if (totalAlumnos === 0) {
      return {
        totalBuses: totalBuses,
        totalAlumnos: 0,
        alumnosPagaron: 0,
        alumnosNoPagaron: 0,
        totalDineroObtenido: 0,
        totalDineroFaltante: 0,
        totalIngresos: 0,
        totalGastos: 0,
      };
    }

    mes= capitalizeFirstLetter(mes);

    // Obtener los pagos registrados en el mes especificado
    const { data: pagos, error: pagosError } = await supabase
      .from("pagos_alumnos")
      .select("id_alumno, monto")
      .eq("mes_correspondiente", mes)
      .eq("anio_correspondiente", anio)
      .in(
        "id_alumno",
        alumnos.map((a) => a.id)
      );

    if (pagosError) throw pagosError;

    const alumnosQuePagaron = new Set(pagos.map((p) => p.id_alumno));
    const alumnosPagaron = alumnosQuePagaron.size;
    const alumnosNoPagaron = totalAlumnos - alumnosPagaron;

    const totalDineroObtenido = pagos.reduce(
      (acc, pago) => acc + pago.monto,
      0
    );
    const totalDineroFaltante = alumnos.reduce((acc, alumno) => {
      if (!alumnosQuePagaron.has(alumno.id)) {
        return acc + alumno.pago_mensual;
      }
      return acc;
    }, 0);

    // Obtener los ingresos registrados en el mes especificado
    const { data: ingresos, error: ingresosError } = await supabase
      .from("ingresos")
      .select("total_ingreso")
      .filter("fecha", "gte", `${anio}-${mesFormateado}-01`) // Primer día del mes
      .filter("fecha", "lte", `${anio}-${mesFormateado}-${ultimoDia}`) // Último día del mes
      .in("id_bus", busIds);

    if (ingresosError) throw ingresosError;

    const totalIngresos = ingresos.reduce(
      (acc, ingreso) => acc + ingreso.total_ingreso,
      0
    );

    // Obtener los gastos registrados en el mes especificado
    const { data: gastos, error: gastosError } = await supabase
      .from("gastos")
      .select("monto, descripcion_gasto")
      .filter("fecha_gasto", "gte", `${anio}-${mesFormateado}-01`)
      .filter("fecha_gasto", "lte", `${anio}-${mesFormateado}-${ultimoDia}`)
      .in("id_bus", busIds);

    if (gastosError) throw gastosError;
    const totalCombustible = gastos.filter((gasto) => gasto.descripcion_gasto === "Combustible").reduce((acc, gasto) => acc + gasto.monto, 0); 
    const totalGastos = gastos.reduce((acc, gasto) => acc + gasto.monto, 0);

    return {
      totalBuses,
      totalAlumnos,
      alumnosPagaron,
      alumnosNoPagaron,
      totalDineroObtenido,
      totalDineroFaltante,
      totalIngresos,
      totalGastos,
      totalCombustible
    };
  } catch (error) {
    console.error("Error obteniendo resumen por mes:", error);
    return null;
  }
};

const getResumenPorAnio = async (userId, anio) => {
  try {
    // Obtener los buses donde el usuario es dueño o conductor
    const { data: buses, error: busError } = await supabase
      .from("buses")
      .select("id")
      .eq("id_dueño", userId);
    if (busError) throw busError;

    if (!buses.length) {
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

    const busIds = [...new Set(buses.map((bus) => bus.id))];

    // Obtener la cantidad total de alumnos en estos buses
    const { data: alumnos, error: alumnosError } = await supabase
      .from("alumnos")
      .select("id, pago_mensual")
      .in("id_bus", busIds);

    if (alumnosError) throw alumnosError;

    const totalAlumnos = alumnos.length;
    if (totalAlumnos === 0) {
      return {
        totalBuses: buses.length,
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

    // Obtener los pagos registrados en el año especificado
    const { data: pagos, error: pagosError } = await supabase
      .from("pagos_alumnos")
      .select("id_alumno, monto")
      .eq("anio_correspondiente", anio)
      .in(
        "id_alumno",
        alumnos.map((a) => a.id)
      );
    if (pagosError) throw pagosError;

    const alumnosQuePagaron = new Set(pagos.map((p) => p.id_alumno));
    const alumnosPagaron = alumnosQuePagaron.size;
    const alumnosNoPagaron = totalAlumnos - alumnosPagaron;

    const totalDineroObtenido = pagos.reduce(
      (acc, pago) => acc + pago.monto,
      0
    );
    const totalDineroFaltante = alumnos.reduce((acc, alumno) => {
      if (!alumnosQuePagaron.has(alumno.id)) {
        return acc + alumno.pago_mensual;
      }
      return acc;
    }, 0);

    // Obtener los ingresos registrados en el año especificado
    const { data: ingresos, error: ingresosError } = await supabase
      .from("ingresos")
      .select("total_ingreso")
      .filter("fecha", "gte", `${anio}-01-01`)
      .filter("fecha", "lte", `${anio}-12-31`)
      .in("id_bus", busIds);

    if (ingresosError) throw ingresosError;

    const totalIngresos = ingresos.reduce(
      (acc, ingreso) => acc + ingreso.total_ingreso,
      0
    );

    // Obtener los gastos registrados en el año especificado
    const { data: gastos, error: gastosError } = await supabase
      .from("gastos")
      .select("monto, descripcion_gasto")
      .filter("fecha_gasto", "gte", `${anio}-01-01`)
      .filter("fecha_gasto", "lte", `${anio}-12-31`)
      .in("id_bus", busIds);

    if (gastosError) throw gastosError;

    const totalCombustible = gastos
      .filter((gasto) => gasto.descripcion_gasto === "Combustible")
      .reduce((acc, gasto) => acc + gasto.monto, 0);

    const totalGastos = gastos.reduce((acc, gasto) => acc + gasto.monto, 0);

    return {
      totalBuses: buses.length,
      totalAlumnos,
      alumnosPagaron,
      alumnosNoPagaron,
      totalDineroObtenido,
      totalDineroFaltante,
      totalIngresos,
      totalGastos,
      totalCombustible,
    };
  } catch (error) {
    console.error("Error obteniendo resumen por año:", error);
    return null;
  }
};

const getMesesYAniosConRegistros = async (userId) => {
  try {
    // Obtener los buses donde el usuario es dueño o conductor
    const { data: buses, error: busError } = await supabase
      .from("buses")
      .select("id")
      .eq("id_dueño", userId);
    if (busError) throw busError;

    if (!buses.length) {
      return [];
    }

    const busIds = [...new Set(buses.map((bus) => bus.id))];

    // Obtener los ingresos registrados
    const { data: ingresos, error: ingresosError } = await supabase
      .from("ingresos")
      .select("fecha")
      .in("id_bus", busIds);

    if (ingresosError) throw ingresosError;

    // Obtener los gastos registrados
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
      const mes = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(
        fecha
      );

      if (!registros[anio]) {
        registros[anio] = new Set();
      }
      registros[anio].add(mes);
    });

    // Procesar gastos
    gastos.forEach((gasto) => {
      const fecha = new Date(gasto.fecha_gasto);
      const anio = fecha.getFullYear();
      const mes = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(
        fecha
      );

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

    return resultado;
  } catch (error) {
    console.error("Error obteniendo meses y años con registros:", error);
    return [];
  }
};
const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};
export { getResumenPagosPorMes, getResumenPagosPorAnio, getResumenPorMes, getResumenPorAnio, getMesesYAniosConRegistros };
