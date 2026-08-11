import { getFirebaseAuth } from "../../firebase_connection";

const authFetch = async (url, options = {}) => {
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  const token = await user?.getIdToken();
  if (!token) {
    throw new Error("No autenticado");
  }

  const fetchWithToken = (idToken) =>
    fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        ...options.headers,
      },
    });

  let response = await fetchWithToken(token);

  if (response.status === 401 && user) {
    const refreshedToken = await user.getIdToken(true);
    response = await fetchWithToken(refreshedToken);
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(result.error || "Error consultando la API");
    error.status = response.status;
    throw error;
  }

  return result.data;
};

export { authFetch };
