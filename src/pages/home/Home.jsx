import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api/auth.service";
import { Outlet } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { Sidebar } from "../../components/ui/sidebar";
import { Offcanvas } from "../../components/ui/offcanvas";
import { getUserData } from "../../api/user.service";
import { Load } from "../../components/ui/Load";
import Logo from "../../assets/logo.png";

import imgAdminPanel from "../../assets/admin-panel.png";
import imgDashboard from "../../assets/analytics.png";
import imgUnidades from "../../assets/bus.png";
import imgAlumnos from "../../assets/school.png";
import imgPagos from "../../assets/pagos.png";
import imgGastos from "../../assets/gastos.png";
import imgPanelUsuario from "../../assets/user_panel.png";

export const Home = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [offcanvasOpen, setOffcanvasOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  const Menus = [
    { title: "Admin Panel", src: imgAdminPanel, rol: ["Admin"], ruta:"admin-panel" },
    { title: "Dashboard", src: imgDashboard, rol: ["Admin", "Dueño"], ruta:"dashboard" },
    { title: "Unidades", src: imgUnidades, rol: ["Admin", "Dueño"],ruta:"unidades-transporte" },
    { title: "Alumnos", src: imgAlumnos, gap: true, rol: ["Admin", "Dueño", "Conductor"], ruta:"alumnos" },
    { title: "Pagos", src: imgPagos, rol: ["Admin", "Dueño"], ruta:"pagos" },
    { title: "Gastos", src: imgGastos, rol: ["Admin", "Dueño"], ruta:"gastos" },
    { title: "Panel Usuario", src: imgPanelUsuario, rol: ["Admin", "Dueño", "Conductor"], ruta:"panel-usuario" },
  ];
  
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await getUserData();
        setUserData(data);
      } catch (error) {
        console.error("Error obteniendo datos del usuario:", error);
      }
    };

    fetchUserInfo();

    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
      document.documentElement.classList.toggle("dark", JSON.parse(savedTheme));
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle("dark", newDarkMode);
    localStorage.setItem("darkMode", JSON.stringify(newDarkMode));
  };

  const cerrarSesion = async () => {
    await logout();
    navigate("/");
  };

 

  const filteredMenus = userData
    ? Menus.filter(menu => menu.rol.some(rol => userData.roles.includes(rol)))
    : [];

  const isDesktop = useMediaQuery({ minWidth: 768 });

  if (!userData ) {
    return <Load />;
  }

  return (
    <div className={`flex ${darkMode ? "dark" : ""}`}>
      {isDesktop ? (
        <Sidebar
          isOpen={open}
          Menus={filteredMenus}
          toggleTheme={toggleTheme}
          cerrarSesion={cerrarSesion}
          onToggle={() => setOpen(!open)}
        />
      ) : (
        <>
          {!offcanvasOpen && (
            <button
              onClick={() => setOffcanvasOpen(true)}
              className="fixed top-4 left-4 z-50"
            >
              <img src={Logo} alt="Logo" />
            </button>
          )}

          <Offcanvas
            isOpen={offcanvasOpen}
            onClose={() => setOffcanvasOpen(false)}
            Menus={filteredMenus}
            toggleTheme={toggleTheme}
            cerrarSesion={cerrarSesion}
            darkMode={darkMode}
          />
        </>
      )}

      <div className="h-screen min-h-screen flex-1 p-7 overflow-y-auto">
      <Outlet context={{ userData, darkMode }} />
      </div>
    </div>
  );
};
