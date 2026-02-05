/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import "./unidades.css";
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
} from "@/components/ui/CardUsers";
import { message } from "antd";
import { Load } from "../../components/ui/Load.jsx";
import { Fab } from "../../components/ui/Fab/Fab.jsx";
import { Pagination } from "../../components/ui/Pagination/Pagination.jsx";
import imgUnidades from "../../assets/bus.png";
import RegisterBusModal from "../../components/ui/Modales/RegisterBusModal.jsx";
import Input from "../../components/ui/Input.jsx";
import SelectList from "@/components/ui/SelectList";
import { Search } from "lucide-react";

export const Unidades = () => {
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
  };

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

  // Formatear opciones para SelectList
  const mesesOptions = mesesDisponibles.map((mes) => {
    const [year, month] = mes.split("-");
    const nombreMes = new Intl.DateTimeFormat("es-ES", {
      month: "long",
    }).format(new Date(parseInt(year), parseInt(month) - 1));

    return {
      value: mes,
      label: `${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)} ${year}`,
    };
  });

  return (
    <div className="min-h-screen w-full bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Header */}
        <div className="space-y-3">
          <div>
            <h2 className="text-3xl md:text-3xl font-bold tracking-tight">
            Gestión de Unidades
            </h2>
          </div>

          {/* Filtros */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Input de búsqueda */}
            <div className="relative flex-1">
              <Search 
                className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`} 
              />
              <Input
                className="pl-10"
                theme={darkMode}
                placeholder="Buscar por nombre de ruta"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Select de mes */}
            <SelectList
              options={mesesOptions}
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(e.target.value)}
              placeholder="Seleccionar Mes"
              className="sm:w-[220px]"
            />
          </div>
        </div>

        {/* Contenido */}
        <div className="pt-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Load />
            </div>
          ) : paginatedBuses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedBuses.map((bus) => (
             <Card 
  key={bus.id} 
  theme={darkMode}
  className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
>
  <div onClick={() => verUnidad(bus.id)}>
    <CardHeader>
      <div className="flex gap-3 items-center">
        <div className="flex-shrink-0">
          <img
            src={imgUnidades}
            alt="Bus"
            className="w-14 h-14 rounded-full border-2 border-indigo-600"
          />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="truncate">
            {bus.nombre_ruta}
          </CardTitle>
          <p className={`text-sm truncate mt-1 ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}>
            {bus.modelo}
          </p>
        </div>
      </div>
    </CardHeader>

    <CardContent
      items={[
        `Dueño: ${bus.dueño}`,
        `Conductor: ${bus.conductor}`,
        `Total Alumnos: ${bus.totalAlumnos}`,
        `Ingresos: L.${bus.totalIngresos.toLocaleString("es-HN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        `Gastos: L.${bus.totalGastos.toLocaleString("es-HN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} `,
        `Balance: L.${bus.balance.toLocaleString("es-HN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} `,
      ]}
      theme={darkMode}
    />
  </div>

  {/* Sección de botones */}
  <div className={`border-t pt-3 ${
    darkMode ? "border-gray-700" : "border-gray-200"
  }`}>
    <Ingresos_Gastos
      busId={bus.id}
      userId={userData.uid}
      onRegistered={obtenerBuses}
    />
  </div>
</Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className={`rounded-full p-6 mb-4 ${
                darkMode ? "bg-gray-800" : "bg-gray-100"
              }`}>
                <img 
                  src={imgUnidades} 
                  alt="No hay buses" 
                  className="w-16 h-16 opacity-50" 
                />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}>
                No hay unidades disponibles
              </h3>
              <p className={`text-sm mb-4 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
                {searchTerm
                  ? "No se encontraron resultados para tu búsqueda"
                  : "Comienza agregando tu primera unidad"}
              </p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {isPaginated && paginatedBuses.length > 0 && (
          <div className="flex justify-center pt-4">
            <Pagination
              totalItems={busesFiltrados.length}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* FAB y Modal */}
      <Fab onClick={() => setIsRegisterBusModalOpen(true)} />

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
  );
};