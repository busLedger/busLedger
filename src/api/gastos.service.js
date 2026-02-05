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

/** Obtener meses y años con registros de gastos */
const getMesesYAniosConRegistros = async (userId) => {
  try {
    const { data: buses, error: busError } = await supabase
      .from("buses")
      .select("id")
      .eq("id_dueño", userId);

    if (busError) throw busError;
    if (!buses.length) return [];

    const busIds = [...new Set(buses.map((bus) => bus.id))];

    const { data: gastos, error: gastosError } = await supabase
      .from("gastos")
      .select("fecha_gasto")
      .in("id_bus", busIds);

    if (gastosError) throw gastosError;

    const registros = {};

    gastos.forEach((gasto) => {
      const fecha = new Date(gasto.fecha_gasto);
      const anio = fecha.getFullYear();
      const mes = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(fecha);

      if (!registros[anio]) {
        registros[anio] = new Set();
      }
      registros[anio].add(mes);
    });

    const resultado = Object.keys(registros).map((anio) => ({
      anio: parseInt(anio),
      meses: [...registros[anio]].sort(
        (a, b) =>
          new Date(`${anio}-${a}-01`).getMonth() -
          new Date(`${anio}-${b}-01`).getMonth()
      ),
    }));

    return resultado.sort((a, b) => b.anio - a.anio);
  } catch (error) {
    console.error("Error obteniendo meses y años con registros:", error);
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

export {
  createGasto,
  getGasto,
  getGastosByBus,
  getGastosByUser,
  deleteGasto,
  getMesesYAniosConRegistros,
};