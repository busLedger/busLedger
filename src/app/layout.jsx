import "antd/dist/reset.css";
import "../index.css";
import "../App.css";
import "../components/ui/Fab/fab.css";
import "../components/ui/Pagination/pagination.css";
import "../views/alumnos/alumnos.css";
import "../views/dashboard/dashboard.css";
import "../views/facturas/factura.css";
import "../views/gastos/gastos.css";
import "../views/ingresos/ingresos.css";
import "../views/unidades/unidades.css";
import { AuthProvider } from "../components/providers/AuthProvider";
import { SWRProvider } from "../components/providers/SWRProvider";

export const metadata = {
  title: "BusLedger",
  description: "Gestion de unidades, alumnos, pagos y gastos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <SWRProvider>{children}</SWRProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
