import { supabase } from "../../supabase_connection";

/** Registrar un pago de alumno y generar un ingreso automáticamente */
const registrarPagoAlumno = async (pagoData, alumnoData) => {
  try {
    // 1️⃣ Insertar el pago en la tabla `pagos_alumnos`
    const { data: pago, error: pagoError } = await supabase
      .from("pagos_alumnos")
      .insert([pagoData])
      .select("*")
      .single();

    if (pagoError) throw pagoError;

    const año = new Date().getFullYear();
    const descripcion = `Pago ${pagoData.mes_correspondiente} ${año} ${alumnoData.nombre}`;

    // 3️⃣ Insertar el ingreso en la tabla `ingresos`
    const ingresoData = {
      id_bus: alumnoData.id_bus,
      fecha: pago.fecha_pago,
      total_ingreso: pago.monto,
      descripcion_ingreso: descripcion,
    };

    const { data: ingreso, error: ingresoError } = await supabase
      .from("ingresos")
      .insert([ingresoData])
      .select("*")
      .single();

    if (ingresoError) throw ingresoError;

    return { pago, ingreso };
  } catch (error) {
    console.error("Error registrando pago de alumno e ingreso:", error);
    return null;
  }
};

/** Obtener resumen de pagos de alumnos en un mes */
const getPagosResumenPorMes = async (busId, mes) => {
  try {
    // 1️⃣ Obtener la cantidad total de alumnos en el bus
    const { data: alumnos, error: alumnosError } = await supabase
      .from("alumnos")
      .select("id")
      .eq("id_bus", busId);

    if (alumnosError) throw alumnosError;

    const totalAlumnos = alumnos.length;

    if (totalAlumnos === 0) {
      return { totalAlumnos: 0, alumnosPagaron: 0, alumnosNoPagaron: 0 };
    }

    // 2️⃣ Obtener los pagos registrados en el mes especificado
    const { data: pagos, error: pagosError } = await supabase
      .from("pagos_alumnos")
      .select("id_alumno")
      .eq("mes_correspondiente", mes);

    if (pagosError) throw pagosError;

    const alumnosQuePagaron = new Set(pagos.map((p) => p.id_alumno)); // Eliminar duplicados

    // 3️⃣ Calcular los alumnos que han pagado y los que no
    const alumnosPagaron = alumnosQuePagaron.size;
    const alumnosNoPagaron = totalAlumnos - alumnosPagaron;

    return { totalAlumnos, alumnosPagaron, alumnosNoPagaron };
  } catch (error) {
    console.error("Error obteniendo resumen de pagos:", error);
    return null;
  }
};

/** Obtener resumen de pagos de todos los buses de un dueño/conductor en un mes */
const getPagosResumenPorMesUsuario = async (userId, mes) => {
    try {
      // 1️⃣ Obtener los buses donde el usuario es dueño o conductor
      const { data: buses, error: busError } = await supabase
        .from("buses")
        .select("id")
        .or(`id_dueño.eq.${userId},id_conductor.eq.${userId}`);
  
      if (busError) throw busError;
  
      if (!buses.length) {
        return { totalAlumnos: 0, alumnosPagaron: 0, alumnosNoPagaron: 0 };
      }
  
      // Extraer los IDs de los buses sin duplicados
      const busIds = [...new Set(buses.map(bus => bus.id))];
  
      // 2️⃣ Obtener la cantidad total de alumnos en estos buses
      const { data: alumnos, error: alumnosError } = await supabase
        .from("alumnos")
        .select("id")
        .in("id_bus", busIds);
  
      if (alumnosError) throw alumnosError;
  
      const totalAlumnos = alumnos.length;
  
      if (totalAlumnos === 0) {
        return { totalAlumnos: 0, alumnosPagaron: 0, alumnosNoPagaron: 0 };
      }
  
      // 3️⃣ Obtener los pagos registrados en el mes especificado
      const { data: pagos, error: pagosError } = await supabase
        .from("pagos_alumnos")
        .select("id_alumno")
        .eq("mes_correspondiente", mes)
        .in("id_alumno", alumnos.map(a => a.id)); // Filtrar solo alumnos de estos buses
  
      if (pagosError) throw pagosError;
  
      const alumnosQuePagaron = new Set(pagos.map(p => p.id_alumno)); // Evitar duplicados
  
      // 4️⃣ Calcular los alumnos que han pagado y los que no
      const alumnosPagaron = alumnosQuePagaron.size;
      const alumnosNoPagaron = totalAlumnos - alumnosPagaron;
  
      return { totalAlumnos, alumnosPagaron, alumnosNoPagaron };
    } catch (error) {
      console.error("Error obteniendo resumen de pagos de usuario:", error);
      return null;
    }
};

const obtenerPagosAlumno = async (alumnoId, anio_correspondiente) => {
    try {
      console.log("Obteniendo pagos de alumno:", alumnoId, anio_correspondiente);
        const { data, error } = await supabase
            .from("pagos_alumnos")
            .select("*")
            .eq("id_alumno", alumnoId)
            .eq("anio_correspondiente", anio_correspondiente);
        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error obteniendo pagos de alumno:", error);
        return [];
    }
}
  
export {
    registrarPagoAlumno, 
    getPagosResumenPorMes,
    getPagosResumenPorMesUsuario,
    obtenerPagosAlumno
};
