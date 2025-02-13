import { useState } from "react";
import PropTypes from "prop-types";
import { EditOutlined, EllipsisOutlined, SettingOutlined } from "@ant-design/icons";

export const Card = ({ children, className, actions, avatar, theme }) => {
  const bgColor = theme ? "bg-gray-800 text-white" : "bg-white text-black border border-gray-300";

  return (
    <div className={`shadow-md rounded-lg p-4 ${bgColor} ${className}`}>
      {avatar && <div className="flex justify-center mb-2">{avatar}</div>}
      {children}
      {actions && <div className="border-t mt-2 pt-2 flex justify-end">{actions}</div>}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  actions: PropTypes.node,
  avatar: PropTypes.node,
  theme: PropTypes.bool,
};

Card.defaultProps = {
  className: "",
  actions: null,
  avatar: null,
  theme: false,
};

// 🟢 Componente de Header
export const CardHeader = ({ children }) => {
  return <div className="border-b pb-2 mb-2">{children}</div>;
};

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
};

// 🟢 Componente de Título
export const CardTitle = ({ children }) => {
  return <h2 className="text-lg font-bold">{children}</h2>;
};

CardTitle.propTypes = {
  children: PropTypes.node.isRequired,
};

// 🟢 Componente de Descripción
export const CardDescription = ({ children }) => {
  return <p className="text-sm text-gray-500">{children}</p>;
};

CardDescription.propTypes = {
  children: PropTypes.node.isRequired,
};

// 🟢 Componente de Contenido con lista sin hover
export const CardContent = ({ items, theme }) => {
  return (
    <ul className="mt-2 list-disc pl-5 text-sm text-white">
      {items.map((item, index) => (
        <li key={index} className={`pointer-events-none ${theme ? "text-white" : "text-black"}`}>
          {item}
        </li>
      ))}
    </ul>
  );
};

CardContent.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  theme: PropTypes.bool.isRequired,
};

// 🟢 Componente Principal con cambio de tema y avatar dinámico
const CardUsers = () => {
  const actions = [
    <EditOutlined key="edit" className="text-gray-400 hover:text-black dark:hover:text-white cursor-pointer" />,
    <SettingOutlined key="setting" className="text-gray-400 hover:text-black dark:hover:text-white cursor-pointer" />,
    <EllipsisOutlined key="ellipsis" className="text-gray-400 hover:text-black dark:hover:text-white cursor-pointer" />,
  ];

  const [theme, setTheme] = useState(localStorage.getItem("darkMode") === "true");

  const toggleTheme = () => {
    const newTheme = !theme;
    setTheme(newTheme);
    localStorage.setItem("darkMode", newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
  };

  return (
    <div className={`p-4 flex flex-col gap-4 min-h-screen ${theme ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <button onClick={toggleTheme} className="px-4 py-2 bg-blue-500 text-white rounded">
        Cambiar Tema
      </button>

      <Card
        actions={actions}
        avatar={<img src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" alt="Avatar 1" className="w-16 h-16 rounded-full" />}
        theme={theme}
      >
        <CardHeader>
          <CardTitle>Card con Avatar</CardTitle>
        </CardHeader>
        <CardContent items={["Elemento 1", "Elemento 2", "Elemento 3"]} theme={theme} />
      </Card>

      <Card
        actions={actions}
        avatar={<img src="https://api.dicebear.com/7.x/miniavs/svg?seed=2" alt="Avatar 2" className="w-16 h-16 rounded-full" />}
        theme={theme}
      >
        <CardHeader>
          <CardTitle>Otra Card</CardTitle>
        </CardHeader>
        <CardContent items={["Opción A", "Opción B", "Opción C"]} theme={theme} />
      </Card>
    </div>
  );
};

export default CardUsers;