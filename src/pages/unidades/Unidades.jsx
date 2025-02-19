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
import imgUnidades from "../../assets/bus.png";
import RegisterBusModal from "../../components/ui/Modales/RegisterBusModal.jsx";

const { Option } = Select;

export const Unidades = () => {
  const containerRef = useContainerHeight();
  const { darkMode, userData } = useOutletContext();
  const { pageSize, currentPage, setCurrentPage, isPaginated } = useResponsivePagination(3);

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesSeleccionado, setMesSeleccionado] = useState(""); // Mes seleccionado
  const [mesesDisponibles, setMesesDisponibles] = useState([]); // Lista de meses con datos
  const [isRegisterBusModalOpen, setIsRegisterBusModalOpen] = useState(false); // Estado para modal

  useEffect(() => {
    generarMesesDisponibles();
  }, []);

  useEffect(() => {
    if (mesSeleccionado) {
      obtenerBuses(mesSeleccionado);
    }
  }, [mesSeleccionado]);

  /** 🔹 GENERAR LOS MESES DISPONIBLES (hasta el mes actual del año en curso) */
  const generarMesesDisponibles = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const meses = [];

    for (let i = 1; i <= currentMonth; i++) {
      const mes = `${currentYear}-${i.toString().padStart(2, "0")}`;
      meses.push(mes);
    }

    setMesesDisponibles(meses.reverse());
    setMesSeleccionado(meses[0]);
  };

  /** 🔹 OBTENER LOS BUSES DEL MES SELECCIONADO */
  const obtenerBuses = async (mes) => {
    setLoading(true);
    try {
      if (userData.roles.includes("Admin")) {
        const busesData = await getAllBusesWithFinancials(mes);
        setBuses(busesData);
      } else {
        const busesData = await getBusesWithFinancials(userData.uid, mes);
        setBuses(busesData);
      }
    } catch (error) {
      message.error("Error al obtener los buses: " + error.message);
    }
    setLoading(false);
  };

  const paginatedBuses = isPaginated
    ? buses.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : buses; // En móviles, mostrar todos sin paginar

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
          <p className="title-pages">Gestión de Unidades</p>

          {/* 🔹 FILTRO DE MESES */}
          <div className="w-full flex justify-end mb-4">
            <Select
              value={mesSeleccionado}
              onChange={setMesSeleccionado}
              className="w-[200px]"
              placeholder="Seleccionar Mes"
            >
              {mesesDisponibles.length > 0 ? (
                mesesDisponibles.map((mes) => (
                  <Option key={mes} value={mes}>
                    {new Date(mes + "-01").toLocaleString("es-ES", {
                      month: "long",
                      year: "numeric",
                    })}
                  </Option>
                ))
              ) : (
                <Option value="">Todos</Option>
              )}
            </Select>
          </div>

          <Fab onClick={() => setIsRegisterBusModalOpen(true)} />
        </section>

        {/* 🔹 MOSTRAR BUSES O MENSAJE DE "NO HAY DATOS" */}
        <div className="pt-4 md:pt-0 data-div">
          {loading ? (
            <Load />
          ) : buses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedBuses.map((bus) => (
                <Card key={bus.id} theme={darkMode}>
                  <CardHeader>
                    <div className="flex gap-2 items-center justify-center">
                      <img src={imgUnidades} alt="Bus" className="w-16 h-16 rounded-full" />
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
                      `Alumnos: ${bus.totalAlumnos}`,
                      `Ingresos mes: L.${bus.totalIngresos.toFixed(2)}`,
                      `Gastos: L.${bus.totalGastos.toFixed(2)}`,
                      `Balance: L.${bus.balance.toFixed(2)}`,
                    ]}
                    theme={darkMode}
                  />
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 mt-4">No hay datos disponibles</p>
          )}
        </div>

        <RegisterBusModal
          isOpen={isRegisterBusModalOpen}
          onClose={() => setIsRegisterBusModalOpen(false)}
          onBusRegistered={() => {
            setIsRegisterBusModalOpen(false);
            obtenerBuses(mesSeleccionado);
          }}
          theme={darkMode}
          currentUser={userData}
        />

        {isPaginated && <Pagination totalItems={buses.length} currentPage={currentPage} pageSize={pageSize} onPageChange={setCurrentPage} />}
      </div>
    </ConfigProvider>
  );
};
