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
    obtenerPagosAlumno
};
