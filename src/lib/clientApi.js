const request = async (service, action, payload = {}) => {
  const response = await fetch("/api/rpc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ service, action, payload }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || "Error consultando la API");
  }

  return result.data;
};

export { request };
