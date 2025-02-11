/* eslint-disable react/prop-types */

export const Offcanvas = ({ isOpen, onClose, Menus, toggleTheme, cerrarSesion }) => {
    return (
      <div
        className={`fixed inset-0 bg-dark-purple z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="fixed inset-y-0 left-0 w-3/4 md:w-64 bg-dark-purple p-5 z-50 shadow-lg">
          <div className="flex gap-x-4 items-center mb-4">
            {/* Logo ahora actúa como botón para cerrar el Offcanvas */}
            <img
              src="./src/assets/logo.png"
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
                  onClick={Menu.onClick} // Añadimos el evento onClick si existe
                >
                  <img src={`./src/assets/${Menu.src}.png`} className="w-6 h-6" />
                  <span className="origin-left duration-200">{Menu.title}</span>
                </li>
              ))}
            </div>
  
            <div>
              <li
                onClick={toggleTheme}
                className="flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 mt-2"
              >
                <img src={`./src/assets/theme-switch.png`} className="w-6 h-6" />
                <span className="origin-left duration-200">Cambiar Tema</span>
              </li>
              <li
                onClick={cerrarSesion}
                className="flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 mt-2"
              >
                <img src={`./src/assets/logout.png`} className="w-6 h-6" />
                <span className="origin-left duration-200">Cerrar Sesión</span>
              </li>
            </div>
          </ul>
        </div>
      </div>
    );
  };
  