import { supabase } from "../../supabase_connection";

/** Registrar un nuevo gasto */
const createGasto = async (newGasto) => {
  console.log("Registrando gasto:", newGasto);	
  try {
    const { data, error } = await supabase
      .from("gastos")
      .insert(newGasto)
      .select("*")
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error registrando gasto:", error);
    return null;
  }
};

/** Obtener un gasto por su ID */
const getGasto = async (gastoId) => {
  try {
    const { data, error } = await supabase
      .from("gastos")
      .select("*")
      .eq("id", gastoId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error obteniendo gasto:", error);
    return null;
  }
};

/** Obtener todos los gastos de un bus */
const getGastosByBus = async (busId) => {
  try {
    const { data, error } = await supabase
      .from("gastos")
      .select("*")
      .eq("id_bus", busId);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error obteniendo gastos del bus:", error);
    return [];
  }
};

/** Obtener todos los gastos de los buses de un usuario */
const getGastosByUser = async (userId) => {
  try {
    const { data: gastos, error } = await supabase
      .from("buses")
      .select(`
        id, placa, nombre_ruta, id_dueño, modelo,
        gastos(*)
      `)
      .eq("id_dueño", userId);

    if (error) throw error;

    return gastos || [];
  } catch (error) {
    console.error("Error obteniendo gastos por usuario:", error);
    return [];
  }
};


/** Eliminar un gasto por ID */
const deleteGasto = async (gastoId) => {
  try {
    const { error } = await supabase
      .from("gastos")
      .delete()
      .eq("id", gastoId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error eliminando gasto:", error);
    return false;
  }
};

// ✅ Exportando todas las funciones al final
export { createGasto, getGasto, getGastosByBus, getGastosByUser, deleteGasto };
