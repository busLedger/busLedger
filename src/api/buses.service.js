import { supabase } from "../../supabase_connection";

/** Crear un nuevo bus */
const createBus = async (newBus) => {
  try {
    const { data, error } = await supabase
      .from("buses")
      .insert(newBus)
      .select("*")
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error creando bus:", error);
    return null;
  }
};

const getBusWithFinancials = async (busId) => {
  try {
    let query = supabase
      .from("buses")
      .select(
        `
        id, placa, nombre_ruta, id_dueño,
        dueño:usuarios!buses_id_dueño_fkey(nombre),
        conductor:usuarios!buses_id_conductor_fkey(nombre),
        alumnos(*),
        ingresos(*),
        gastos(*)
        `
      )
      .eq("id", busId)
      .single();

    const { data, error } = await query;

    if (error) throw error;

    return {
      ...data,
      dueño: data.dueño?.nombre || "Desconocido",
      conductor: data.conductor?.nombre || "Desconocido",
      salario: data.salarios_conductores?.reduce((acc, salario) => acc + (salario.monto ?? 0), 0) || 0,
      totalIngresos: data.ingresos?.reduce((acc, ingreso) => acc + (ingreso.total_ingreso ?? 0), 0) || 0,
      totalGastos: data.gastos?.reduce((acc, gasto) => acc + (gasto.monto ?? 0), 0) || 0,
      totalAlumnos: data.alumnos ? data.alumnos.length : 0,
      balance:
        (data.ingresos?.reduce((acc, ingreso) => acc + (ingreso.total_ingreso ?? 0), 0) || 0) -
        (data.gastos?.reduce((acc, gasto) => acc + (gasto.monto ?? 0), 0) || 0) -
        (data.salarios_conductores?.reduce((acc, salario) => acc + (salario.monto ?? 0), 0) || 0),
    };
  } catch (error) {
    console.error("Error obteniendo información financiera del bus:", error);
    return null;
  }
};

/** 🔹 Obtener todos los buses de un dueño con datos financieros */
const getBusesWithFinancials = async (userId) => {
  try {
    let query = supabase
      .from("buses")
      .select(
        `
        id, placa, nombre_ruta, id_dueño,
        dueño:usuarios!buses_id_dueño_fkey(nombre),
        conductor:usuarios!buses_id_conductor_fkey(nombre),
        alumnos(*),
        ingresos(*),
        gastos(*)
        `
      )
      .eq("id_dueño", userId);

    const { data, error } = await query;

    if (error) throw error;

    return data.map((bus) => ({
      ...bus,
      dueño: bus.dueño?.nombre || "Desconocido",
      conductor: bus.conductor?.nombre || "Desconocido",
      salario: bus.salarios_conductores?.reduce((acc, salario) => acc + (salario.monto ?? 0), 0) || 0,
      totalIngresos: bus.ingresos?.reduce((acc, ingreso) => acc + (ingreso.total_ingreso ?? 0), 0) || 0,
      totalGastos: bus.gastos?.reduce((acc, gasto) => acc + (gasto.monto ?? 0), 0) || 0,
      totalAlumnos: bus.alumnos ? bus.alumnos.length : 0,
      balance:
        (bus.ingresos?.reduce((acc, ingreso) => acc + (ingreso.total_ingreso ?? 0), 0) || 0) -
        (bus.gastos?.reduce((acc, gasto) => acc + (gasto.monto ?? 0), 0) || 0) -
        (bus.salarios_conductores?.reduce((acc, salario) => acc + (salario.monto ?? 0), 0) || 0),
    }));
  } catch (error) {
    console.error("Error obteniendo buses con información financiera:", error);
    return [];
  }
};

/** 🔹 Obtener TODOS los buses con datos financieros (Para Admin) */
const getAllBusesWithFinancials = async () => {
  try {
    let query = supabase
      .from("buses")
      .select(
        `
        *,
        duenio:usuarios!buses_id_dueño_fkey(*),
        conductor:usuarios!buses_id_conductor_fkey(*),
        alumnos(*),
        ingresos(*),
        gastos(*)
        `
      );

    const { data, error } = await query;
    console.log('Data cruda:',data)

    if (error) throw error;

    return data.map((bus) => ({
      ...bus,
      dueño: bus.duenio.nombre || "Desconocido",
      conductor: bus.conductor.nombre || "Desconocido",
      salario: bus.salarios_conductores?.reduce((acc, salario) => acc + (salario.monto ?? 0), 0) || 0,
      totalIngresos: bus.ingresos?.reduce((acc, ingreso) => acc + (ingreso.total_ingreso ?? 0), 0) || 0,
      totalGastos: bus.gastos?.reduce((acc, gasto) => acc + (gasto.monto ?? 0), 0) || 0,
      totalAlumnos: bus.alumnos ? bus.alumnos.length : 0,
      balance:
        (bus.ingresos?.reduce((acc, ingreso) => acc + (ingreso.total_ingreso ?? 0), 0) || 0) -
        (bus.gastos?.reduce((acc, gasto) => acc + (gasto.monto ?? 0), 0) || 0) -
        (bus.salarios_conductores?.reduce((acc, salario) => acc + (salario.monto ?? 0), 0) || 0),
    }));
  } catch (error) {
    console.error("Error obteniendo todos los buses con información financiera:", error);
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

const getBusesByUser = async(userId) => {
  try {
    const { data, error } = await supabase
      .from("buses")
      .select("*")
      .eq("id_dueño", userId);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error obteniendo buses del usuario:", error);
    return [];
  }
}

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

export {getBusesByUser, createBus, getBusWithFinancials, getBusesWithFinancials, updateBus, deleteBus, getAllBusesWithFinancials };
