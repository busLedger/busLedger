/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import "./ingresos.css";
import { useResponsivePagination } from "../../Hooks/useResponsivePagination.js";
import { useOutletContext } from "react-router-dom";
import {
  getIngresosByUser,
  deleteIngreso,
  getMesesYAniosConRegistros,
  getResumenFinancieroPorMes,
} from "../../api/ingresos.service";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/CardUsers";
import { message } from "antd";
import { Load } from "../../components/ui/Load.jsx";
import { Fab } from "../../components/ui/Fab/Fab.jsx";
import { Pagination } from "../../components/ui/Pagination/Pagination.jsx";
import imgIngresos from "../../assets/pagos.png";
import RegisterIngresoModal from "@/components/ui/Modales/RegisterIngresoModal.jsx";
import Input from "@/components/ui/Input.jsx";
import FilterTabs from "@/components/ui/FilterTabs.jsx";
import Button from "@/components/ui/Button.jsx";
import SelectList from "@/components/ui/SelectList";
import { Search, TrendingUp, TrendingDown, Wallet } from "lucide-react";

export const Ingresos = () => {
  const { darkMode, userData } = useOutletContext();
  const { pageSize, currentPage, setCurrentPage, isPaginated } =
    useResponsivePagination(3);

  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anioSeleccionado, setAnioSeleccionado] = useState(
    new Date().getFullYear(),
  );
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [mesesYAnios, setMesesYAnios] = useState([]);
  const [resumenFinanciero, setResumenFinanciero] = useState(null);
  const [isRegisterIngresoModalOpen, setIsRegisterIngresoModalOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRuta, setSelectedRuta] = useState("Todos");
  const [rutasDisponibles, setRutasDisponibles] = useState([]);

  useEffect(() => {
    obtenerDatosIniciales();
  }, []);

  useEffect(() => {
    if (mesSeleccionado && anioSeleccionado) {
      obtenerIngresos();
      obtenerResumenFinanciero();
    }
  }, [anioSeleccionado, mesSeleccionado]);

  /** Obtener meses y años con registros */
  const obtenerDatosIniciales = async () => {
    setLoading(true);
    try {
      const data = await getMesesYAniosConRegistros(userData.uid);
      setMesesYAnios(data);
      setDefaultMesSeleccionado(data);
    } catch (error) {
      message.error("Error al cargar los datos: " + error.message);
    }
  };

  /** Establecer mes por defecto */
  const setDefaultMesSeleccionado = async (data) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date()
      .toLocaleString("es-ES", { month: "long" })
      .toLowerCase();
    const currentYearData = data.find((item) => item.anio === currentYear);

    if (currentYearData && !currentYearData.meses.includes(currentMonth)) {
      currentYearData.meses.push(currentMonth);
    }

    setAnioSeleccionado(currentYear);
    setMesSeleccionado(currentMonth);
  };

  /** Obtener resumen financiero del mes */
  const obtenerResumenFinanciero = async () => {
    try {
      const resumen = await getResumenFinancieroPorMes(
        userData.uid,
        anioSeleccionado,
        mesSeleccionado,
      );
      setResumenFinanciero(resumen);
    } catch (error) {
      message.error("Error al obtener el resumen financiero: " + error.message);
    }
  };

  /** Obtener los ingresos del mes seleccionado */
  const obtenerIngresos = async () => {
    setLoading(true);
    try {
      const ingresosData = await getIngresosByUser(userData.uid);

      // Mapeo de meses
      const mesesMap = {
        enero: "01",
        febrero: "02",
        marzo: "03",
        abril: "04",
        mayo: "05",
        junio: "06",
        julio: "07",
        agosto: "08",
        septiembre: "09",
        octubre: "10",
        noviembre: "11",
        diciembre: "12",
      };

      const mesFormateado = mesesMap[mesSeleccionado.toLowerCase()];
      const mesFiltro = `${anioSeleccionado}-${mesFormateado}`;

      // Filtrar ingresos por mes y año
      const ingresosFiltrados = ingresosData.map((bus) => ({
        ...bus,
        ingresos: bus.ingresos
          .filter((ingreso) => ingreso.fecha.startsWith(mesFiltro))
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
      }));

      setIngresos(ingresosFiltrados);
      generarRutasDisponibles(ingresosFiltrados);
    } catch (error) {
      message.error("Error al obtener los ingresos: " + error.message);
    }
    setLoading(false);
  };

  /** Generar rutas disponibles */
  const generarRutasDisponibles = (ingresosData) => {
    const rutasSet = new Set();

    ingresosData.forEach((bus) => {
      if (bus.nombre_ruta && bus.ingresos.length > 0) {
        rutasSet.add(bus.nombre_ruta);
      }
    });

    const rutasOrdenadas = ["Todos", ...rutasSet];
    setRutasDisponibles(rutasOrdenadas);
  };

  /** Manejar cambio de año */
  const handleAnioChange = (e) => {
    const nuevoAnio = Number(e.target.value);
    setAnioSeleccionado(nuevoAnio);

    // Encontrar el primer mes disponible del año seleccionado
    const yearData = mesesYAnios.find((item) => item.anio === nuevoAnio);
    if (yearData && yearData.meses.length > 0) {
      setMesSeleccionado(yearData.meses[0]);
    }
  };

  /** Manejar cambio de mes */
  const handleMesChange = (e) => {
    setMesSeleccionado(e.target.value);
  };

  /** Filtrar los ingresos */
  const ingresosFiltrados = ingresos
    .filter((bus) =>
      bus.ingresos.some((ingreso) =>
        ingreso.descripcion_ingreso
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      ),
    )
    .filter(
      (bus) => selectedRuta === "Todos" || bus.nombre_ruta === selectedRuta,
    );

  const paginatedIngresos = isPaginated
    ? ingresosFiltrados.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
      )
    : ingresosFiltrados;

  /** Eliminar ingreso */
  const handleDeleteIngreso = async (ingreso) => {
    try {
      await deleteIngreso(ingreso);
      message.success("Ingreso eliminado correctamente");
      obtenerIngresos();
      obtenerResumenFinanciero();
    } catch (error) {
      message.error("Error al eliminar el ingreso: " + error.message);
    }
  };

  // Opciones para los selects
  const aniosDisponibles = [...new Set(mesesYAnios.map((item) => item.anio))];
  const mesesDisponibles =
    mesesYAnios.find((item) => item.anio === anioSeleccionado)?.meses || [];

  const aniosOptions = aniosDisponibles.map((anio) => ({
    value: anio,
    label: anio.toString(),
  }));

  const mesesOptions = mesesDisponibles.map((mes) => ({
    value: mes.toLowerCase(),
    label: mes.charAt(0).toUpperCase() + mes.slice(1),
  }));

  return (
    <div className="min-h-screen w-full bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Header */}
        <div className="space-y-3">
          <div>
            <h2 className="text-3xl md:text-2xl font-bold tracking-tight text-foreground">
              Gestión de Ingresos
            </h2>
            <p className="text-sm text-muted-foreground">
              Control financiero de {mesSeleccionado} {anioSeleccionado}
            </p>
          </div>

          {/* Filtros */}
          <div className="flex flex-col gap-3">
            {/* Búsqueda */}
            <div className="relative w-full">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <Input
                className="pl-10 w-full"
                theme={darkMode}
                placeholder="Buscar por descripción del ingreso"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Selects de año y mes - 2 columnas en móvil */}
            <div className="grid grid-cols-2 gap-2 lg:flex lg:gap-3">
              <SelectList
                options={aniosOptions}
                value={anioSeleccionado}
                onChange={handleAnioChange}
                placeholder="Seleccionar Año"
                className="w-full lg:w-[160px]"
              />

              <SelectList
                options={mesesOptions}
                value={mesSeleccionado}
                onChange={handleMesChange}
                placeholder="Seleccionar Mes"
                className="w-full lg:w-[160px]"
              />
            </div>

            {/* Tabs de rutas */}
            <FilterTabs
              options={rutasDisponibles}
              onSelect={setSelectedRuta}
              theme={darkMode}
            />
          </div>
          {/* Resumen Financiero */}
          {resumenFinanciero && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {/* Total Ingresos */}
              <Card theme={darkMode} className="min-w-0">
                <CardHeader className="p-2 sm:p-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div
                      className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${darkMode ? "bg-green-900/30" : "bg-green-100"}`}
                    >
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[15px] sm:text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Ingresos
                      </p>
                      <p className="text-sm sm:text-base md:text-lg font-bold text-green-600 dark:text-green-500 truncate">
                        L.{" "}
                        {resumenFinanciero.totalIngresos.toLocaleString(
                          "es-HN",
                          {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Total Gastos */}
              <Card theme={darkMode} className="min-w-0">
                <CardHeader className="p-2 sm:p-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div
                      className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${darkMode ? "bg-red-900/30" : "bg-red-100"}`}
                    >
                      <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[15px] sm:text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Gastos
                      </p>
                      <p className="text-sm sm:text-base md:text-lg font-bold text-red-600 dark:text-red-500 truncate">
                       L.{" "}
                        {resumenFinanciero.totalGastos.toLocaleString("es-HN", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Disponible Acumulado */}
              <Card
                theme={darkMode}
                className="min-w-0 col-span-2 sm:col-span-1"
              >
                <CardHeader className="p-2 sm:p-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div
                      className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                        resumenFinanciero.disponibleAcumulado >= 0
                          ? darkMode
                            ? "bg-indigo-900/30"
                            : "bg-indigo-100"
                          : darkMode
                            ? "bg-orange-900/30"
                            : "bg-orange-100"
                      }`}
                    >
                      <Wallet
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${
                          resumenFinanciero.disponibleAcumulado >= 0
                            ? "text-indigo-600 dark:text-indigo-500"
                            : "text-orange-600 dark:text-orange-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[15px] sm:text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Disponible
                      </p>
                      <p
                        className={`text-sm sm:text-base md:text-lg font-bold truncate ${
                          resumenFinanciero.disponibleAcumulado >= 0
                            ? "text-indigo-600 dark:text-indigo-500"
                            : "text-orange-600 dark:text-orange-500"
                        }`}
                      >
                        L.{" "}
                        {resumenFinanciero.disponibleAcumulado.toLocaleString(
                          "es-HN",
                          {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          )}
        </div>

        {/* Contenido - Cards en 2 columnas en móvil */}
        <div className="pt-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Load />
            </div>
          ) : paginatedIngresos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
              {paginatedIngresos.map((bus) =>
                bus.ingresos.map((ingreso) => (
                  <Card key={ingreso.id} theme={darkMode}>
                    <CardHeader>
                      <div className="flex gap-2 md:gap-3 items-center">
                        <div className="flex-shrink-0">
                          <img
                            src={imgIngresos}
                            alt="Ingreso"
                            className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-green-600"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="truncate text-sm md:text-base">
                            {bus.nombre_ruta}
                          </CardTitle>
                          <p
                            className={`text-xs md:text-sm truncate mt-0.5 md:mt-1 ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {ingreso.descripcion_ingreso}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent
                      items={[
                        `Monto: ${ingreso.total_ingreso.toLocaleString(
                          "es-HN",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )} L`,
                        `Fecha: ${ingreso.fecha}`,
                      ]}
                      theme={darkMode}
                    />
                    <div className="w-full flex justify-end px-3 md:px-4 pb-2 md:pb-3">
                      <Button
                        text="Eliminar"
                        onClick={handleDeleteIngreso.bind(this, ingreso)}
                        confirm={true}
                        confirmTitle="¿Eliminar este ingreso?"
                        confirmDescription="Esta acción no se puede deshacer."
                        confirmOkText="Sí, eliminar"
                        confirmCancelText="No"
                        confirmPlacement="bottom"
                        className="!bg-red-600 hover:!bg-red-700 text-xs md:text-sm"
                      />
                    </div>
                  </Card>
                )),
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div
                className={`rounded-full p-6 mb-4 ${
                  darkMode ? "bg-gray-800" : "bg-gray-100"
                }`}
              >
                <img
                  src={imgIngresos}
                  alt="No hay ingresos"
                  className="w-16 h-16 opacity-50"
                />
              </div>
              <h3
                className={`text-lg font-semibold mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                No hay ingresos disponibles
              </h3>
              <p
                className={`text-sm mb-4 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {searchTerm || selectedRuta !== "Todos"
                  ? "No se encontraron resultados para tu búsqueda"
                  : `No hay ingresos registrados en ${mesSeleccionado} ${anioSeleccionado}`}
              </p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {isPaginated && paginatedIngresos.length > 0 && (
          <div className="flex justify-center pt-4">
            <Pagination
              totalItems={ingresosFiltrados.reduce(
                (acc, bus) => acc + bus.ingresos.length,
                0,
              )}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Modal y FAB */}
      <RegisterIngresoModal
        isOpen={isRegisterIngresoModalOpen}
        onClose={() => setIsRegisterIngresoModalOpen(false)}
        onIngresoRegistered={() => {
          setIsRegisterIngresoModalOpen(false);
          obtenerIngresos();
          obtenerResumenFinanciero();
        }}
        theme={darkMode}
        currentUser={userData}
      />

      <Fab onClick={() => setIsRegisterIngresoModalOpen(true)} />
    </div>
  );
};
