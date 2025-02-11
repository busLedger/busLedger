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
      .select("*")
      .eq("id", alumnoId)
      .single();

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
      .select("id")
      .or(`id_dueño.eq.${userId},id_conductor.eq.${userId}`);

    if (busError) throw busError;

    if (!buses.length) return [];

    // Extraer los IDs de los buses sin duplicados
    const busIds = [...new Set(buses.map(bus => bus.id))];

    // Obtener los alumnos de estos buses
    const { data: alumnos, error: alumnosError } = await supabase
      .from("alumnos")
      .select("*")
      .in("id_bus", busIds);

    if (alumnosError) throw alumnosError;

    return alumnos;
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
