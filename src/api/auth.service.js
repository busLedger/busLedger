import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut
  } from "firebase/auth";
  import { auth } from "../../firebase_connection";
  import {supabase} from "../../supabase_connection";
  
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("UID del usuario:", user.uid);
  
     
  
      const { data: userInfo, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("uid", user.uid)
        .single();
  
      if (error) {
        console.log("Error obteniendo información del usuario en Supabase:", error.message);
        return { authenticated: true, uid: user.uid, userInfo: null, error: "No se pudo obtener la información del usuario." };
      }
      
      console.log("Información del usuario desde Supabase:", userInfo);
      
      if (!user.emailVerified) {
        console.log("Error: Debes verificar tu correo electrónico antes de iniciar sesión.");
        await logout();
        return { authenticated: false, uid: user.uid, userInfo: null, error: "Debes verificar tu correo electrónico antes de iniciar sesión." };
      }
  
      console.log("Inicio de sesión exitoso. UID:", user.uid);
  
      return { authenticated: true, uid: user.uid, userInfo, error: null };
    } catch (error) {
      return handleAuthError(error);
    }
  };
  
  
  const forgotPassword = async (email) => {
    try {
      if (!email) {
        console.log("Error: Debes ingresar tu correo electrónico.");
        return;
      }
  
      await sendPasswordResetEmail(auth, email);
      console.log("Se ha enviado un enlace para restablecer tu contraseña.");
    } catch (error) {
      console.log("Error al enviar el correo de recuperación:", error.message);
    }
  };
  
  const checkActiveSession = () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log("Sesión activa. UID:", user.uid);
          resolve({ uid: user.uid });
        } else {
          console.log("No hay sesión activa.");
          resolve({ uid: null });
        }
      });
    });
  };
  
  const logout = async () => {
    try {
      await signOut(auth);
      console.log("Sesión cerrada correctamente.");
      return { success: true };
    } catch (error) {
      console.log("Error al cerrar sesión:", error.message);
      return { success: false, error: error.message };
    }
  };
  
  const handleAuthError = (error) => {
    let errorMessage = "Error inesperado.";
  
    if (error.code === "auth/invalid-credential") {
      errorMessage = "Credenciales incorrectas.";
    } else if (error.code === "auth/user-not-found") {
      errorMessage = "Usuario no encontrado.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Correo electrónico no válido.";
    }
  
    console.log("Error de autenticación:", errorMessage);
    return { authenticated: false, uid: null, error: errorMessage };
  };
  
  export { login, logout, forgotPassword, checkActiveSession };
  