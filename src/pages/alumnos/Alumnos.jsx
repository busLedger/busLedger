/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useContainerHeight } from "../../Hooks/useContainerHeight.js";
import { useResponsivePagination } from "../../Hooks/useResponsivePagination.js";
import { useOutletContext } from "react-router-dom";
import { getAllAlumnosByUser } from "../../api/alumnos.service.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/CardUsers";
import { message, ConfigProvider } from "antd";
import { Load } from "../../components/ui/Load.jsx";
import { Fab } from "../../components/ui/Fab/Fab.jsx";
import Button from "../../components/ui/Button.jsx";
import { Pagination } from "../../components/ui/Pagination/Pagination.jsx";
import FilterTabs from "../../components/ui/FilterTabs.jsx";
import Input from "../../components/ui/Input.jsx";
import imgAlumno from "../../assets/school.png";

export const Alumnos = () => {
  const containerRef = useContainerHeight();
  const { darkMode, userData } = useOutletContext();
  const { pageSize, currentPage, setCurrentPage, isPaginated } = useResponsivePagination(3);

  const [alumnos, setAlumnos] = useState([]);
  const [filteredAlumnos, setFilteredAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBus, setSelectedBus] = useState("Todos");
  const [optionsTab, setOptionTabs] = useState([]);
  const [isRegisterAlumnoModalOpen, setIsRegisterAlumnoModalOpen] = useState(false);

  useEffect(() => {
    obtenerAlumnos();
  }, []);

  useEffect(() => {
    filterAlumnos();
  }, [alumnos, searchTerm, selectedBus]);

  /** 🔹 OBTENER LOS ALUMNOS DEL USUARIO */
  const obtenerAlumnos = async () => {
    setLoading(true);
    try {
      const busesData = await getAllAlumnosByUser(userData.uid);
      const allAlumnos = busesData.flatMap(bus => bus.alumnos.map(alumno => ({ ...alumno, bus: bus.nombre_ruta })));
      setAlumnos(allAlumnos);
      setFilteredAlumnos(allAlumnos);

      // Extraer nombres de las rutas y establecer en optionsTab
      const busOptions = ["Todos", ...new Set(busesData.map(bus => bus.nombre_ruta))];
      setOptionTabs(busOptions);
    } catch (error) {
      message.error("Error al obtener los alumnos: " + error.message);
    }
    setLoading(false);
  };

  /** 🔹 FILTRAR ALUMNOS */
  const filterAlumnos = () => {
    let filtered = alumnos;

    if (selectedBus !== "Todos") {
      filtered = filtered.filter(alumno => alumno.bus === selectedBus);
    }

    if (searchTerm) {
      filtered = filtered.filter(alumno =>
        alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAlumnos(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (value) => {
    setSelectedBus(value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const paginatedAlumnos = isPaginated
    ? filteredAlumnos.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredAlumnos; // En móviles, mostrar todos sin paginar

  const customTheme = {
    token: {
      colorPrimary: darkMode ? "#1890ff" : "#ff4d4f",
      colorText: darkMode ? "#ffffff" : "#000000",
      colorBgContainer: darkMode ? "#141414" : "#ffffff",
    },
  };

  return (
    <ConfigProvider theme={customTheme}>
      <div className="p-4 bg-dark-purple w-full">
        <section ref={containerRef} className="container-movil container w-full mx-auto p-2">
          <p className="title-pages">Gestión de Alumnos</p>

          <div className="pages-option-container">
            <div className="w-full sm:w-1/2 lg:w-1/2">
              <FilterTabs
                options={optionsTab}
                onSelect={handleFilterChange}
                theme={darkMode}
              />
            </div>
            <div className="center-item">
              <Input
                className="w-full md:w-3/4 md:mt-1"
                theme={darkMode}
                type="text"
                name="nombre"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar alumnos"
              />
            </div>
          </div>

          <Fab onClick={() => setIsRegisterAlumnoModalOpen(true)} />
        </section>

        {/* 🔹 MOSTRAR ALUMNOS O MENSAJE DE "NO HAY DATOS" */}
        <div className="pt-4 md:pt-0 data-div">
          {loading ? (
            <Load />
          ) : filteredAlumnos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedAlumnos.map((alumno) => (
                <Card key={alumno.id} theme={darkMode}>
                  <CardHeader>
                    <div className="flex gap-2 items-center justify-center">
                      <img
                        src={imgAlumno}
                        alt="Alumno"
                        className="w-16 h-16 rounded-full"
                      />
                      <div>
                        <CardTitle>{alumno.nombre}</CardTitle>
                        <CardTitle>{alumno.apellido}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent
                    items={[
                      `Encargado: ${alumno.encargado}`,
                      `No. Encargado: ${alumno.no_encargado}`,
                      `Dirección: ${alumno.direccion}`,
                      `Ubicación: ${alumno.ubicacion}`,
                      `Costo Transporte: ${alumno.pago_mensual}`,
                    ]}
                    theme={darkMode}
                  />
                  <div className="col-span-2 flex justify-center gap-4">
                    <Button text={"Registrar Pago"} />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 mt-4">
              No hay datos disponibles
            </p>
          )}
        </div>

        {/* 🔹 PAGINACIÓN */}
        {isPaginated && (
          <Pagination
            totalItems={filteredAlumnos.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
    </ConfigProvider>
  );
};
