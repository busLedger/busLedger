/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import "./unidades.css"
//import { useNavigate } from "react-router-dom";
import { useResponsivePagination } from "../../Hooks/useResponsivePagination.js";
import { useOutletContext } from "react-router-dom";
import { Ingresos_Gastos } from "./Ingresos_Gastos.jsx";
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
import Input from "../../components/ui/Input.jsx";

export const Unidades = () => {
 // const navigate = useNavigate();
  const { darkMode, userData } = useOutletContext();
  const { pageSize, currentPage, setCurrentPage, isPaginated } =
    useResponsivePagination(3);

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [mesesDisponibles, setMesesDisponibles] = useState([]);
  const [isRegisterBusModalOpen, setIsRegisterBusModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const verUnidad = (id) => {
    console.log("Ver Unidad", id);
   // navigate(`${id}`);
  }

  useEffect(() => {
    obtenerBuses();
  }, []);

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

  const busesFiltrados = buses
    .filter((bus) =>
      bus.nombre_ruta.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((bus) => {
      const ingresosFiltrados = bus.ingresos.filter((ingreso) =>
        ingreso.fecha.startsWith(mesSeleccionado)
      );
      const gastosFiltrados = bus.gastos.filter((gasto) =>
        gasto.fecha_gasto.startsWith(mesSeleccionado)
      );

      return {
        ...bus,
        ingresos: ingresosFiltrados,
        gastos: gastosFiltrados,
        totalIngresos: ingresosFiltrados.reduce(
          (acc, ingreso) => acc + ingreso.total_ingreso,
          0
        ),
        totalGastos: gastosFiltrados.reduce(
          (acc, gasto) => acc + gasto.monto,
          0
        ),
        balance:
          ingresosFiltrados.reduce(
            (acc, ingreso) => acc + ingreso.total_ingreso,
            0
          ) - gastosFiltrados.reduce((acc, gasto) => acc + gasto.monto, 0),
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
      <div className="p-4 bg-dark-purple w-full h-[95vh]">
        <section className="container-movil container w-full mx-auto p-2 unidades-section-filters">
          <p className="title-pages">Gestión de Unidades</p>

          {/* FILTRO DE MESES Y BÚSQUEDA POR NOMBRE DE RUTA */}
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
              dropdownRender={(menu) => (
                <div
                  style={{
                    backgroundColor: darkMode ? "#141414" : "#fff",
                    color: darkMode ? "#fff" : "#000",
                    borderRadius: 4,
                    padding: 0,
                    border: 1,
                  }}
                >
                  {menu}
                </div>
              )}
            >
              {mesesDisponibles.map((mes) => {
                const [year, month] = mes.split("-");
                const nombreMes = new Intl.DateTimeFormat("es-ES", {
                  month: "long",
                }).format(new Date(parseInt(year), parseInt(month) - 1));

                return (
                  <Select.Option
                    key={mes}
                    value={mes}
                    style={{
                      backgroundColor: darkMode ? "#000" : "#fff",
                      color: darkMode ? "#fff" : "#000",
                    }}
                  >
                    {`${nombreMes} ${year}`}
                  </Select.Option>
                );
              })}
            </Select>
          </div>

          <Fab onClick={() => setIsRegisterBusModalOpen(true)} />
        </section>

        {/* 🔹 MOSTRAR BUSES O MENSAJE DE "NO HAY DATOS" */}
        <div className="pt-4 md:pt-0 unidades-data-div">
          {loading ? (
            <Load />
          ) : paginatedBuses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedBuses.map((bus) => (

                  <Card key={bus.id} theme={darkMode}>
                    <div onClick={() => verUnidad(bus.id)}>
                    <CardHeader>
                    <div className="flex gap-2 items-center justify-center">
                      <img
                        src={imgUnidades}
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
                      `Ingresos: ${bus.totalIngresos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LPS`,
                      `Gastos: ${bus.totalGastos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LPS`,
                      `Balance: ${bus.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LPS`,
                    ]}
                    theme={darkMode}
                  />
                    </div>
                 
                  <Ingresos_Gastos
                    busId={bus.id}
                    userId={userData.uid}
                    onRegistered={obtenerBuses}
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
