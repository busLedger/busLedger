import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useResponsivePagination } from "../../Hooks/useResponsivePagination.js";
import { useHome } from "../../components/providers/HomeProvider";
import { useAlumnos } from "../../Hooks/swr/useAlumnos.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/CardUsers";
import { RegisterAlumnoModal } from "../../components/ui/Modales/RegisterAlumnoModal.jsx";
import { RegisterPagoModal } from "../../components/ui/Modales/RegisterPagoModal.jsx";
import { message } from "antd";
import { Load } from "../../components/ui/Load.jsx";
import { Fab } from "../../components/ui/Fab/Fab.jsx";
import Button from "../../components/ui/Button.jsx";
import { Pagination } from "../../components/ui/Pagination/Pagination.jsx";
import FilterTabs from "../../components/ui/FilterTabs.jsx";
import Input from "../../components/ui/Input.jsx";
import imgAlumno from "../../assets/school.png";
import { Search, MapPin } from "lucide-react";
import { imageSrc } from "@/lib/assets";

export const Alumnos = () => {
  const router = useRouter();
  const { darkMode } = useHome();
  const { pageSize, currentPage, setCurrentPage, isPaginated } =
    useResponsivePagination(3);

  const { buses, isLoading: loading } = useAlumnos();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBus, setSelectedBus] = useState("Todos");
  const [isRegisterAlumnoModalOpen, setIsRegisterAlumnoModalOpen] =
    useState(false);
  const [isRegisterPagoModalOpen, setIsRegisterPagoModalOpen] = useState(false);
  const [selectedAlumno, setSelectedAlumno] = useState(null);

  const alumnos = useMemo(
    () =>
      buses.flatMap((bus) =>
        bus.alumnos.map((alumno) => ({ ...alumno, bus: bus.nombre_ruta }))
      ),
    [buses]
  );
  const optionsTab = useMemo(
    () => ["Todos", ...new Set(buses.map((bus) => bus.nombre_ruta))],
    [buses]
  );
  const filteredAlumnos = useMemo(
    () =>
      alumnos.filter(
        (alumno) =>
          (selectedBus === "Todos" || alumno.bus === selectedBus) &&
          (!searchTerm ||
            alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [alumnos, searchTerm, selectedBus]
  );

  const handleFilterChange = (value) => {
    setSelectedBus(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRegisterPagoClick = (alumno) => {
    setSelectedAlumno(alumno);
    setIsRegisterPagoModalOpen(true);
  };

  const handleVerUbicacion = (ubicacion) => {
    if (!ubicacion || ubicacion === "") {
      message.warning("No hay ubicación disponible para este alumno");
      return;
    }

    // Abrir Google Maps con la ubicación
    // Formato esperado de ubicación: "latitud,longitud" o dirección
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ubicacion)}`;
    window.open(mapsUrl, "_blank");
  };

  const VerAlumno = (id) => () => {
    console.log("Ver alumno", id);
    router.push(`/home/alumnos/${id}`);
  };

  const paginatedAlumnos = isPaginated
    ? filteredAlumnos.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      )
    : filteredAlumnos;

  return (
    <div className="min-h-screen w-full bg-background p-4 md:p-6">
      <div className="w-full space-y-4">
        {/* Header */}
        <div className="space-y-3">
          <div>
            <h2 className="text-3xl md:text-2xl font-bold tracking-tight text-foreground">
              Gestión de Alumnos
            </h2>
            <p className="text-sm text-muted-foreground">
              Administra los estudiantes y sus pagos
            </p>
          </div>

          {/* Filtros */}
          <div className="flex flex-col gap-3">
            {/* Tabs de buses */}
            <div className="w-full">
              <FilterTabs
                options={optionsTab}
                onSelect={handleFilterChange}
                theme={darkMode}
              />
            </div>

            {/* Input de búsqueda */}
            <div className="relative w-full sm:w-2/3 lg:w-1/2">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <Input
                className="pl-10 w-full"
                theme={darkMode}
                type="text"
                name="nombre"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar alumno por nombre"
              />
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="pt-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Load />
            </div>
          ) : filteredAlumnos.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {paginatedAlumnos.map((alumno) => (
                <Card key={alumno.id} theme={darkMode}>
                  <div onClick={VerAlumno(alumno.id)} className="cursor-pointer">
                    <CardHeader>
                      <div className="flex gap-3 items-center">
                        <div className="flex-shrink-0">
                          <img
                            src={imageSrc(imgAlumno)}
                            alt="Alumno"
                            className="w-14 h-14 rounded-full border-2 border-indigo-600"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="truncate">
                            {alumno.nombre}
                          </CardTitle>
                          <p
                            className={`text-sm truncate mt-1 ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {alumno.apellido}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent
                      items={[
                        `Encargado: ${alumno.encargado}`,
                        `No. Encargado: ${alumno.no_encargado}`,
                        `Dirección: ${alumno.direccion}`,
                        `Costo: ${alumno.pago_mensual.toLocaleString("es-HN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} L`,
                        `Bus: ${alumno.bus}`,
                      ]}
                      theme={darkMode}
                    />
                  </div>

                  {/* Botones de acción */}
                  <div
                    className={`
                    border-t pt-3 pb-1 px-4 
                    flex flex-col sm:flex-row gap-2 justify-center
                    ${darkMode ? "border-gray-700" : "border-gray-200"}
                  `}
                  >
                    <Button
                      text="Registrar Pago"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegisterPagoClick(alumno);
                      }}
                      className="flex-1 sm:flex-none"
                    />
                    {alumno.ubicacion && alumno.ubicacion !== "" && (
                      <Button
                        text={
                          <div className="flex items-center justify-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Ver Ubicación
                          </div>
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVerUbicacion(alumno.ubicacion);
                        }}
                        className="flex-1 sm:flex-none"
                      />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div
                className={`rounded-full p-6 mb-4 ${
                  darkMode ? "bg-gray-800" : "bg-gray-100"
                }`}
              >
                <img
                  src={imageSrc(imgAlumno)}
                  alt="No hay alumnos"
                  className="w-16 h-16 opacity-50"
                />
              </div>
              <h3
                className={`text-lg font-semibold mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                No hay alumnos disponibles
              </h3>
              <p
                className={`text-sm mb-4 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {searchTerm || selectedBus !== "Todos"
                  ? "No se encontraron resultados para tu búsqueda"
                  : "Comienza agregando tu primer alumno"}
              </p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {isPaginated && filteredAlumnos.length > 0 && (
          <div className="flex justify-center pt-4">
            <Pagination
              totalItems={filteredAlumnos.length}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Modales */}
      <RegisterAlumnoModal
        isOpen={isRegisterAlumnoModalOpen}
        onClose={() => setIsRegisterAlumnoModalOpen(false)}
        theme={darkMode}
        onAlumnoRegistered={() => setIsRegisterAlumnoModalOpen(false)}
      />

      <RegisterPagoModal
        isOpen={isRegisterPagoModalOpen}
        onClose={() => setIsRegisterPagoModalOpen(false)}
        theme={darkMode}
        onPagoRegistered={() => setIsRegisterPagoModalOpen(false)}
        alumnoData={selectedAlumno}
      />

      {/* FAB */}
      <Fab onClick={() => setIsRegisterAlumnoModalOpen(true)} />
    </div>
  );
};
