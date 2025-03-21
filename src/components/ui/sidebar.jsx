/* eslint-disable react/prop-types */
import imgLogOut from "../../assets/logout.png";
import imgSwhitch from "../../assets/theme-switch.png";
import Logo from "../../assets/logo.png";

import { useNavigate } from "react-router-dom";
export const Sidebar = ({ isOpen, Menus, toggleTheme, cerrarSesion, onToggle }) => {
  const navigate = useNavigate();
  const redirigir = (ruta) => {
    navigate(ruta);
  }
  return (
    <div
      className={`${
        isOpen ? "w-75" : "w-25"
      } bg-dark-purple h-screen p-5 pt-8 relative duration-300 shadow-lg hidden md:block`}
    >
      <div className="flex gap-x-4 items-center">
        <img
          src={Logo}
          onClick={onToggle}
          className={`cursor-pointer duration-500 ${isOpen && "rotate-[360deg]"}`}
        />
        <h3
          className={`text-white origin-left font-medium text-xl duration-200 mb-0 ${
            !isOpen && "scale-0"
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
                ${Menu.gap ? "mt-9" : "mt-2"} ${index === 0 && "bg-light-white"} `}
              onClick={()=>redirigir(Menu.ruta)} 
            >
              <img src={Menu.src} className="w-6 h-6" />
              <span className={`${!isOpen && "hidden"} origin-left duration-200`}>
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
            <img src={imgSwhitch} className="w-6 h-6" />
            <span className={`${!isOpen && "hidden"} origin-left duration-200`}>
              Cambiar Tema
            </span>
          </li>
          <li
            onClick={cerrarSesion}
            className="flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 mt-2"
          >
            <img src={imgLogOut} className="w-6 h-6" />
            <span className={`${!isOpen && "hidden"} origin-left duration-200`}>
              Cerrar Sesion
            </span>
          </li>
        </div>
      </ul>
    </div>
  );
};