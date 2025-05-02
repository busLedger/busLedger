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
    const { data: gastos, error } = await supabase
      .from("buses")
      .select(`
        id, placa, nombre_ruta, id_dueño, modelo,
        ingresos(*)
      `)
      .eq("id_dueño", userId);

    if (error) throw error;

    return gastos || [];
  } catch (error) {
    console.error("Error obteniendo gastos por usuario:", error);
    return [];
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

    if(ingreso.id_pago !== null) {
     const {errorPago} = await supabase
        .from("pagos_alumnos")
        .delete()
        .eq("id", ingreso.id_pago);
      if (errorPago) throw error;
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
};
