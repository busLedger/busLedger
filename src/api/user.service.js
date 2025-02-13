import { supabase } from "../../supabase_connection";
const user_data = JSON.parse(localStorage.getItem("user"));

const getAllUsers = async () => {
  const { data, error } = await supabase
    .from("usuarios")
    .select(`
      uid, nombre, correo, whatsapp, activo, fecha_creacion,
      usuarios_roles ( roles ( nombre ) )
    `);

  if (error) {
    console.error("Error obteniendo usuarios:", error);
    return [];
  }

  return data.map(usuario => ({
    ...usuario,
    roles: usuario.usuarios_roles.map(ur => ur.roles.nombre)
  }));
};


const getUserData = async () => {
  const { data, error } = await supabase
    .from("usuarios")
    .select(`
      uid, nombre, correo, whatsapp, activo, fecha_creacion,
      usuarios_roles ( roles ( nombre ) )
    `)
    .eq("uid", user_data.uid);

  if (error) {
    console.error("Error obteniendo información del usuario:", error);
    return null;
  }

  if (data.length === 0) {
    console.log("Usuario no encontrado");
    return null;
  }

  const usuario = data[0];
  usuario.roles = usuario.usuarios_roles.map(ur => ur.roles.nombre);
  delete usuario.usuarios_roles;

  return usuario;
};


const createUser = async (newUser, roles) => {
    try {
      // 1️⃣ Insertar usuario en la tabla `usuarios`
      const { data: userData, error: userError } = await supabase
        .from("usuarios")
        .insert([{ 
          uid: newUser.uid, 
          nombre: newUser.nombre, 
          correo: newUser.correo, 
          whatsapp: newUser.whatsapp || null, 
          activo: newUser.activo !== undefined ? newUser.activo : true
        }])
        .select("*")
        .single();
  
      if (userError) throw userError;
      console.log("Usuario creado:", userData, "Roles:", roles);


      // 3️⃣ Insertar en `usuarios_roles` los roles asignados
      const rolesToInsert = roles.map(role => ({
        uid_usuario: newUser.uid,
        id_rol: role.id
      }));
  
      const { error: roleAssignError } = await supabase
        .from("usuarios_roles")
        .insert(rolesToInsert);
  
      if (roleAssignError) throw roleAssignError;
  
      // 4️⃣ Devolver el usuario creado con sus roles
      return { ...userData, roles };
    } catch (error) {
      console.error("Error creando usuario con roles:", error);
      return null;
    }
  };


const updateUser = async (uid, updatedUser) => {
  const { data, error } = await supabase
    .from("usuarios")
    .update(updatedUser)
    .eq("uid", uid)
    .select("*");

  if (error) {
    console.error("Error actualizando usuario:", error);
    return null;
  }

  return data[0];
};


const toggleUserStatus = async (uid, isActive) => {
  const { data, error } = await supabase
    .from("usuarios")
    .update({ activo: isActive })
    .eq("uid", uid)
    .select("activo");

  if (error) {
    console.error("Error cambiando estado del usuario:", error);
    return null;
  }

  return data[0];
};

const getRoles = async () => {
  const { data, error } = await supabase
    .from("roles")
    .select(`*`)
    .eq("");

  if (error) {
    console.error("Error obteniendo roles:", error);
    return null;
  }

  return data;
};



export { getAllUsers, getUserData, createUser, updateUser, toggleUserStatus, getRoles };