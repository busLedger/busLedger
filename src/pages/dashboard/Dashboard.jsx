import ChartTemplate from "../../components/ui/ChartTemplate";

const Dashboard = () => {
  // Datos de ejemplo
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
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
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2">Resumen</h2>
        <p>Total de alumnos: {paymentData.reduce((sum, item) => sum + item.value, 0)}</p>
        <p>Número de buses: {busData.length}</p>
        <p>
          Promedio de alumnos por bus:{" "}
          {(busData.reduce((sum, item) => sum + item.students, 0) / busData.length).toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
