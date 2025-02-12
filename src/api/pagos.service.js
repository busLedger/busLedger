import { supabase } from "../../supabase_connection";

/** Registrar un pago de alumno y generar un ingreso automáticamente */
const registrarPagoAlumno = async (pagoData) => {
  try {
    // 1️⃣ Insertar el pago en la tabla `pagos_alumnos`
    const { data: pago, error: pagoError } = await supabase
      .from("pagos_alumnos")
      .insert([pagoData])
      .select("*")
      .single();

    if (pagoError) throw pagoError;

    // 2️⃣ Obtener la información del alumno
    const { data: alumno, error: alumnoError } = await supabase
      .from("alumnos")
      .select("id_bus, nombre")
      .eq("id", pago.id_alumno)
      .single();

    if (alumnoError) throw alumnoError;

    const idBus = alumno.id_bus;
    const nombreAlumno = alumno.nombre;
    const mesPago = pago.mes_correspondiente; // Mes en formato "YYYY-MM"

    // Extraer el nombre del mes y el año (Ejemplo: "Enero 2025")
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    const [año, mes] = mesPago.split("-"); // Separar "YYYY-MM"
    const nombreMes = meses[parseInt(mes, 10) - 1]; // Obtener nombre del mes

    // Generar descripción en el formato "Pago enero 2025 Jose Luis Cardenas"
    const descripcion = `Pago ${nombreMes} ${año} ${nombreAlumno}`;

    // 3️⃣ Insertar el ingreso en la tabla `ingresos`
    const ingresoData = {
      id_bus: idBus,
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
  
export {
    registrarPagoAlumno, 
    getPagosResumenPorMes,
    getPagosResumenPorMesUsuario
};
