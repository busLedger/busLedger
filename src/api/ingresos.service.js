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
    const busIds = [...new Set(buses.map((bus) => bus.id))];

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



// ✅ Exportando todas las funciones al final
export {
  createIngreso,
  getIngreso,
  getIngresosByBus,
  getIngresosByUser,
  deleteIngreso,
};
