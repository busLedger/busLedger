/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useContainerHeight } from "../../Hooks/useContainerHeight.js";
import { useResponsivePagination } from "../../Hooks/useResponsivePagination.js";
import { useOutletContext } from "react-router-dom";
import { getIngresosByUser, deleteIngreso } from "../../api/ingresos.service";
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
import imgIngresos from "../../assets/pagos.png";
import RegisterIngresoModal from "../../components/ui/Modales/RegisterIngresoModal.jsx";
import Input from "../../components/ui/Input.jsx";
import FilterTabs from "../../components/ui/FilterTabs.jsx";
import Button from "../../components/ui/Button.jsx";

const { Option } = Select;

export const Ingresos = () => {
  const containerRef = useContainerHeight();
  const { darkMode, userData } = useOutletContext();
  const { pageSize, currentPage, setCurrentPage, isPaginated } =
    useResponsivePagination(3);

  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [mesesDisponibles, setMesesDisponibles] = useState([]);
  const [isRegisterIngresoModalOpen, setIsRegisterIngresoModalOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda
  const [selectedRuta, setSelectedRuta] = useState("Todos"); // Estado para la ruta seleccionada
  const [rutasDisponibles, setRutasDisponibles] = useState([]); // Estado para las rutas disponibles

  useEffect(() => {
    obtenerIngresos();
  }, []);

  /** 🔹 OBTENER LOS INGRESOS Y GENERAR LOS MESES Y RUTAS DISPONIBLES */
  const obtenerIngresos = async () => {
    setLoading(true);
    try {
      const ingresosData = await getIngresosByUser(userData.uid);
      console.log("los ingresos del usuario:", ingresosData);
      setIngresos(ingresosData);
      generarMesesDisponibles(ingresosData);
      generarRutasDisponibles(ingresosData);
    } catch (error) {
      message.error("Error al obtener los ingresos: " + error.message);
    }
    setLoading(false);
  };

  /** 🔹 GENERAR MESES CON INGRESOS */
  const generarMesesDisponibles = (ingresosData) => {
    const mesesSet = new Set();

    ingresosData.forEach((bus) => {
      bus.ingresos.forEach((ingreso) => {
        if (ingreso.fecha) {
          const mes = ingreso.fecha.substring(0, 7);
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
  const generarRutasDisponibles = (ingresosData) => {
    const rutasSet = new Set();

    ingresosData.forEach((bus) => {
      if (bus.nombre_ruta) {
        rutasSet.add(bus.nombre_ruta);
      }
    });

    // Convertir a array y agregar la opción "Todos"
    const rutasOrdenadas = ["Todos", ...rutasSet];

    setRutasDisponibles(rutasOrdenadas);
  };

  /** 🔹 FILTRAR LOS INGRESOS SEGÚN EL MES SELECCIONADO, EL TÉRMINO DE BÚSQUEDA Y LA RUTA SELECCIONADA */
  const ingresosFiltrados = ingresos
    .filter((bus) =>
      bus.ingresos.some((ingreso) =>
        ingreso.descripcion_ingreso.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .map((bus) => {
      const ingresosFiltrados = bus.ingresos.filter((ingreso) =>
        ingreso.fecha.startsWith(mesSeleccionado)
      );

      return {
        ...bus,
        ingresos: ingresosFiltrados,
        totalIngresos: ingresosFiltrados.reduce(
          (acc, ingreso) => acc + ingreso.total_ingreso,
          0
        ),
      };
    })
    .filter(
      (bus) => selectedRuta === "Todos" || bus.nombre_ruta === selectedRuta
    );

  const paginatedIngresos = isPaginated
    ? ingresosFiltrados.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      )
    : ingresosFiltrados;

  /** 🔹 ELIMINAR INGRESO */
  const handleDeleteIngreso = async (ingresoId) => {
    try {
      await deleteIngreso(ingresoId);
      message.success("Ingreso eliminado correctamente");
      obtenerIngresos();
    } catch (error) {
      message.error("Error al eliminar el ingreso: " + error.message);
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
          <p className="title-pages">Gestión de Ingresos</p>

          {/* 🔹 FILTRO DE MESES, BÚSQUEDA POR DESCRIPCIÓN DEL INGRESO Y FILTRO DE RUTAS */}
          <div className="w-full flex justify-center gap-4 mb-4">
            <Input
              className={`w-3/6 mr-2`}
              theme={darkMode}
              placeholder={`Buscar por descripción del ingreso`}
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
          <div className="w-full flex justify-center">
            <FilterTabs
              options={rutasDisponibles}
              onSelect={setSelectedRuta}
              theme={darkMode}
            />
          </div>
          <Fab onClick={() => setIsRegisterIngresoModalOpen(true)} />
        </section>

        {/* 🔹 MOSTRAR INGRESOS O MENSAJE DE "NO HAY DATOS" */}
        <div className="pt-4 md:pt-0 data-div">
          {loading ? (
            <Load />
          ) : paginatedIngresos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedIngresos.map((bus) =>
                bus.ingresos.map((ingreso) => (
                  <Card key={ingreso.id} theme={darkMode}>
                    <CardHeader>
                      <div className="flex gap-2 items-center justify-center">
                        <img
                          src={imgIngresos}
                          alt="Ingreso"
                          className="w-16 h-16 rounded-full"
                        />
                        <div>
                          <CardTitle>{bus.nombre_ruta}</CardTitle>
                          <CardTitle>{ingreso.descripcion_ingreso}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent
                      items={[
                        `Monto: L.${ingreso.total_ingreso.toFixed(2)}`,
                        `Fecha: ${ingreso.fecha}`,
                      ]}
                      theme={darkMode}
                    />
                    <div className="w-full flex justify-end">
                      <Button
                        text="Eliminar"
                        onClick={handleDeleteIngreso.bind(this, ingreso.id)}
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

        <RegisterIngresoModal
          isOpen={isRegisterIngresoModalOpen}
          onClose={() => setIsRegisterIngresoModalOpen(false)}
          onIngresoRegistered={() => {
            setIsRegisterIngresoModalOpen(false);
            obtenerIngresos(mesSeleccionado);
          }}
          theme={darkMode}
          currentUser={userData}
        />
        {isPaginated && (
          <Pagination
            totalItems={ingresosFiltrados.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </ConfigProvider>
  );
};