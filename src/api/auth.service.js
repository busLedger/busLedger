import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut
  } from "firebase/auth";
  import { auth } from "../../firebase_connection";
  import { notification } from "antd";
  const login = async (email, password) => {
    try {
      if(email == "" || password ==""){
        notification.error({
          message: "Error de Autenticación",
          description: "Debe de llenar los campos",
          placement: "topRight",
        });
        return { authenticated: false };
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        notification.info({
          message: "Primer Inicio de Sesión",
          description:
            "Es necesario que actualices tu contraseña",
          placement: "topRight",
        });
        await forgotPassword(email);
        await logout();
        return { authenticated: false };
      }
      
      notification.success({
        message: "Inicio de sesion exitoso",
        description:
          `Bienvenido`,
        placement: "topRight",
      });
      return { authenticated: true};
    } catch (error) {
       handleAuthError(error);
      return { authenticated: false};
    }
  };
  
  
  const forgotPassword = async (email) => {
    try {
      if (!email ) {
        notification.error({
          message: "Error",
          description: "Por favor, ingresa tu correo electrónico.",
          placement: "topRight",
        });
        return;
      }
      await sendPasswordResetEmail(auth, email);
      notification.success({
        message: "Correo enviado",
        description:
          "Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico.",
        placement: "topRight",
      });
    } catch (error) {
      console.log("Error al enviar el correo de recuperación:", error.message);
    }
  };
  const checkActiveSession = () => {
    
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
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
  
  const  handleAuthError = (error) => {
    let errorMessage = "Error inesperado.";
  
    if (error.code === "auth/invalid-credential") {
      errorMessage = "Credenciales incorrectas.";
    } else if (error.code === "auth/user-not-found") {
      errorMessage = "Usuario no encontrado.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Correo electrónico no válido.";
    }
    notification.error({
      message: "Error de Autenticación",
      description: errorMessage,
      placement: "topRight",
    });
    return
  };
  
  export { login, logout, forgotPassword, checkActiveSession };
  