import { useState } from "react";

export const Home = () => {
  const [open, setOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  const Menus = [
    { title: "Dashboard", src: "Chart_fill" },
    { title: "Unidades", src: "Chat" },
    { title: "Alumnos", src: "User", gap: true },
    { title: "Pagos", src: "Calendar" },
    { title: "Calendario", src: "Search" },
    { title: "Analytics", src: "Chart" },
    { title: "Files ", src: "Folder", gap: true },
    { title: "Setting", src: "Setting" },
    { title: "Cambiar Tema", src: "Theme", gap: true, onClick: toggleTheme }, // Añadimos el botón de cambio de tema como un ítem del menú
  ];

  return (
    <div className={`flex ${darkMode ? "dark" : ""}`}>
      <div
        className={`${
          open ? "w-72" : "w-25"
        } bg-dark-purple h-screen p-5 pt-8 relative duration-300`}
      >
        <img
          src="./src/assets/control.png"
          className={`absolute cursor-pointer -right-3 top-9 w-7 border-dark-purple
             border-2 rounded-full  ${!open && "rotate-180"}`}
          onClick={() => setOpen(!open)}
        />
        <div className="flex gap-x-4 items-center">
          <img
            src="./src/assets/logo.png"
            className={`cursor-pointer duration-500 ${
              open && "rotate-[360deg]"
            }`}
          />
          <h3
            className={`text-white origin-left font-medium text-xl duration-200 ${
              !open && "scale-0"
            }`}
          >
            Bus Ledger
          </h3>
        </div>
        <ul className="pt-6">
          {Menus.map((Menu, index) => (
            <li
              key={index}
              className={`flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 
                ${Menu.gap ? "mt-9" : "mt-2"} ${
                index === 0 && "bg-light-white"
              } `}
              onClick={Menu.onClick} // Añadimos el evento onClick si existe
            >
              <img src={`./src/assets/${Menu.src}.png`} />
              <span className={`${!open && "hidden"} origin-left duration-200`}>
                {Menu.title}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="h-screen flex-1 p-7">
        <h1 className="text-2xl font-semibold ">Home Page</h1>
      </div>
    </div>
  );
};