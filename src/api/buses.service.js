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

const getBusWithFinancials = async (busId, mes) => {
  try {
    let query = supabase
      .from("buses")
      .select(
        `
        id, placa, nombre_ruta, id_dueño,
        dueño:usuarios!buses_id_dueño_fkey(nombre),
        salarios_conductores!inner(monto, mes),
        ingresos!inner(total_ingreso, fecha),
        gastos!inner(monto, fecha_gasto, tipo_gasto),
        alumnos!inner(id)
        `
      )
      .eq("id", busId)
      .single();

    if (mes) {
      query = query
        .eq("ingresos.fecha", mes)
        .eq("gastos.fecha_gasto", mes)
        .eq("salarios_conductores.mes", mes);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      ...data,
      dueño: data.dueño?.nombre || "Desconocido",
      salario: data.salarios_conductores?.[0]?.monto ?? 0,
      totalIngresos: data.ingresos?.reduce((acc, ingreso) => acc + (ingreso.total_ingreso ?? 0), 0) || 0,
      totalGastos: data.gastos?.reduce((acc, gasto) => acc + (gasto.monto ?? 0), 0) || 0,
      totalAlumnos: data.alumnos ? data.alumnos.length : 0,
      balance:
        (data.ingresos?.reduce((acc, ingreso) => acc + (ingreso.total_ingreso ?? 0), 0) || 0) -
        (data.gastos?.reduce((acc, gasto) => acc + (gasto.monto ?? 0), 0) || 0) -
        (data.salarios_conductores?.[0]?.monto ?? 0),
    };
  } catch (error) {
    console.error("Error obteniendo información financiera del bus:", error);
    return null;
  }
};

/** 🔹 Obtener todos los buses de un dueño con datos financieros */
const getBusesWithFinancials = async (userId, mes) => {
  try {
    let query = supabase
      .from("buses")
      .select(
        `
        id, placa, nombre_ruta, id_dueño,
        dueño:usuarios!buses_id_dueño_fkey(nombre),
        salarios_conductores!inner(monto, mes),
        ingresos!inner(total_ingreso, fecha),
        gastos!inner(monto, fecha_gasto, tipo_gasto),
        alumnos!inner(id)
        `
      )
      .eq("id_dueño", userId);

    if (mes) {
      query = query
        .eq("ingresos.fecha", mes)
        .eq("gastos.fecha_gasto", mes)
        .eq("salarios_conductores.mes", mes);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map((bus) => ({
      ...bus,
      dueño: bus.dueño?.nombre || "Desconocido",
      salario: bus.salarios_conductores?.[0]?.monto ?? 0,
      totalIngresos: bus.ingresos?.reduce((acc, ingreso) => acc + (ingreso.total_ingreso ?? 0), 0) || 0,
      totalGastos: bus.gastos?.reduce((acc, gasto) => acc + (gasto.monto ?? 0), 0) || 0,
      totalAlumnos: bus.alumnos ? bus.alumnos.length : 0,
      balance:
        (bus.ingresos?.reduce((acc, ingreso) => acc + (ingreso.total_ingreso ?? 0), 0) || 0) -
        (bus.gastos?.reduce((acc, gasto) => acc + (gasto.monto ?? 0), 0) || 0) -
        (bus.salarios_conductores?.[0]?.monto ?? 0),
    }));
  } catch (error) {
    console.error("Error obteniendo buses con información financiera:", error);
    return [];
  }
};

/** 🔹 Obtener TODOS los buses con datos financieros (Para Admin) */
const getAllBusesWithFinancials = async (mes) => {
  try {
    let query = supabase
      .from("buses")
      .select(
        `
        id, placa, nombre_ruta, id_dueño,
        dueño:usuarios!buses_id_dueño_fkey(uid, nombre),
        salarios_conductores!inner(monto, mes),
        ingresos!inner(total_ingreso, fecha),
        gastos!inner(monto, fecha_gasto, tipo_gasto),
        alumnos!inner(id)
        `
      );

    if (mes) {
      query = query
        .eq("ingresos.fecha", mes)
        .eq("gastos.fecha_gasto", mes)
        .eq("salarios_conductores.mes", mes);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map((bus) => ({
      ...bus,
      dueño: bus.dueño?.nombre || "Desconocido",
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

export { createBus, getBusWithFinancials, getBusesWithFinancials, updateBus, deleteBus, getAllBusesWithFinancials };
