/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useContainerHeight } from "../../Hooks/useContainerHeight.js";
import { useResponsivePagination } from "../../Hooks/useResponsivePagination.js";
import { useOutletContext } from "react-router-dom";
import {
  getBusesWithFinancials,
  getAllBusesWithFinancials,
} from "../../api/buses.service";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/CardUsers";
import { message, ConfigProvider, Select } from "antd";
import { Load } from "../../components/ui/Load.jsx";
import { Fab } from "../../components/ui/Fab/Fab.jsx";
import { Pagination } from "../../components/ui/Pagination/Pagination.jsx";
import imgGastos from "../../assets/gastos.png";
import RegisterGastoModal from "../../components/ui/Modales/RegisterGastoModal.jsx";
import Input from "../../components/ui/Input.jsx";

const { Option } = Select;

export const Gastos = () => {
  const containerRef = useContainerHeight();
  const { darkMode, userData } = useOutletContext();
  const { pageSize, currentPage, setCurrentPage, isPaginated } =
    useResponsivePagination(3);

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [mesesDisponibles, setMesesDisponibles] = useState([]);
  const [isRegisterGastoModalOpen, setIsRegisterGastoModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda

  useEffect(() => {
    obtenerBuses();
  }, []);

  /** 🔹 OBTENER LOS BUSES Y GENERAR LOS MESES DISPONIBLES */
  const obtenerBuses = async () => {
    setLoading(true);
    try {
      let busesData = [];
      if (userData.roles.includes("Admin")) {
        busesData = await getAllBusesWithFinancials();
      } else {
        busesData = await getBusesWithFinancials(userData.uid);
      }
      setBuses(busesData);
      generarMesesDisponibles(busesData);
    } catch (error) {
      message.error("Error al obtener los buses:" + error.message);
    }
    setLoading(false);
  };

  /** 🔹 GENERAR MESES CON INGRESOS O GASTOS */
  const generarMesesDisponibles = (busesData) => {
    const mesesSet = new Set();

    busesData.forEach((bus) => {
      bus.ingresos.forEach((ingreso) => {
        if (ingreso.fecha) {
          const mes = ingreso.fecha.substring(0, 7);
          mesesSet.add(mes);
        }
      });

      bus.gastos.forEach((gasto) => {
        if (gasto.fecha_gasto) {
          const mes = gasto.fecha_gasto.substring(0, 7);
          mesesSet.add(mes);
        }
      });
    });

    // Agregar el mes actual si no está en los datos
    const currentYear = new Date().getFullYear();
    const currentMonth = (new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0");
    const mesActual = `${currentYear}-${currentMonth}`;
    mesesSet.add(mesActual);

    // Convertir a array y ordenar por fecha en orden descendente
    const mesesOrdenados = [...mesesSet].sort(
      (a, b) => new Date(b + "-01") - new Date(a + "-01")
    );

    setMesesDisponibles(mesesOrdenados);
    setMesSeleccionado(mesActual);
  };

  /** 🔹 FILTRAR LOS BUSES SEGÚN EL MES SELECCIONADO Y EL TÉRMINO DE BÚSQUEDA */
  const busesFiltrados = buses
    .filter((bus) =>
      bus.nombre_ruta.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((bus) => {
      const gastosFiltrados = bus.gastos.filter((gasto) =>
        gasto.fecha_gasto.startsWith(mesSeleccionado)
      );

      return {
        ...bus,
        gastos: gastosFiltrados,
        totalGastos: gastosFiltrados.reduce(
          (acc, gasto) => acc + gasto.monto,
          0
        ),
      };
    });

  const paginatedBuses = isPaginated
    ? busesFiltrados.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : busesFiltrados;

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
        <section
          ref={containerRef}
          className="container-movil container w-full mx-auto p-2"
        >
          <p className="title-pages">Gestión de Gastos</p>

          {/* 🔹 FILTRO DE MESES Y BÚSQUEDA POR NOMBRE DE RUTA */}
          <div className="w-full flex justify-center gap-4 mb-4">
            <Input
              className={`w-3/6 mr-2`}
              theme={darkMode}
              placeholder={`Buscar por nombre de ruta`}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Actualizar el término de búsqueda
            />
            <Select
              value={mesSeleccionado}
              onChange={setMesSeleccionado}
              className="w-2/6"
              placeholder="Seleccionar Mes"
            >
              {mesesDisponibles.map((mes) => {
                const [year, month] = mes.split("-"); // Extraer año y mes
                const nombreMes = new Intl.DateTimeFormat("es-ES", {
                  month: "long",
                }).format(
                  new Date(parseInt(year), parseInt(month) - 1) // Ajuste de mes en `Date`
                );

                return (
                  <Option key={mes} value={mes}>
                    {`${nombreMes} ${year}`} {/* Formato correcto */}
                  </Option>
                );
              })}
            </Select>
          </div>

          <Fab onClick={() => setIsRegisterGastoModalOpen(true)} />
        </section>

        {/* 🔹 MOSTRAR BUSES O MENSAJE DE "NO HAY DATOS" */}
        <div className="pt-4 md:pt-0 data-div">
          {loading ? (
            <Load />
          ) : paginatedBuses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedBuses.map((bus) => (
                <Card key={bus.id} theme={darkMode}>
                  <CardHeader>
                    <div className="flex gap-2 items-center justify-center">
                      <img
                        src={imgGastos}
                        alt="Bus"
                        className="w-16 h-16 rounded-full"
                      />
                      <div>
                        <CardTitle>{bus.nombre_ruta}</CardTitle>
                        <CardTitle>{bus.modelo}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent
                    items={[
                      `Dueño: ${bus.dueño}`,
                      `Conductor: ${bus.conductor}`,
                      `Total Alumnos: ${bus.totalAlumnos}`,
                      `Gastos: L.${bus.totalGastos.toFixed(2)}`,
                    ]}
                    theme={darkMode}
                  />
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 mt-4">
              No hay datos disponibles
            </p>
          )}
        </div>

        <RegisterGastoModal
          isOpen={isRegisterGastoModalOpen}
          onClose={() => setIsRegisterGastoModalOpen(false)}
          onGastoRegistered={() => {
            setIsRegisterGastoModalOpen(false);
            obtenerBuses(mesSeleccionado);
          }}
          theme={darkMode}
          currentUser={userData}
        />
        {isPaginated && (
          <Pagination
            totalItems={busesFiltrados.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </ConfigProvider>
  );
};