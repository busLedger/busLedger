/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import "./gastos.css";
import { useResponsivePagination } from "../../Hooks/useResponsivePagination.js";
import { useOutletContext } from "react-router-dom";
import {
  getGastosByUser,
  deleteGasto,
  getMesesYAniosConRegistros,
} from "../../api/gastos.service";
import { getResumenFinancieroPorMes } from "../../api/ingresos.service";
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
import imgGastos from "../../assets/gastos.png";
import RegisterGastoModal from "../../components/ui/Modales/RegisterGastoModal.jsx";
import Input from "../../components/ui/Input.jsx";
import FilterTabs from "../../components/ui/FilterTabs.jsx";
import Button from "../../components/ui/Button.jsx";
import SelectList from "@/components/ui/SelectList";
import { Search, TrendingUp, TrendingDown, Wallet } from "lucide-react";

export const Gastos = () => {
  const { darkMode, userData } = useOutletContext();
  const { pageSize, currentPage, setCurrentPage, isPaginated } =
    useResponsivePagination(3);

  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anioSeleccionado, setAnioSeleccionado] = useState(
    new Date().getFullYear()
  );
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [mesesYAnios, setMesesYAnios] = useState([]);
  const [resumenFinanciero, setResumenFinanciero] = useState(null);
  const [isRegisterGastoModalOpen, setIsRegisterGastoModalOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRuta, setSelectedRuta] = useState("Todos");
  const [rutasDisponibles, setRutasDisponibles] = useState([]);

  useEffect(() => {
    obtenerDatosIniciales();
  }, []);

  useEffect(() => {
    if (mesSeleccionado && anioSeleccionado) {
      obtenerGastos();
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

  /** Obtener resumen financiero del mes - Reutilizando del servicio de ingresos */
  const obtenerResumenFinanciero = async () => {
    try {
      const resumen = await getResumenFinancieroPorMes(
        userData.uid,
        anioSeleccionado,
        mesSeleccionado
      );
      setResumenFinanciero(resumen);
    } catch (error) {
      message.error("Error al obtener el resumen financiero: " + error.message);
    }
  };

  /** Obtener los gastos del mes seleccionado */
  const obtenerGastos = async () => {
    setLoading(true);
    try {
      const gastosData = await getGastosByUser(userData.uid);

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

      const gastosFiltrados = gastosData.map((bus) => ({
        ...bus,
        gastos: bus.gastos
          .filter((gasto) => gasto.fecha_gasto.startsWith(mesFiltro))
          .sort((a, b) => new Date(b.fecha_gasto) - new Date(a.fecha_gasto)),
      }));

      setGastos(gastosFiltrados);
      generarRutasDisponibles(gastosFiltrados);
    } catch (error) {
      message.error("Error al obtener los gastos: " + error.message);
    }
    setLoading(false);
  };

  /** Generar rutas disponibles */
  const generarRutasDisponibles = (gastosData) => {
    const rutasSet = new Set();

    gastosData.forEach((bus) => {
      if (bus.nombre_ruta && bus.gastos.length > 0) {
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

    const yearData = mesesYAnios.find((item) => item.anio === nuevoAnio);
    if (yearData && yearData.meses.length > 0) {
      setMesSeleccionado(yearData.meses[0]);
    }
  };

  /** Manejar cambio de mes */
  const handleMesChange = (e) => {
    setMesSeleccionado(e.target.value);
  };

  /** Filtrar los gastos */
  const gastosFiltrados = gastos
    .filter((bus) =>
      bus.gastos.some((gasto) =>
        gasto.descripcion_gasto
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    )
    .filter(
      (bus) => selectedRuta === "Todos" || bus.nombre_ruta === selectedRuta
    );

  const paginatedGastos = isPaginated
    ? gastosFiltrados.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      )
    : gastosFiltrados;

  /** Eliminar gasto */
  const handleDeleteGasto = async (gastoId) => {
    try {
      await deleteGasto(gastoId);
      message.success("Gasto eliminado correctamente");
      obtenerGastos();
      obtenerResumenFinanciero();
    } catch (error) {
      message.error("Error al eliminar el gasto: " + error.message);
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
              Gestión de Gastos
            </h2>
            <p className="text-sm text-muted-foreground">
              Control de gastos de {mesSeleccionado} {anioSeleccionado}
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
                placeholder="Buscar por descripción del gasto"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Selects de año y mes */}
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
                      className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                        darkMode ? "bg-green-900/30" : "bg-green-100"
                      }`}
                    >
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[15px] sm:text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
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
                          }
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
                      className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                        darkMode ? "bg-red-900/30" : "bg-red-100"
                      }`}
                    >
                      <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[15px] sm:text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
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

              {/* Disponible */}
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
                        className={`text-[15px] sm:text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
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
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="pt-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Load />
            </div>
          ) : paginatedGastos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
              {paginatedGastos.map((bus) =>
                bus.gastos.map((gasto) => (
                  <Card key={gasto.id} theme={darkMode}>
                    <CardHeader>
                      <div className="flex gap-2 md:gap-3 items-center">
                        <div className="flex-shrink-0">
                          <img
                            src={imgGastos}
                            alt="Gasto"
                            className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-red-600"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="truncate text-sm md:text-base">
                            {gasto.descripcion_gasto}
                          </CardTitle>
                          <p
                            className={`text-xs md:text-sm truncate mt-0.5 md:mt-1 ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                             {bus.nombre_ruta}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent
                      items={[
                        `Monto: L.${gasto.monto.toLocaleString("es-HN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} `,
                        `Fecha: ${gasto.fecha_gasto}`,
                      ]}
                      theme={darkMode}
                    />
                    <div className="w-full flex justify-end px-3 md:px-4 pb-2 md:pb-3">
                      <Button
                        text="Eliminar"
                        onClick={handleDeleteGasto.bind(this, gasto.id)}
                        confirm={true}
                        confirmTitle="¿Eliminar este gasto?"
                        confirmDescription="Esta acción no se puede deshacer."
                        confirmOkText="Sí, eliminar"
                        confirmCancelText="No"
                        confirmPlacement="bottom"
                        className="!bg-red-600 hover:!bg-red-700 text-xs md:text-sm"
                      />
                    </div>
                  </Card>
                ))
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
                  src={imgGastos}
                  alt="No hay gastos"
                  className="w-16 h-16 opacity-50"
                />
              </div>
              <h3
                className={`text-lg font-semibold mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                No hay gastos disponibles
              </h3>
              <p
                className={`text-sm mb-4 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {searchTerm || selectedRuta !== "Todos"
                  ? "No se encontraron resultados para tu búsqueda"
                  : `No hay gastos registrados en ${mesSeleccionado} ${anioSeleccionado}`}
              </p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {isPaginated && paginatedGastos.length > 0 && (
          <div className="flex justify-center pt-4">
            <Pagination
              totalItems={gastosFiltrados.reduce(
                (acc, bus) => acc + bus.gastos.length,
                0
              )}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Modal y FAB */}
      <RegisterGastoModal
        isOpen={isRegisterGastoModalOpen}
        onClose={() => setIsRegisterGastoModalOpen(false)}
        onGastoRegistered={() => {
          setIsRegisterGastoModalOpen(false);
          obtenerGastos();
          obtenerResumenFinanciero();
        }}
        theme={darkMode}
        currentUser={userData}
      />

      <Fab onClick={() => setIsRegisterGastoModalOpen(true)} />
    </div>
  );
};