/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import imgLogOut from "../../assets/logout.png";
import imgSwhitch from "../../assets/theme-switch.png";
import Logo from "../../assets/logo.png";

export const Offcanvas = ({ isOpen, onClose, Menus, toggleTheme, cerrarSesion, darkMode }) => {
  const navigate = useNavigate();

  const switchTheme = () => {
    onClose();
    toggleTheme();
  };

  const redirigir = (ruta) => {
    navigate(ruta);
    onClose();
  };

  return (
    <>
      {/* 🟢 Overlay con fondo transparente para cerrar el offcanvas */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-transparent z-40"
          onClick={onClose} // Cierra el offcanvas al hacer clic fuera
        ></div>
      )}

      <div
        className={`fixed inset-y-0 left-0 w-fit p-6 z-50 shadow-lg transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
      >
        <div className="flex gap-x-4 items-center mb-4">
          <img
            src={Logo}
            className="cursor-pointer duration-500 hover:scale-105"
            onClick={onClose}
          />
          <h3 className="text-white font-medium text-xl">Bus Ledger</h3>
        </div>

        <ul className="pt-6 flex flex-col justify-between h-11/12">
          <div>
            {Menus.map((Menu, index) => (
              <li
                key={index}
                className={`flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 
                    ${Menu.gap ? "mt-9" : "mt-2"} ${index === 0 && "bg-light-white"} `}
                onClick={() => redirigir(Menu.ruta)}
              >
                <img src={Menu.src} className="w-6 h-6" />
                <span className="origin-left duration-200">{Menu.title}</span>
              </li>
            ))}
          </div>

          <div>
            <li
              onClick={switchTheme}
              className="flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 mt-2"
            >
              <img src={imgSwhitch} className="w-6 h-6" />
              <span className="origin-left duration-200">Cambiar Tema</span>
            </li>
            <li
              onClick={cerrarSesion}
              className="flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 mt-2"
            >
              <img src={imgLogOut} className="w-6 h-6" />
              <span className="origin-left duration-200">Cerrar Sesión</span>
            </li>
          </div>
        </ul>
      </div>
    </>
  );
};
