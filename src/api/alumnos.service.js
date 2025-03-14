import { supabase } from "../../supabase_connection";

/** Crear un nuevo alumno */
const createAlumno = async (newAlumno) => {
  try {
    const { data, error } = await supabase
      .from("alumnos")
      .insert([newAlumno])
      .select("*")
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error creando alumno:", error);
    return null;
  }
};

/** Modificar la información de un alumno */
const updateAlumno = async (alumnoId, updatedData) => {
  try {
    const { data, error } = await supabase
      .from("alumnos")
      .update(updatedData)
      .eq("id", alumnoId)
      .select("*")
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error actualizando alumno:", error);
    return null;
  }
};

/** Obtener un alumno por su ID */
const getAlumno = async (alumnoId) => {
  try {
    const { data, error } = await supabase
      .from("alumnos")
      .select(`
        id, nombre, encargado, no_encargado,id_bus, direccion, ubicacion, pago_mensual, activo,
        pagos_alumnos(*)
        `)
      .eq("id", alumnoId);
    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error obteniendo alumno:", error);
    return null;
  }
};

/** Obtener alumnos de un bus específico */
const getAlumnosByBus = async (busId) => {
  try {
    const { data, error } = await supabase
      .from("alumnos")
      .select("*")
      .eq("id_bus", busId);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error obteniendo alumnos del bus:", error);
    return [];
  }
};

/** Obtener todos los alumnos de los buses de un usuario */
const getAllAlumnosByUser = async (userId) => {
  try {
    // Obtener los buses donde el usuario es dueño o conductor
    const { data: buses, error: busError } = await supabase
      .from("buses")
      .select("id, placa, nombre_ruta, id_dueño, id_conductor")
      .or(`id_dueño.eq.${userId},id_conductor.eq.${userId}`);

    if (busError) throw busError;

    if (!buses.length) return [];

    // Obtener los alumnos de estos buses
    const busIds = buses.map(bus => bus.id);
    const { data: alumnos, error: alumnosError } = await supabase
      .from("alumnos")
      .select("*")
      .in("id_bus", busIds)
      .eq("activo", true);

    if (alumnosError) throw alumnosError;

    // Agrupar los alumnos por bus
    const alumnosPorBus = alumnos.reduce((acc, alumno) => {
      if (!acc[alumno.id_bus]) {
        acc[alumno.id_bus] = [];
      }
      acc[alumno.id_bus].push(alumno);
      return acc;
    }, {});

    // Combinar la información de los buses con los alumnos
    const busesConAlumnos = buses.map(bus => ({
      ...bus,
      alumnos: alumnosPorBus[bus.id] || []
    }));

    return busesConAlumnos;
  } catch (error) {
    console.error("Error obteniendo alumnos por usuario:", error);
    return [];
  }
};

/** Activar o desactivar un alumno */
const toggleAlumnoStatus = async (alumnoId, isActive) => {
  try {
    const { data, error } = await supabase
      .from("alumnos")
      .update({ activo: isActive })
      .eq("id", alumnoId)
      .select("activo");

    if (error) throw error;

    return data[0];
  } catch (error) {
    console.error("Error cambiando estado del alumno:", error);
    return null;
  }
};

/** Eliminar un alumno por ID */
const deleteAlumno = async (alumnoId) => {
  try {
    const { error } = await supabase
      .from("alumnos")
      .delete()
      .eq("id", alumnoId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error eliminando alumno:", error);
    return false;
  }
};

export {
  createAlumno,
  updateAlumno,
  getAlumno,
  getAlumnosByBus,
  getAllAlumnosByUser,
  toggleAlumnoStatus,
  deleteAlumno
};
