import { useState } from "react";
import {
  useDashboardPeriods,
  useDashboardSummary,
} from "../../Hooks/swr/useDashboard";
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

const DEFAULT_DASHBOARD_DATA = {
  totalAlumnos: 0,
  totalIngresos: 0,
  totalGastos: 0,
  totalCombustible: 0,
  totalBuses: 0,
  alumnosPagaron: 0,
  alumnosNoPagaron: 0,
};

const formatCurrency = (value) =>
  Number(value ?? 0).toLocaleString("es-HN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

export const Dashboard = () => {
  const currentDate = new Date();
  const currentMonth = currentDate
    .toLocaleString("es-US", { month: "long" })
    .toLowerCase();
  const [anioSeleccionado, setAnioSeleccionado] = useState(
    currentDate.getFullYear()
  );
  const [mesSeleccionado, setMesSeleccionado] = useState(currentMonth);
  const { periods: mesesYAnios, isLoading: periodsLoading } =
    useDashboardPeriods();
  const { summary, isLoading: summaryLoading } = useDashboardSummary(
    anioSeleccionado,
    mesSeleccionado
  );
  const dashboardData = { ...DEFAULT_DASHBOARD_DATA, ...(summary ?? {}) };
  const load = periodsLoading || summaryLoading;
  const paymentData = [
    { name: "Pagado", value: dashboardData.alumnosPagaron ?? 0, fill: "#10b981" },
    { name: "No Pagado", value: dashboardData.alumnosNoPagaron ?? 0, fill: "#ef4444" },
  ];

  const handleAnioChange = (e) => {
    const anio = Number(e.target.value);
    setAnioSeleccionado(anio);
  };

  const handleMesChange = (e) => {
    const mes = e.target.value;
    setMesSeleccionado(mes);
  };

  const aniosDisponibles = [...new Set(mesesYAnios.map((item) => item.anio))];
  const mesesDisponibles =
    mesesYAnios.find((item) => item.anio === anioSeleccionado)?.meses || [];

  const efectivoDisponible =
    (dashboardData.totalIngresos ?? 0) - (dashboardData.totalGastos ?? 0);

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
      <div className="w-full space-y-5">
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
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">
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
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">
              {/* Total Alumnos */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">
                    Alumnos
                  </CardTitle>
                  <span className="rounded-md bg-indigo-50 p-1.5 dark:bg-indigo-950/50">
                    <Users className="h-3 w-3 text-indigo-600 md:h-4 md:w-4 dark:text-indigo-300" />
                  </span>
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
                  <span className="rounded-md bg-gray-50 p-1.5 dark:bg-gray-950/50">
                    <Wallet
                    className={`h-3 w-3 md:h-4 md:w-4 ${
                      efectivoDisponible >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  />
                  </span>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-lg md:text-2xl font-bold ${
                      efectivoDisponible >= 0
                        ? "text-green-600 dark:text-green-500"
                        : "text-red-600 dark:text-red-500"
                    }`}
                  >L.
                    {formatCurrency(efectivoDisponible)}
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
                  <span className="rounded-md bg-green-50 p-1.5 dark:bg-green-950/50">
                    <TrendingUp className="h-3 w-3 text-green-600 md:h-4 md:w-4 dark:text-green-300" />
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="text-lg md:text-2xl font-bold">
                    L.{formatCurrency(dashboardData.totalIngresos)}
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
                  <span className="rounded-md bg-red-50 p-1.5 dark:bg-red-950/50">
                    <TrendingDown className="h-3 w-3 text-red-600 md:h-4 md:w-4 dark:text-red-300" />
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="text-lg md:text-2xl font-bold">
                    L.{formatCurrency(dashboardData.totalGastos)}
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
                  <span className="rounded-md bg-orange-50 p-1.5 dark:bg-orange-950/50">
                    <Fuel className="h-3 w-3 text-orange-600 md:h-4 md:w-4 dark:text-orange-300" />
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="text-lg md:text-2xl font-bold">
                    L.{formatCurrency(dashboardData.totalCombustible)}
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
                  <span className="rounded-md bg-blue-50 p-1.5 dark:bg-blue-950/50">
                    <Bus className="h-3 w-3 text-blue-600 md:h-4 md:w-4 dark:text-blue-300" />
                  </span>
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
            <div className="grid grid-cols-1 gap-3 md:gap-4 xl:grid-cols-[1.35fr_1fr]">
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
