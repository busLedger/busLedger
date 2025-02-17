import PropTypes from "prop-types";
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

