/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useContainerHeight } from "../../Hooks/useContainerHeight.js";
import { useOutletContext } from "react-router-dom";
import { getMesesYAniosConRegistros, getResumenPorMes, getResumenPorAnio } from "../../api/dashboard.service";
import { ConfigProvider, Select } from "antd";
import ChartTemplate from "../../components/ui/ChartTemplate";

const { Option } = Select;

export const Dashboard = () => {
  const containerRef = useContainerHeight();
  const [mesesYAnios, setMesesYAnios] = useState([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
  const [mesSeleccionado, setMesSeleccionado] = useState("todos");
  const { userData, darkMode } = useOutletContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMesesYAniosConRegistros(userData.uid);
        console.log('Meses y anios:', data);
        setMesesYAnios(data);
        setDefaultMesSeleccionado(data);
      } catch (error) {
        console.error("Error al obtener los meses y años con registros:", error);
      }
    };
    fetchData();
  }, []);

  const setDefaultMesSeleccionado = (data) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleString('es-ES', { month: 'long' }).toLowerCase();
    const currentYearData = data.find(item => item.anio === currentYear);

    if (currentYearData && !currentYearData.meses.includes(currentMonth)) {
      currentYearData.meses.push(currentMonth);
    }

    setAnioSeleccionado(currentYear);
    setMesSeleccionado(currentMonth);
  };

  const handleAnioChange = (anio) => {
    setAnioSeleccionado(anio);
    console.log(`Año seleccionado: ${anio}`);
    obtenerData();
  };

  const handleMesChange = (mes) => {
    setMesSeleccionado(mes);
    console.log(`Mes seleccionado: ${mes}`);
    obtenerData();
  };

  const obtenerData = async () => {
    try {
      if (mesSeleccionado === "todos") {
        const data = await getResumenPorAnio(userData.uid, anioSeleccionado);
        console.log(`Resumen de ${anioSeleccionado}:`, data);
      } else {
        const data = await getResumenPorMes(userData.uid, anioSeleccionado, mesSeleccionado);
        console.log(`Resumen de ${mesSeleccionado} de ${anioSeleccionado}:`, data);
      }
    } catch (error) {
      console.error("Error al obtener el resumen:", error);
    }
  }

  const customTheme = {
    token: {
      colorPrimary: darkMode ? "#1890ff" : "#ff4d4f",
      colorText: darkMode ? "#ffffff" : "#000000",
      colorBgContainer: darkMode ? "#141414" : "#ffffff",
    },
  };

  const paymentData = [
    { name: "Pagado", value: 300 },
    { name: "No Pagado", value: 50 },
  ];

  const busData = [
    { name: "Bus 1", students: 30 },
    { name: "Bus 2", students: 25 },
    { name: "Bus 3", students: 35 },
    { name: "Bus 4", students: 20 },
    { name: "Bus 5", students: 28 },
  ];

  const monthlyData = [
    { name: "Ene", students: 280 },
    { name: "Feb", students: 300 },
    { name: "Mar", students: 310 },
    { name: "Abr", students: 325 },
    { name: "May", students: 350 },
    { name: "Jun", students: 340 },
  ];

  const aniosDisponibles = [...new Set(mesesYAnios.map(item => item.anio))];
  const mesesDisponibles = mesesYAnios.find(item => item.anio === anioSeleccionado)?.meses || [];

  return (
    <ConfigProvider theme={customTheme}>
      <div className="p-4 bg-dark-purple w-full">
        <section
          ref={containerRef}
          className="container-movil container w-full mx-auto p-2"
        >
          <p className="title-pages">Dashboard</p>
           {/* Filtros de Año y Mes */}
        <div className="w-full flex justify-center gap-4 mb-4">
          <Select
            value={anioSeleccionado}
            onChange={handleAnioChange}
            className="w-2/6"
            placeholder="Seleccionar Año"
          >
            {aniosDisponibles.map(anio => (
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
            {mesesDisponibles.map(mes => (
              <Option key={mes} value={mes}>
                {mes.charAt(0).toUpperCase() + mes.slice(1)}
              </Option>
            ))}
          </Select>
        </div>

        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 data-div">
          {/* 📊 Gráfico de pagos (Pie Chart) */}
          <ChartTemplate
            title="Estado de Pagos"
            description="Alumnos que han pagado vs. los que no han pagado"
            data={paymentData}
            config={{ value: { label: "Alumnos", color: "#ff6384" } }}
            type="pie"
          />

          {/* 📊 Gráfico de alumnos por bus (Bar Chart) */}
          <ChartTemplate
            title="Alumnos por Bus"
            description="Cantidad de alumnos en cada bus"
            data={busData}
            config={{ students: { label: "Alumnos", color: "#36a2eb" } }}
            type="bar"
          />

          {/* 📊 Gráfico de evolución de alumnos (Line Chart) */}
          <ChartTemplate
            title="Evolución de Alumnos"
            description="Número de alumnos por mes"
            data={monthlyData}
            config={{ students: { label: "Alumnos", color: "#ffce56" } }}
            type="line"
          />

          {/* 📋 Resumen */}
          <div className="bg-dark-purple p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-2">Resumen</h2>
            <p>Total de alumnos: {paymentData.reduce((sum, item) => sum + item.value, 0)}</p>
            <p>Número de buses: {busData.length}</p>
            <p>
              Promedio de alumnos por bus:{" "}
              {(busData.reduce((sum, item) => sum + item.students, 0) / busData.length).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};