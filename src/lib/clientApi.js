import { auth } from "../../firebase_connection";

const authFetch = async (url, options = {}) => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error("No autenticado");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || "Error consultando la API");
  }

  return result.data;
};

export { authFetch };
