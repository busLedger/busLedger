"use client";

import PropTypes from "prop-types";
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { notification } from "antd";
import { getFirebaseAuth } from "../../../firebase_connection";

const AuthContext = createContext(null);

const showAuthError = (error) => {
  const messages = {
    "auth/invalid-credential": "Credenciales incorrectas.",
    "auth/user-not-found": "Usuario no encontrado.",
    "auth/invalid-email": "Correo electrónico no válido.",
  };

  notification.error({
    message: "Error de autenticación",
    description: messages[error.code] || "Error inesperado.",
    placement: "topRight",
  });
};

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setAuthLoading(false);
      return undefined;
    }

    return onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
    });
  }, []);

  const forgotPassword = async (email) => {
    if (!email) {
      notification.error({
        message: "Error",
        description: "Por favor, ingresa tu correo electrónico.",
        placement: "topRight",
      });
      return { success: false };
    }

    try {
      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, email);
      notification.success({
        message: "Correo enviado",
        description:
          "Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico.",
        placement: "topRight",
      });
      return { success: true };
    } catch (error) {
      console.error("Error al enviar el correo de recuperación:", error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = async ({ notify = true } = {}) => {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
      if (notify) {
        notification.success({
          message: "Sesión cerrada",
          description: "¡Nos vemos pronto!",
          placement: "topRight",
        });
      }
      return { success: true };
    } catch (error) {
      console.error("Error al cerrar sesión:", error.message);
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    if (!email || !password) {
      notification.error({
        message: "Error de autenticación",
        description: "Debe llenar los campos.",
        placement: "topRight",
      });
      return { authenticated: false };
    }

    try {
      const auth = getFirebaseAuth();
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      if (!user.emailVerified) {
        notification.info({
          message: "Primer inicio de sesión",
          description: "Es necesario que actualices tu contraseña.",
          placement: "topRight",
        });
        await forgotPassword(email);
        await logout({ notify: false });
        return { authenticated: false };
      }

      notification.success({
        message: "Inicio de sesión exitoso",
        description: "Bienvenido",
        placement: "topRight",
      });
      return { authenticated: true };
    } catch (error) {
      showAuthError(error);
      return { authenticated: false };
    }
  };

  const value = {
    firebaseUser,
    authLoading,
    isAuthenticated: Boolean(firebaseUser),
    login,
    logout,
    forgotPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
