import { errorResponse, isAdmin, verifyAuth } from "../../../../lib/auth";
import {
  deleteAlumno,
  getAlumno,
  updateAlumno,
} from "../../../../server/alumnos";
import { getBus } from "../../../../server/buses";

const canAccessBus = (auth, bus) =>
  isAdmin(auth) ||
  bus.id_dueño === auth.uid ||
  bus.id_conductor === auth.uid;

const canManageBus = (auth, bus) =>
  isAdmin(auth) || bus.id_dueño === auth.uid;

const loadResource = async (params) => {
  const { id } = await params;
  const alumnoId = Number(id);
  if (!Number.isInteger(alumnoId) || alumnoId <= 0) {
    return { error: "ID inválido", status: 400 };
  }
  const alumno = await getAlumno(alumnoId);
  if (!alumno) return { error: "Alumno no encontrado", status: 404 };
  const bus = await getBus(alumno.id_bus);
  if (!bus) return { error: "Unidad del alumno no encontrada", status: 404 };
  return { alumnoId, alumno, bus };
};

export async function GET(request, { params }) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);

  try {
    const resource = await loadResource(params);
    if (resource.error) return errorResponse(resource.error, resource.status);
    if (!canAccessBus(auth.data, resource.bus)) {
      return errorResponse("No tienes acceso a este alumno", 403);
    }
    return Response.json({ data: resource.alumno });
  } catch (error) {
    console.error("GET /api/alumnos/[id]:", error);
    return errorResponse("Error al consultar el alumno", 500);
  }
}

export async function PATCH(request, { params }) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);

  try {
    const resource = await loadResource(params);
    if (resource.error) return errorResponse(resource.error, resource.status);
    if (!canManageBus(auth.data, resource.bus)) {
      return errorResponse("No tienes permiso para editar este alumno", 403);
    }

    const body = await request.json();
    if (body.id_bus !== undefined && Number(body.id_bus) !== resource.alumno.id_bus) {
      const targetBus = await getBus(Number(body.id_bus));
      if (!targetBus) return errorResponse("Unidad destino no encontrada", 404);
      if (!canManageBus(auth.data, targetBus)) {
        return errorResponse("No puedes mover el alumno a esa unidad", 403);
      }
      body.id_bus = Number(body.id_bus);
    }

    const data = await updateAlumno(resource.alumnoId, body);
    return Response.json({ data });
  } catch (error) {
    console.error("PATCH /api/alumnos/[id]:", error);
    return errorResponse("Error al actualizar el alumno", 500);
  }
}

export async function DELETE(request, { params }) {
  const auth = await verifyAuth(request);
  if (auth.error) return errorResponse(auth.error, auth.status);

  try {
    const resource = await loadResource(params);
    if (resource.error) return errorResponse(resource.error, resource.status);
    if (!canManageBus(auth.data, resource.bus)) {
      return errorResponse("No tienes permiso para eliminar este alumno", 403);
    }

    const data = await deleteAlumno(resource.alumnoId);
    return Response.json({ data });
  } catch (error) {
    console.error("DELETE /api/alumnos/[id]:", error);
    return errorResponse("Error al eliminar el alumno", 500);
  }
}
