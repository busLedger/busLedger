import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import { Home } from "../pages/home/Home";
import { AdminPanel } from "../pages/admin/AdminPanel";
import Dashboard  from "../pages/dashboard/Dashboard";
const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                    <Route path="/home" element={<Home />}>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="admin-panel" element={<AdminPanel />} />
                    </Route>
            </Routes>
        </Router>
    );
};



export default AppRouter;