import { supabase } from "../../supabase_connection";

/** Crear un nuevo bus */
const createBus = async (newBus) => {
  try {
    const { data, error } = await supabase
      .from("buses")
      .insert([newBus])
      .select("*")
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error creando bus:", error);
    return null;
  }
};

/** Obtener información de un bus por ID */
const getBus = async (busId) => {
  try {
    const { data, error } = await supabase
      .from("buses")
      .select("*")
      .eq("id", busId)
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error obteniendo bus:", error);
    return null;
  }
};

/** Obtener buses por dueño o conductor (sin duplicados) */
const getBuses = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("buses")
      .select("*")
      .or(`id_dueño.eq.${userId},id_conductor.eq.${userId}`);

    if (error) throw error;

    // Eliminar duplicados si el usuario es dueño y conductor del mismo bus
    const uniqueBuses = data.filter((bus, index, self) =>
      index === self.findIndex((b) => b.id === bus.id)
    );

    return uniqueBuses;
  } catch (error) {
    console.error("Error obteniendo buses:", error);
    return [];
  }
};

/** Actualizar información de un bus */
const updateBus = async (busId, updatedData) => {
  try {
    const { data, error } = await supabase
      .from("buses")
      .update(updatedData)
      .eq("id", busId)
      .select("*")
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error actualizando bus:", error);
    return null;
  }
};

/** Eliminar un bus por ID */
const deleteBus = async (busId) => {
  try {
    const { error } = await supabase
      .from("buses")
      .delete()
      .eq("id", busId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error eliminando bus:", error);
    return false;
  }
};

export { createBus, getBus, getBuses, updateBus, deleteBus };
