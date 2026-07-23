import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {Login} from "../views/auth/Login";
import { Home } from "../views/home/Home";
import {AdminPanel}  from "../views/admin/AdminPanel";
import { Unidades } from "../views/unidades/Unidades";
import { Alumnos } from "../views/alumnos/Alumnos";
import { Ingresos } from "../views/ingresos/Ingresos";
import { Gastos } from "../views/gastos/Gastos";
import {Dashboard}  from "../views/dashboard/Dashboard";
import { VerUnidad } from "../views/unidades/VerUnidad";
import { VerAlumno } from "../views/alumnos/VerAlumno";
import { Factura } from "../views/facturas/Factura";
import { ProtectedRoute } from "../views/auth/ProtectedRoute";
const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                    <Route
                        path="/home"
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="admin-panel" element={<AdminPanel />} />
                        <Route path="unidades-transporte" element={<Unidades />} />
                        <Route path="unidades-transporte/:id" element={<VerUnidad />} />
                        <Route path="alumnos" element={<Alumnos />} />
                        <Route path="alumnos/:id" element={<VerAlumno />} />
                        <Route path="alumnos/:id/factura" element={<Factura />} />
                        <Route path="pagos" element={<Ingresos />} />
                        <Route path="gastos" element={<Gastos />} />
                    </Route>
            </Routes>
        </Router>
    );
};



export default AppRouter;
