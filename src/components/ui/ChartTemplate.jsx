/* eslint-disable react/prop-types */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card";
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend, Tooltip, LineChart, Line, BarChart, Bar, PieChart, Pie } from "recharts";

const ChartTemplate = ({ title, description, data, config, type }) => {
  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {Object.keys(config).map((key) => (
              <Line key={key} type="monotone" dataKey={key} stroke={config[key].color} name={config[key].label} />
            ))}
          </LineChart>
        );

      case "bar":
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {Object.keys(config).map((key) => (
              <Bar key={key} dataKey={key} fill={config[key].color} name={config[key].label} />
            ))}
          </BarChart>
        );

      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={Object.keys(config)[0]}
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill={config[Object.keys(config)[0]].color}
              label
            />
            <Tooltip />
            <Legend />
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">{renderChart()}</ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartTemplate;
