import { useQuery } from "@tanstack/react-query";
import { getAllAlumnosByUser, getAlumno } from "@/api/alumnos.service";
import { queryKeys } from "./queryKeys";

const useAlumnosByUserQuery = (userId) =>
  useQuery({
    queryKey: queryKeys.alumnos.byUser(userId),
    queryFn: () => getAllAlumnosByUser(userId),
    enabled: Boolean(userId),
  });

const useAlumnoQuery = (alumnoId) =>
  useQuery({
    queryKey: queryKeys.alumnos.detail(alumnoId),
    queryFn: async () => {
      const alumnoData = await getAlumno(alumnoId);
      return Array.isArray(alumnoData) ? alumnoData[0] : alumnoData;
    },
    enabled: Boolean(alumnoId),
  });

export { useAlumnoQuery, useAlumnosByUserQuery };
