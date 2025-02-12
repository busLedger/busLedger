import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api/auth.service";
import { Outlet } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { Sidebar } from "../../components/sidebar";
import { Offcanvas } from "../../components/ui/offcanvas";
import { getUserData } from "../../api/user.service";
import { Load } from "../../components/ui/Load";

export const Home = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [offcanvasOpen, setOffcanvasOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  
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

  const Menus = [
    { title: "Admin Panel", src: "admin-panel", rol: ["Admin"], ruta:"admin-panel" },
    { title: "Dashboard", src: "analytics", rol: ["Admin", "Dueño"], ruta:"dashboard" },
    { title: "Unidades", src: "bus", rol: ["Admin", "Dueño"],ruta:"unidades-transporte" },
    { title: "Alumnos", src: "school", gap: true, rol: ["Admin", "Dueño", "Conductor"], ruta:"alumnos" },
    { title: "Pagos", src: "pagos", rol: ["Admin", "Dueño"], ruta:"pagos" },
    { title: "Gastos", src: "gastos", rol: ["Admin", "Dueño"], ruta:"gastos" },
    { title: "Panel Usuario", src: "user_panel", rol: ["Admin", "Dueño", "Conductor"], ruta:"panel-usuario" },
  ];

  const filteredMenus = userData
    ? Menus.filter(menu => menu.rol.some(rol => userData.roles.includes(rol)))
    : [];

  const isDesktop = useMediaQuery({ minWidth: 768 });

  // 🔴 Mostrar pantalla de carga si `userData` aún no está listo
  if (!userData) {
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
              className="p-2 bg-dark-purple text-white fixed top-4 left-4 z-50"
            >
              Menu
            </button>
          )}

          <Offcanvas
            isOpen={offcanvasOpen}
            onClose={() => setOffcanvasOpen(false)}
            Menus={filteredMenus}
            toggleTheme={toggleTheme}
            cerrarSesion={cerrarSesion}
          />
        </>
      )}

      <div className="h-screen flex-1 p-7">
        <Outlet/>
      </div>
    </div>
  );
};
