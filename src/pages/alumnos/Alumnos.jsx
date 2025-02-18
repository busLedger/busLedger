/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
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
import imgAlumno from "../../assets/school.png";

export const Alumnos = () => {
  const { darkMode, userData } = useOutletContext();
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [isRegisterAlumnoModalOpen, setIsRegisterAlumnoModalOpen] = useState(false); // Estado para controlar la visibilidad del modal

  useEffect(() => {
    obtenerAlumnos();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      let newPageSize = window.innerWidth < 1024 ? 2 : 3;
      if (newPageSize !== pageSize) {
        setPageSize(newPageSize);
        setCurrentPage(1);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [pageSize]);

  /** 🔹 OBTENER LOS ALUMNOS DEL USUARIO */
  const obtenerAlumnos = async () => {
    setLoading(true);
    try {
      const alumnosData = await getAllAlumnosByUser(userData.uid);
      console.log("Data en alumnos: ",alumnosData);
      setAlumnos(alumnosData);
    } catch (error) {
      message.error("Error al obtener los alumnos: " + error.message);
    }
    setLoading(false);
  };

  const paginatedAlumnos = alumnos.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
        <section className="container w-full mx-auto p-2">
          <p className="title-pages">Gestión de Alumnos</p>

          <Fab onClick={() => setIsRegisterAlumnoModalOpen(true)} />
        </section>

        {/* 🔹 MOSTRAR ALUMNOS O MENSAJE DE "NO HAY DATOS" */}
        <div className="pt-4 md:pt-0">
          {loading ? (
            <Load />
          ) : alumnos.length > 0 ? (
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
                      `Bus: ${alumno.bus.nombre_ruta}`,
                      `Edad: ${alumno.edad}`,
                      `Grado: ${alumno.grado}`,
                      `Dirección: ${alumno.direccion}`,
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
        <Pagination
          totalItems={alumnos.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
        
      </div>
    </ConfigProvider>
  );
};