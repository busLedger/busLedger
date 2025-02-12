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
    const { data, error } = await supabase
      .from("buses")
      .select(
        `*, 
        conductor:usuarios(nombre), 
        salarios_conductores:salarios_conductores(monto as salario),
        ingresos:ingresos(id_bus, SUM(total_ingreso) as totalIngresos),
        gastos:gastos(id_bus, SUM(monto) as totalGastos),
        alumnos:alumnos(id_bus, COUNT(id) as totalAlumnos)`
      )
      .eq("id", busId)
      .eq("ingresos.fecha", mes)
      .eq("gastos.fecha_gasto", mes)
      .eq("salarios_conductores.mes", mes)
      .eq("salarios_conductores.id_bus", busId)
      .eq("alumnos.id_bus", busId)
      .single();

    if (error) throw error;

    // Estructurar la respuesta
    return {
      ...data,
      conductor: data.conductor?.nombre || "Desconocido",
      salario: data.salarios_conductores?.salario || 0,
      totalIngresos: data.ingresos?.totalIngresos || 0,
      totalGastos: data.gastos?.totalGastos || 0,
      totalAlumnos: data.alumnos?.totalAlumnos || 0,
      balance: (data.ingresos?.totalIngresos || 0) - (data.gastos?.totalGastos || 0) - (data.salarios_conductores?.salario || 0)
    };
  } catch (error) {
    console.error("Error obteniendo información financiera del bus:", error);
    return null;
  }
};

/** 🔹 Obtener todos los buses de un usuario con datos financieros y del conductor */
const getBusesWithFinancials = async (userId, mes) => {
  try {
    const { data, error } = await supabase
      .from("buses")
      .select(
        `*, 
        conductor:usuarios(id, nombre),
        salarios_conductores:salarios_conductores(monto as salario),
        ingresos:ingresos(id_bus, SUM(total_ingreso) as totalIngresos),
        gastos:gastos(id_bus, SUM(monto) as totalGastos),
        alumnos:alumnos(id_bus, COUNT(id) as totalAlumnos)`
      )
      .or(`id_dueño.eq.${userId},id_conductor.eq.${userId}`)
      .eq("ingresos.fecha", mes)
      .eq("gastos.fecha_gasto", mes)
      .eq("salarios_conductores.mes", mes)
      .eq("salarios_conductores.id_bus", supabase.raw("buses.id"))
      .eq("alumnos.id_bus", supabase.raw("buses.id"));

    if (error) throw error;

    // Estructurar la respuesta para cada bus
    return data.map(bus => ({
      ...bus,
      conductor: bus.conductor?.nombre || "Desconocido",
      salario: bus.salarios_conductores?.salario || 0,
      totalIngresos: bus.ingresos?.totalIngresos || 0,
      totalGastos: bus.gastos?.totalGastos || 0,
      totalAlumnos: bus.alumnos?.totalAlumnos || 0,
      balance: (bus.ingresos?.totalIngresos || 0) - (bus.gastos?.totalGastos || 0) - (bus.salarios_conductores?.salario || 0)
    }));
  } catch (error) {
    console.error("Error obteniendo buses con información financiera:", error);
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

export { createBus, getBusWithFinancials, getBusesWithFinancials, updateBus, deleteBus };
