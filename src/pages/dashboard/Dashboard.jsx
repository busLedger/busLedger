import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./dashboard.css";
import {
  useDashboardPeriodsQuery,
  useDashboardSummaryQuery,
} from "@/Hooks/queries/useDashboardQuery";
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
  Bus,
  Fuel,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";

const EMPTY_DASHBOARD = {
  totalBuses: 0,
  totalAlumnos: 0,
  alumnosPagaron: 0,
  alumnosNoPagaron: 0,
  totalIngresos: 0,
  totalGastos: 0,
  totalCombustible: 0,
};

const formatNumber = (value) =>
  Number(value ?? 0).toLocaleString("es-HN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

export const Dashboard = () => {
  const { userData } = useOutletContext();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate
    .toLocaleString("es-US", { month: "long" })
    .toLowerCase();
  const [anioSeleccionado, setAnioSeleccionado] = useState(currentYear);
  const [mesSeleccionado, setMesSeleccionado] = useState(currentMonth);

  const { data: periodos = [], isLoading: loadingPeriods } =
    useDashboardPeriodsQuery(userData?.uid);
  const {
    data: summary,
    isLoading: loadingSummary,
    isFetching,
  } = useDashboardSummaryQuery(userData?.uid, anioSeleccionado, mesSeleccionado);

  const mesesYAnios = useMemo(() => {
    const data = [...periodos];
    const currentYearData = data.find((item) => item.anio === currentYear);

    if (currentYearData && !currentYearData.meses.includes(currentMonth)) {
      return data.map((item) =>
        item.anio === currentYear
          ? { ...item, meses: [...item.meses, currentMonth] }
          : item
      );
    }

    if (!currentYearData) {
      return [...data, { anio: currentYear, meses: [currentMonth] }];
    }

    return data;
  }, [currentMonth, currentYear, periodos]);

  const dashboardData = { ...EMPTY_DASHBOARD, ...(summary ?? {}) };
  const load = loadingPeriods || loadingSummary;
  const efectivoDisponible =
    summary?.disponibleAcumulado ??
    summary?.disponible ??
    (dashboardData.totalIngresos ?? 0) - (dashboardData.totalGastos ?? 0);
  const aniosDisponibles = [...new Set(mesesYAnios.map((item) => item.anio))];
  const mesesDisponibles =
    mesesYAnios.find((item) => item.anio === anioSeleccionado)?.meses || [];
  const paymentData = [
    { name: "Pagado", value: dashboardData.alumnosPagaron, fill: "#10b981" },
    { name: "No Pagado", value: dashboardData.alumnosNoPagaron, fill: "#ef4444" },
  ];

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

  const handleAnioChange = (e) => {
    setAnioSeleccionado(Number(e.target.value));
  };

  const handleMesChange = (e) => {
    setMesSeleccionado(e.target.value);
  };

  return (
    <div className="min-h-screen w-full bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-3xl">
                Dashboard
              </h2>
              <p className="text-sm text-muted-foreground">
                Vista general de tu sistema
              </p>
            </div>
            {isFetching && !load && (
              <span className="text-xs font-medium text-muted-foreground">
                Actualizando...
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <SelectList
              options={aniosOptions}
              value={anioSeleccionado}
              onChange={handleAnioChange}
              placeholder="Seleccionar Ano"
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
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium md:text-sm">
                    Alumnos
                  </CardTitle>
                  <Users className="h-3 w-3 text-muted-foreground md:h-4 md:w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold md:text-2xl">
                    {dashboardData.totalAlumnos}
                  </div>
                  <p className="text-[10px] text-muted-foreground md:text-xs">
                    Registrados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium md:text-sm">
                    Efectivo
                  </CardTitle>
                  <Wallet
                    className={`h-3 w-3 md:h-4 md:w-4 ${
                      efectivoDisponible >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-lg font-bold md:text-2xl ${
                      efectivoDisponible >= 0
                        ? "text-green-600 dark:text-green-500"
                        : "text-red-600 dark:text-red-500"
                    }`}
                  >
                    L.{formatNumber(efectivoDisponible)}
                  </div>
                  <p className="text-[10px] text-muted-foreground md:text-xs">
                    Disponible
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium md:text-sm">
                    Ingresos
                  </CardTitle>
                  <TrendingUp className="h-3 w-3 text-green-500 md:h-4 md:w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold md:text-2xl">
                    L.{formatNumber(dashboardData.totalIngresos)}
                  </div>
                  <p className="text-[10px] text-muted-foreground md:text-xs">
                    Total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium md:text-sm">
                    Gastos
                  </CardTitle>
                  <TrendingDown className="h-3 w-3 text-red-500 md:h-4 md:w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold md:text-2xl">
                    L.{formatNumber(dashboardData.totalGastos)}
                  </div>
                  <p className="text-[10px] text-muted-foreground md:text-xs">
                    Total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium md:text-sm">
                    Combustible
                  </CardTitle>
                  <Fuel className="h-3 w-3 text-orange-500 md:h-4 md:w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold md:text-2xl">
                    L.{formatNumber(dashboardData.totalCombustible)}
                  </div>
                  <p className="text-[10px] text-muted-foreground md:text-xs">
                    Gasto
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium md:text-sm">
                    Buses
                  </CardTitle>
                  <Bus className="h-3 w-3 text-blue-500 md:h-4 md:w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold md:text-2xl">
                    {dashboardData.totalBuses}
                  </div>
                  <p className="text-[10px] text-muted-foreground md:text-xs">
                    En operacion
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2">
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg">
                    Estado de Pagos
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Alumnos al dia vs. pendientes
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 pb-4">
                  <ChartContainer
                    config={chartConfig}
                    className="h-[200px] w-full sm:h-[250px] md:h-[300px]"
                  >
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
                            fontSize: "12px",
                            paddingTop: "10px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg">
                    Resumen de Pagos
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Distribucion por estado
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Alumnos Pagaron</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-500 md:text-2xl">
                        {dashboardData.alumnosPagaron}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-950 md:h-12 md:w-12">
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-500 md:h-6 md:w-6" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Alumnos No Pagaron</p>
                      <p className="text-xl font-bold text-red-600 dark:text-red-500 md:text-2xl">
                        {dashboardData.alumnosNoPagaron}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950 md:h-12 md:w-12">
                      <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-500 md:h-6 md:w-6" />
                    </div>
                  </div>

                  <div className="border-t pt-3">
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
