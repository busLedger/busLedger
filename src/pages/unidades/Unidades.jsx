/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getBusesWithFinancials, getAllBusesWithFinancials } from "../../api/buses.service";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/CardUsers";
import { message, ConfigProvider, Select } from "antd";
import { Load } from "../../components/ui/Load.jsx";
import { Fab } from "../../components/ui/Fab/Fab.jsx";
import { Pagination } from "../../components/ui/Pagination/Pagination.jsx";
import imgUnidades from "../../assets/bus.png";
import RegisterBusModal from "../../components/ui/Modales/RegisterBusModal.jsx";

const { Option } = Select;

export const Unidades = () => {
  const { darkMode, userData } = useOutletContext(); 
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [mesSeleccionado, setMesSeleccionado] = useState(""); // Mes seleccionado
  const [mesesDisponibles, setMesesDisponibles] = useState([]); // Lista de meses con datos
  const [isRegisterBusModalOpen, setIsRegisterBusModalOpen] = useState(false); // Estado para controlar la visibilidad del modal

  useEffect(() => {
    generarMesesDisponibles();
  }, []);

  useEffect(() => {
    if (mesSeleccionado) {
      obtenerBuses(mesSeleccionado);
    }
  }, [mesSeleccionado]);

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

  /** 🔹 GENERAR LOS MESES DISPONIBLES (hasta el mes actual del año en curso) */
  const generarMesesDisponibles = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // Obtener el mes actual (0-11, por eso sumamos 1)
    const meses = [];

    for (let i = 1; i <= currentMonth; i++) {
      const mes = `${currentYear}-${i.toString().padStart(2, '0')}`; // Formato "YYYY-MM"
      meses.push(mes);
    }

    setMesesDisponibles(meses.reverse()); // Ordenar de más reciente a más antiguo
    setMesSeleccionado(meses[0]); // Seleccionar el mes más reciente
  };

  /** 🔹 OBTENER LOS BUSES DEL MES SELECCIONADO */
  const obtenerBuses = async (mes) => {
    console.log("Estoy en la funcion obtenerBuses")
    setLoading(true);
    try {
      console.log(userData.roles.includes("Admin"))
      if (userData.roles.includes("Admin")) {
        console.log("Estaa funcion se va a ejecutar")// Verifica si el usuario es Admin
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
    console.log("Termino la funcion" );
  };

  const paginatedBuses = buses.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
        <div className="pt-4 md:pt-0">
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
                    <CardTitle>{bus.modelo}</CardTitle>
                    <CardTitle>{bus.placa}</CardTitle>
                    </div>
                    </div>
                  </CardHeader>
                  <CardContent
                    items={[
                      `Dueño: ${bus.dueño}`,
                      `Conductor: ${bus.conductor}`,
                      `Alumnos: ${bus.totalAlumnos}`,
                      `Salario Conductor: $${bus.salario.toFixed(2)}`,
                      `Ingresos mes: $${bus.totalIngresos.toFixed(2)}`,
                      `Gastos: $${bus.totalGastos.toFixed(2)}`,
                      `Balance: $${bus.balance.toFixed(2)}`,
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

        {/* 🔹 PAGINACIÓN */}
        <Pagination
          totalItems={buses.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
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
      </div>
    </ConfigProvider>
  );
};