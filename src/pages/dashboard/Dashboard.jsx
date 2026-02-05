/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./dashboard.css";
import {
  getMesesYAniosConRegistros,
  getResumenPorMes,
  getResumenPorAnio,
} from "../../api/dashboard.service";
import SelectList from "@/components/ui/SelectList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Wallet,
  Fuel,
  TrendingUp,
  TrendingDown,
  Bus,
} from "lucide-react";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";

export const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState([]);
  const [mesesYAnios, setMesesYAnios] = useState([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState(
    new Date().getFullYear()
  );
  const [paymentData, setPaymentData] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState("todos");
  const { userData } = useOutletContext();
  const [load, setLoad] = useState(true);

  useEffect(() => {
    if (!userData?.uid) return;

    const fetchData = async () => {
      try {
        const data = await getMesesYAniosConRegistros(userData.uid);
        setMesesYAnios(data);
        setDefaultMesSeleccionado(data);
      } catch (error) {
        console.error("Error al obtener los meses y años con registros:", error);
      }
    };

    fetchData();
  }, [userData?.uid]);

  const setDefaultMesSeleccionado = async (data) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date()
      .toLocaleString("es-US", { month: "long" })
      .toLowerCase();
    const currentYearData = data.find((item) => item.anio === currentYear);

    if (currentYearData && !currentYearData.meses.includes(currentMonth)) {
      currentYearData.meses.push(currentMonth);
    }
    await obtenerData(currentYear, currentMonth);

    setAnioSeleccionado(currentYear);
    setMesSeleccionado(currentMonth);
  };

  const handleAnioChange = (e) => {
    const anio = Number(e.target.value);
    setAnioSeleccionado(anio);
    obtenerData(anio, mesSeleccionado);
  };

  const handleMesChange = (e) => {
    const mes = e.target.value;
    setMesSeleccionado(mes);
    obtenerData(anioSeleccionado, mes);
  };

  const obtenerData = async (anio, mes) => {
    setLoad(true);
    let data = [];
    try {
      if (mes === "todos") {
        data = await getResumenPorAnio(userData.uid, anio);
      } else {
        data = await getResumenPorMes(userData.uid, anio, mes);
      }
      console.log(data);
      setDashboardData(data);
      setPaymentData([
        { 
          name: "Pagado", 
          value: data.alumnosPagaron,
          fill: "#10b981" // verde
        },
        { 
          name: "No Pagado", 
          value: data.alumnosNoPagaron,
          fill: "#ef4444" // rojo
        },
      ]);
    } catch (error) {
      console.error("Error al obtener el resumen:", error);
    } finally {
      setLoad(false);
    }
  };

  const aniosDisponibles = [...new Set(mesesYAnios.map((item) => item.anio))];
  const mesesDisponibles =
    mesesYAnios.find((item) => item.anio === anioSeleccionado)?.meses || [];

  const efectivoDisponible =
    dashboardData.totalIngresos - dashboardData.totalGastos;

  const chartConfig = {
    pagado: {
      label: "Pagado",
      color: "#10b981",
    },
    noPagado: {
      label: "No Pagado",
      color: "#ef4444",
    },
  };

  // Formatear opciones para SelectList
  const aniosOptions = aniosDisponibles.map((anio) => ({
    value: anio,
    label: anio.toString(),
  }));

  const mesesOptions = [
    { value: "todos", label: "Todos los meses" },
    ...mesesDisponibles.map((mes) => ({
      value: mes,
      label: mes.charAt(0).toUpperCase() + mes.slice(1),
    })),
  ];

  return (
    <div className="min-h-screen w-full bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header - Ajustado para móvil */}
        <div className="space-y-3">
          <div>
            <h2 className="text-3xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Vista general de tu sistema
            </p>
          </div>

          {/* Filtros con SelectList */}
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <SelectList
              options={aniosOptions}
              value={anioSeleccionado}
              onChange={handleAnioChange}
              placeholder="Seleccionar Año"
              className="sm:w-[180px]"
            />

            <SelectList
              options={mesesOptions}
              value={mesSeleccionado}
              onChange={handleMesChange}
              placeholder="Seleccionar Mes"
              className="sm:w-[180px]"
            />
          </div>
        </div>

        {load ? (
          <div className="space-y-4">
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-3 w-[100px]" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-6 w-[80px]" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Cards de métricas - Grid 2 columnas en móvil */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              {/* Total Alumnos */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">
                    Alumnos
                  </CardTitle>
                  <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">
                    {dashboardData.totalAlumnos}
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    Registrados
                  </p>
                </CardContent>
              </Card>

              {/* Efectivo Disponible */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">
                    Efectivo
                  </CardTitle>
                  <Wallet
                    className={`h-3 w-3 md:h-4 md:w-4 ${
                      efectivoDisponible >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-lg md:text-2xl font-bold ${
                      efectivoDisponible >= 0
                        ? "text-green-600 dark:text-green-500"
                        : "text-red-600 dark:text-red-500"
                    }`}
                  >
                    {efectivoDisponible.toLocaleString("es-HN", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{" "}
                    <span className="text-sm">L</span>
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    Disponible
                  </p>
                </CardContent>
              </Card>

              {/* Ingresos Totales */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">
                    Ingresos
                  </CardTitle>
                  <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg md:text-2xl font-bold">
                    {dashboardData.totalIngresos.toLocaleString("es-HN", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{" "}
                    <span className="text-sm">L</span>
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    Total
                  </p>
                </CardContent>
              </Card>

              {/* Gastos Totales */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">
                    Gastos
                  </CardTitle>
                  <TrendingDown className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg md:text-2xl font-bold">
                    {dashboardData.totalGastos.toLocaleString("es-HN", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{" "}
                    <span className="text-sm">L</span>
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    Total
                  </p>
                </CardContent>
              </Card>

              {/* Combustible */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">
                    Combustible
                  </CardTitle>
                  <Fuel className="h-3 w-3 md:h-4 md:w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg md:text-2xl font-bold">
                    {dashboardData.totalCombustible.toLocaleString("es-HN", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{" "}
                    <span className="text-sm">L</span>
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    Gasto
                  </p>
                </CardContent>
              </Card>

              {/* Número de Buses */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">
                    Buses
                  </CardTitle>
                  <Bus className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">
                    {dashboardData.totalBuses}
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    En operación
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
              {/* Gráfico de Pastel con shadcn */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg">Estado de Pagos</CardTitle>
                  <CardDescription className="text-xs">
                    Alumnos al día vs. pendientes
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 pb-4">
                  <ChartContainer config={chartConfig} className="w-full h-[200px] sm:h-[250px] md:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie
                          data={paymentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius="60%"
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {paymentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Legend 
                          wrapperStyle={{
                            fontSize: '12px',
                            paddingTop: '10px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Resumen de Pagos */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg">Resumen de Pagos</CardTitle>
                  <CardDescription className="text-xs">
                    Distribución por estado
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Alumnos Pagaron</p>
                      <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-500">
                        {dashboardData.alumnosPagaron}
                      </p>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-500" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Alumnos No Pagaron</p>
                      <p className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-500">
                        {dashboardData.alumnosNoPagaron}
                      </p>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                      <TrendingDown className="h-5 w-5 md:h-6 md:w-6 text-red-600 dark:text-red-500" />
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-muted-foreground">
                        Porcentaje de pago
                      </span>
                      <span className="font-medium">
                        {dashboardData.totalAlumnos > 0
                          ? (
                              (dashboardData.alumnosPagaron /
                                dashboardData.totalAlumnos) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};