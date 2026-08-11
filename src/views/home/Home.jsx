import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { usePathname, useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import { Sidebar } from "../../components/ui/sidebar";
import { MobileNav } from "../../components/ui/mobile-nav";
import { useMe } from "../../Hooks/swr/useUsers";
import { useSWRConfig } from "swr";
import { useAuth } from "../../components/providers/AuthProvider";
import { HomeProvider } from "../../components/providers/HomeProvider";
import { Moon, Sun, Menu } from "lucide-react";

import imgAdminPanel from "../../assets/admin-panel.png";
import imgDashboard from "../../assets/analytics.png";
import imgUnidades from "../../assets/bus.png";
import imgAlumnos from "../../assets/school.png";
import imgPagos from "../../assets/pagos.png";
import imgGastos from "../../assets/gastos.png";
import imgPanelUsuario from "../../assets/user_panel.png";

export const Home = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { mutate: mutateCache } = useSWRConfig();
  const { logout } = useAuth();
  const { user: userData, isLoading } = useMe();
  const [open, setOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const Menus = [
    { title: "Admin Panel", src: imgAdminPanel, rol: ["Admin"], ruta: "admin-panel" },
    { title: "Dashboard", src: imgDashboard, rol: ["Admin", "Dueño"], ruta: "dashboard" },
    { title: "Unidades", src: imgUnidades, rol: ["Admin", "Dueño"], ruta: "unidades-transporte" },
    { title: "Alumnos", src: imgAlumnos, gap: true, rol: ["Admin", "Dueño", "Conductor"], ruta: "alumnos" },
    { title: "Pagos / Ingresos", src: imgPagos, rol: ["Admin", "Dueño"], ruta: "pagos" },
    { title: "Gastos", src: imgGastos, rol: ["Admin", "Dueño"], ruta: "gastos" },
    { title: "Panel Usuario", src: imgPanelUsuario, rol: ["Admin"], ruta: "panel-usuario" },
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme) {
      const isDark = JSON.parse(savedTheme);
      setDarkMode(isDark);
      document.documentElement.classList.toggle("dark", isDark);
    }

    if (pathname === "/home") {
      router.replace("/home/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle("dark", newDarkMode);
    localStorage.setItem("darkMode", JSON.stringify(newDarkMode));
  };

  const cerrarSesion = async () => {
    await logout();
    await mutateCache(() => true, undefined, { revalidate: false });
    router.replace("/");
  };

  const filteredMenus = userData
    ? Menus.filter((menu) => menu.rol.some((rol) => userData.roles.includes(rol)))
    : [];

  const isDesktop = useMediaQuery({ minWidth: 1024 });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen w-full overflow-hidden ${darkMode ? "dark" : ""}`}>
      {isDesktop ? (
        <Sidebar
          isOpen={open}
          Menus={filteredMenus}
          toggleTheme={toggleTheme}
          cerrarSesion={cerrarSesion}
          onToggle={() => setOpen(!open)}
          darkMode={darkMode}
        />
      ) : (
        <>
          {/* Header móvil minimalista */}
          <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-2 lg:hidden">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg p-2 hover:bg-accent transition-colors"
            >
              <Menu className={`h-5 w-5 ${darkMode ? 'text-white' : 'text-black'}`} />
            </button>

            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 hover:bg-accent transition-colors"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-white" />
              ) : (
                <Moon className="h-5 w-5 text-black" />
              )}
            </button>
          </header>

          {/* Mobile Navigation */}
          <MobileNav
            isOpen={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
            Menus={filteredMenus}
            toggleTheme={toggleTheme}
            cerrarSesion={cerrarSesion}
            darkMode={darkMode}
            userData={userData}
          />
        </>
      )}

      {/* Contenido principal */}
      <main className={`min-w-0 flex-1 overflow-y-auto bg-background ${!isDesktop ? "pt-16" : ""}`}>
        <HomeProvider value={{ userData, darkMode }}>
          {children}
        </HomeProvider>
      </main>
    </div>
  );
};

Home.propTypes = {
  children: PropTypes.node.isRequired,
};
