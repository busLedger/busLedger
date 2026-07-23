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

const request = async (service, action, payload = {}) => {
  return authFetch("/api/rpc", {
    method: "POST",
    body: JSON.stringify({ service, action, payload }),
  });
};

export { authFetch, request };
