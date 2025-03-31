/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./dashboard.css"
import {
  getMesesYAniosConRegistros,
  getResumenPorMes,
  getResumenPorAnio,
} from "../../api/dashboard.service";
import { ConfigProvider, Select } from "antd";
import ChartTemplate from "../../components/ui/ChartTemplate";
import { CardResum } from "../../components/ui/CardResum.jsx";
import { Load } from "../../components/ui/Load.jsx";

const { Option } = Select;

export const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState([]);
  const [mesesYAnios, setMesesYAnios] = useState([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState(
    new Date().getFullYear()
  );
  const [paymentData, setPaymentData] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState("todos");
  const { userData, darkMode } = useOutletContext();
  const [load, setLoad] = useState(true);

  useEffect(() => {
    const initialFetch = async () => {
      const initialFetch = localStorage.getItem("init_login");
      if (initialFetch) {
        localStorage.removeItem("init_login");
        window.location.reload();
      }
    };

    const fetchData = async () => {
      try {
        const data = await getMesesYAniosConRegistros(userData.uid);
        setMesesYAnios(data);
        setDefaultMesSeleccionado(data);
      } catch (error) {
        console.error(
          "Error al obtener los meses y años con registros:",
          error
        );
      }
    };
    initialFetch();
    fetchData();
  }, []);

  const setDefaultMesSeleccionado = async (data) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date()
      .toLocaleString("es-ES", { month: "long" })
      .toLowerCase();
    const currentYearData = data.find((item) => item.anio === currentYear);

    if (currentYearData && !currentYearData.meses.includes(currentMonth)) {
      currentYearData.meses.push(currentMonth);
    }
    await obtenerData(currentYear, currentMonth);

    setAnioSeleccionado(currentYear);
    setMesSeleccionado(currentMonth);
  };

  const handleAnioChange = (anio) => {
    setAnioSeleccionado(anio);
    obtenerData(anio, mesSeleccionado);
  };

  const handleMesChange = (mes) => {
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
        { name: "Pagado", value: data.alumnosPagaron },
        { name: "No Pagado", value: data.alumnosNoPagaron },
      ]);
    } catch (error) {
      console.error("Error al obtener el resumen:", error);
    } finally {
      setLoad(false);
    }
  };

  const customTheme = {
    token: {
      colorPrimary: darkMode ? "#1890ff" : "#ff4d4f",
      colorText: darkMode ? "#ffffff" : "#000000",
      colorBgContainer: darkMode ? "#141414" : "#ffffff",
    },
  };


  const aniosDisponibles = [...new Set(mesesYAnios.map((item) => item.anio))];
  const mesesDisponibles =
    mesesYAnios.find((item) => item.anio === anioSeleccionado)?.meses || [];

  return (
    <ConfigProvider theme={customTheme}>
      <div className="p-4 bg-dark-purple w-full h-[97vh]">
        <section className="container-movil container w-full mx-auto p-2 filters-height">
          <p className="title-pages">Dashboard</p>
          {/* Filtros de Año y Mes */}
          <div className="w-full flex justify-center gap-4 mb-4">
            <Select
              value={anioSeleccionado}
              onChange={handleAnioChange}
              className="w-2/6"
              placeholder="Seleccionar Año"
            >
              {aniosDisponibles.map((anio) => (
                <Option key={anio} value={anio}>
                  {anio}
                </Option>
              ))}
            </Select>
            <Select
              value={mesSeleccionado}
              onChange={handleMesChange}
              className="w-2/6"
              placeholder="Seleccionar Mes"
            >
              <Option value="todos">Todos</Option>
              {mesesDisponibles.map((mes) => (
                <Option key={mes} value={mes}>
                  {mes.charAt(0).toUpperCase() + mes.slice(1)}
                </Option>
              ))}
            </Select>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 info-height " >
          {load ? (
            <Load />
          ) : (
            <>
              {/* 📊 Gráfico de pagos (Pie Chart) */}
              <ChartTemplate
                title="Estado de Pagos"
                description="Alumnos al dia vs. pendientes de pago"
                data={paymentData}
                config={{
                  value: { label: "Alumnos", color: ["#725EFF", "#b41c6b"] },
                }}
                type="pie"
              />

           
          {/* <ChartTemplate
            title="Alumnos por Bus"
            description="Cantidad de alumnos en cada bus"
            data={busData}
            config={{ students: { label: "Alumnos", color: "#36a2eb" } }}
            type="bar"
          /> */}

              {/* 📊 Gráfico de evolución de alumnos (Line Chart) 
          <ChartTemplate
            title="Evolución de Alumnos"
            description="Número de alumnos por mes"
            data={monthlyData}
            config={{ students: { label: "Alumnos", color: "#ffce56" } }}
            type="line"
          />*/}

              <div className="grid grid-cols-2 gap-4">
                <CardResum
                  title="Cantidad de Alumnos"
                  description={`${dashboardData.totalAlumnos}`}
                  theme={darkMode}
                />
                 <CardResum
                  title="Efectivo Disponible"
                  description={`$${(dashboardData.totalIngresos - dashboardData.totalGastos).toFixed(2)} Lps`}
                  theme={darkMode}
                />
                <CardResum
                  title="Gasto en Combustible"
                  description={`${(dashboardData.totalCombustible).toFixed(2)} Lps`}
                  theme={darkMode}
                />
                 <CardResum
                  title="Ingresos Totales"
                  description={`${(dashboardData.totalIngresos).toFixed(2)} Lps`}
                  theme={darkMode}
                />
                <CardResum
                  title="Gastos Totales"
                  description={`${(dashboardData.totalGastos).toFixed(2)} Lps`}
                  theme={darkMode}
                />
                 <CardResum
                  title="Numero de buses"
                  description={`${dashboardData.totalBuses}`}
                  theme={darkMode}
                />
               
                {/* <CardResum
                  title="Promedios de Alumnos por Bus"
                  description={`${dashboardData.totalAlumnos / dashboardData.totalBuses}`}
                  theme={darkMode}
                /> */}
               
              </div>
            </>
          )}
        </div>
      </div>
    </ConfigProvider>
  );
};
