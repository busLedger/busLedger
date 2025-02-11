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
    // Obtener los buses donde el usuario es dueño o conductor
    const { data: buses, error: busError } = await supabase
      .from("buses")
      .select("id")
      .or(`id_dueño.eq.${userId},id_conductor.eq.${userId}`);

    if (busError) throw busError;

    if (!buses.length) return [];

    // Extraer los IDs de los buses sin duplicados
    const busIds = [...new Set(buses.map(bus => bus.id))];

    // Obtener los ingresos de estos buses
    const { data: ingresos, error: ingresosError } = await supabase
      .from("ingresos")
      .select("*")
      .in("id_bus", busIds);

    if (ingresosError) throw ingresosError;

    return ingresos;
  } catch (error) {
    console.error("Error obteniendo ingresos por usuario:", error);
    return [];
  }
};

/** Eliminar un ingreso por ID */
const deleteIngreso = async (ingresoId) => {
  try {
    const { error } = await supabase
      .from("ingresos")
      .delete()
      .eq("id", ingresoId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error eliminando ingreso:", error);
    return false;
  }
};

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
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
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
        descripcion_ingreso: descripcion
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
  

// ✅ Exportando todas las funciones al final
export {
  createIngreso,
  getIngreso,
  getIngresosByBus,
  getIngresosByUser,
  deleteIngreso,
  registrarPagoAlumno
};
