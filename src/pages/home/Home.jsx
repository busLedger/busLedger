import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api/auth.service";
import { Outlet } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [offcanvasOpen, setOffcanvasOpen] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  const cerrarSesion = async () => {
    await logout();
    navigate('/');
  };

  const Menus = [
    { title: "Dashboard", src: "analytics" },
    { title: "Unidades", src: "bus" },
    { title: "Alumnos", src: "school", gap: true },
    { title: "Pagos", src: "pagos" },
    { title: "Gastos", src: "gastos" },
    { title: "Analytics", src: "Chart" }
  ];

  return (
    <div className={`flex ${darkMode ? "dark" : ""}`}>
      <div
        className={`${
          open ? "w-75" : "w-25"
        } bg-dark-purple h-screen p-5 pt-8 relative duration-300 shadow-lg hidden md:block`}
      >
        <div className="flex gap-x-4 items-center">
          <img
            src="./src/assets/logo.png"
            onClick={() => setOpen(!open)}
            className={`cursor-pointer duration-500 ${
              open && "rotate-[360deg]"
            }`}
          />
          <h3
            className={`text-white origin-left font-medium text-xl duration-200 mb-0 ${
              !open && "scale-0"
            }`}
          >
            Bus Ledger
          </h3>
        </div>
        <ul className="pt-6 flex flex-col justify-between h-11/12">
          <div>
            {Menus.map((Menu, index) => (
              <li
                key={index}
                className={`flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 
                  ${Menu.gap ? "mt-9" : "mt-2"} ${
                  index === 0 && "bg-light-white"
                } `}
                onClick={Menu.onClick} // Añadimos el evento onClick si existe
              >
                <img src={`./src/assets/${Menu.src}.png`} className="w-6 h-6" />
                <span className={`${!open && "hidden"} origin-left duration-200`}>
                  {Menu.title}
                </span>
              </li>
            ))}
          </div>
          <div>
            <li
              onClick={toggleTheme}
              className="flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 mt-2"
            >
              <img src={`./src/assets/theme-switch.png`} className="w-6 h-6" />
              <span className={`${!open && "hidden"} origin-left duration-200`}>
                Cambiar Tema
              </span>
            </li>
            <li
              onClick={cerrarSesion}
              className="flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 mt-2"
            >
              <img src={`./src/assets/logout.png`} className="w-6 h-6" />
              <span className={`${!open && "hidden"} origin-left duration-200`}>
                Cerrar Sesion
              </span>
            </li>
          </div>
        </ul>
      </div>

      {/* Offcanvas for mobile */}
      <div className="md:hidden">
        <button
          onClick={() => setOffcanvasOpen(true)}
          className="p-2 bg-dark-purple text-white"
        >
          Menu
        </button>
        {offcanvasOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="fixed inset-y-0 left-0 w-64 bg-dark-purple p-5 z-50">
              <button
                onClick={() => setOffcanvasOpen(false)}
                className="text-white"
              >
                Close
              </button>
              <div className="flex gap-x-4 items-center mt-4">
                <img
                  src="./src/assets/logo.png"
                  className="cursor-pointer duration-500"
                />
                <h3 className="text-white origin-left font-medium text-xl duration-200">
                  Bus Ledger
                </h3>
              </div>
              <ul className="pt-6 flex flex-col justify-between h-11/12">
                <div>
                  {Menus.map((Menu, index) => (
                    <li
                      key={index}
                      className={`flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 
                        ${Menu.gap ? "mt-9" : "mt-2"} ${
                        index === 0 && "bg-light-white"
                      } `}
                      onClick={Menu.onClick} // Añadimos el evento onClick si existe
                    >
                      <img src={`./src/assets/${Menu.src}.png`} className="w-6 h-6" />
                      <span className="origin-left duration-200">
                        {Menu.title}
                      </span>
                    </li>
                  ))}
                </div>
                <div>
                  <li
                    onClick={toggleTheme}
                    className="flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 mt-2"
                  >
                    <img src={`./src/assets/theme-switch.png`} className="w-6 h-6" />
                    <span className="origin-left duration-200">
                      Cambiar Tema
                    </span>
                  </li>
                  <li
                    onClick={cerrarSesion}
                    className="flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 mt-2"
                  >
                    <img src={`./src/assets/logout.png`} className="w-6 h-6" />
                    <span className="origin-left duration-200">
                      Cerrar Sesion
                    </span>
                  </li>
                </div>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="h-screen flex-1 p-7">
        <Outlet />
      </div>
    </div>
  );
};