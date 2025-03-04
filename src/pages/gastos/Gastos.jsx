/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useContainerHeight } from "../../Hooks/useContainerHeight.js";
import { useResponsivePagination } from "../../Hooks/useResponsivePagination.js";
import { useOutletContext } from "react-router-dom";
import { getGastosByUser, deleteGasto } from "../../api/gastos.service";
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
import FilterTabs from "../../components/ui/FilterTabs.jsx";
import Button from "../../components/ui/Button.jsx";

export const Gastos = () => {
  const containerRef = useContainerHeight();
  const { darkMode, userData } = useOutletContext();
  const { pageSize, currentPage, setCurrentPage, isPaginated } =
    useResponsivePagination(3);

  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [mesesDisponibles, setMesesDisponibles] = useState([]);
  const [isRegisterGastoModalOpen, setIsRegisterGastoModalOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda
  const [selectedRuta, setSelectedRuta] = useState("Todos"); // Estado para la ruta seleccionada
  const [rutasDisponibles, setRutasDisponibles] = useState([]); // Estado para las rutas disponibles

  useEffect(() => {
    obtenerGastos();
  }, []);

  /** 🔹 OBTENER LOS GASTOS Y GENERAR LOS MESES Y RUTAS DISPONIBLES */
  const obtenerGastos = async () => {
    setLoading(true);
    try {
      const gastosData = await getGastosByUser(userData.uid);
      console.log("los gastos del usuario:", gastosData);
      setGastos(gastosData);
      generarMesesDisponibles(gastosData);
      generarRutasDisponibles(gastosData);
    } catch (error) {
      message.error("Error al obtener los gastos: " + error.message);
    }
    setLoading(false);
  };

  /** 🔹 GENERAR MESES CON GASTOS */
  const generarMesesDisponibles = (gastosData) => {
    const mesesSet = new Set();

    gastosData.forEach((bus) => {
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

  /** 🔹 GENERAR RUTAS DISPONIBLES */
  const generarRutasDisponibles = (gastosData) => {
    const rutasSet = new Set();

    gastosData.forEach((bus) => {
      if (bus.nombre_ruta) {
        rutasSet.add(bus.nombre_ruta);
      }
    });

    // Convertir a array y agregar la opción "Todos"
    const rutasOrdenadas = ["Todos", ...rutasSet];

    setRutasDisponibles(rutasOrdenadas);
  };

  /** 🔹 FILTRAR LOS GASTOS SEGÚN EL MES SELECCIONADO, EL TÉRMINO DE BÚSQUEDA Y LA RUTA SELECCIONADA */
  const gastosFiltrados = gastos
    .filter((bus) =>
      bus.gastos.some((gasto) =>
        gasto.descripcion_gasto.toLowerCase().includes(searchTerm.toLowerCase())
      )
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
    })
    .filter(
      (bus) => selectedRuta === "Todos" || bus.nombre_ruta === selectedRuta
    );

  const paginatedGastos = isPaginated
    ? gastosFiltrados.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      )
    : gastosFiltrados;

  /** 🔹 ELIMINAR GASTO */
  const handleDeleteGasto = async (gastoId) => {
    try {
      await deleteGasto(gastoId);
      message.success("Gasto eliminado correctamente");
      obtenerGastos();
    } catch (error) {
      message.error("Error al eliminar el gasto: " + error.message);
    }
  };

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

          {/* 🔹 FILTRO DE MESES, BÚSQUEDA POR DESCRIPCIÓN DEL GASTO Y FILTRO DE RUTAS */}
          <div className="w-full flex justify-center gap-4 mb-4">
            <Input
              className={`w-3/6 mr-2`}
              theme={darkMode}
              placeholder={`Buscar por descripción del gasto`}
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
          <div className="w-full flex justify-center">
            <FilterTabs
              options={rutasDisponibles}
              onSelect={setSelectedRuta}
              theme={darkMode}
            />
          </div>
          <Fab onClick={() => setIsRegisterGastoModalOpen(true)} />
        </section>

        {/* 🔹 MOSTRAR GASTOS O MENSAJE DE "NO HAY DATOS" */}
        <div className="pt-4 md:pt-0 data-div">
          {loading ? (
            <Load />
          ) : paginatedGastos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedGastos.map((bus) =>
                bus.gastos.map((gasto) => (
                  <Card key={gasto.id} theme={darkMode}>
                    <CardHeader>
                      <div className="flex gap-2 items-center justify-center">
                        <img
                          src={imgGastos}
                          alt="Gasto"
                          className="w-16 h-16 rounded-full"
                        />
                        <div>
                          <CardTitle>{bus.nombre_ruta}</CardTitle>
                          <CardTitle>{gasto.descripcion_gasto}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent
                      items={[
                        `Monto: L.${gasto.monto.toFixed(2)}`,
                        `Fecha: ${gasto.fecha_gasto}`,
                      ]}
                      theme={darkMode}
                    />
                    <div className="w-full flex justify-end">
                      <Button
                        text="Eliminar"
                        onClick={handleDeleteGasto.bind(this, gasto.id)}
                        confirm={true}
                        confirmTitle="¿Eliminar este elemento?"
                        confirmDescription="Esta acción no se puede deshacer."
                        confirmOkText="Sí, eliminar"
                        confirmCancelText="No"
                        confirmPlacement="bottom"
                      />
                    </div>
                  </Card>
                ))
              )}
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
            obtenerGastos(mesSeleccionado);
          }}
          theme={darkMode}
          currentUser={userData}
        />
        {isPaginated && (
          <Pagination
            totalItems={gastosFiltrados.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </ConfigProvider>
  );
};
