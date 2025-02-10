import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login";

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={<h1>Bienvenido a BusLeadger</h1>} />
            </Routes>
        </Router>
        
    );
};

export default AppRouter;
