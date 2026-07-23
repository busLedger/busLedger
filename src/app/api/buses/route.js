import { errorResponse, hasRole, isAdmin, verifyAuth } from "../../../lib/auth";
import {
  createBus,
  getFinancialBuses,
  getOwnedBuses,
} from "../../../server/buses";

export async function GET(request) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);
  if (!hasRole(auth.data, ["Dueño"])) {
    return errorResponse("No tienes permiso para consultar unidades", 403);
  }

  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "owned";
    const all = searchParams.get("all") === "true";

    if (all && !isAdmin(auth.data)) {
      return errorResponse("Solo un administrador puede consultar todas las unidades", 403);
    }

    const data =
      view === "financials"
        ? await getFinancialBuses(all ? {} : { uid: auth.data.uid })
        : await getOwnedBuses(auth.data.uid);

    return Response.json({ data });
  } catch (error) {
    console.error("GET /api/buses:", error);
    return errorResponse("Error al consultar unidades", 500);
  }
}

export async function POST(request) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);
  if (!hasRole(auth.data, ["Dueño"])) {
    return errorResponse("No tienes permiso para crear unidades", 403);
  }

  try {
    const body = await request.json();
    const newBus = {
      ...body,
      // Un dueño no puede crear buses a nombre de otro usuario.
      id_dueño: isAdmin(auth.data) ? body.id_dueño : auth.data.uid,
    };

    if (
      !newBus.placa ||
      !newBus.modelo ||
      !newBus.año ||
      !newBus.id_dueño ||
      !newBus.id_conductor
    ) {
      return errorResponse("Placa, modelo, año, dueño y conductor son requeridos", 400);
    }

    const data = await createBus(newBus);
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/buses:", error);
    return errorResponse("Error al crear la unidad", 500);
  }
}
