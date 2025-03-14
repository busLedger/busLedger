import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {Login} from "../pages/auth/Login";
import { Home } from "../pages/home/Home";
import {AdminPanel}  from "../pages/admin/AdminPanel";
import { Unidades } from "../pages/unidades/Unidades";
import { Alumnos } from "../pages/alumnos/Alumnos";
import { Ingresos } from "../pages/ingresos/Ingresos";
import { Gastos } from "../pages/gastos/Gastos";
import {Dashboard}  from "../pages/dashboard/Dashboard";
import { VerUnidad } from "../pages/unidades/VerUnidad";
import { VerAlumno } from "../pages/alumnos/VerAlumno";
const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                    <Route path="/home" element={<Home />}>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="admin-panel" element={<AdminPanel />} />
                        <Route path="unidades-transporte" element={<Unidades />} />
                        <Route path="unidades-transporte/:id" element={<VerUnidad />} />
                        <Route path="alumnos" element={<Alumnos />} />
                        <Route path="alumnos/:id" element={<VerAlumno />} />
                        <Route path="pagos" element={<Ingresos />} />
                        <Route path="gastos" element={<Gastos />} />
                    </Route>
            </Routes>
        </Router>
    );
};



export default AppRouter;