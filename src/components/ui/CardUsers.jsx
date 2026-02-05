import PropTypes from "prop-types";

export const Card = ({ children, className, actions, avatar, theme }) => {
  const bgColor = theme 
    ? "bg-gray-900 text-white border border-gray-800" 
    : "bg-white text-gray-900 border border-gray-200";

  return (
    <div className={`
      cursor-pointer 
      shadow-sm hover:shadow-lg 
      rounded-lg 
      overflow-hidden
      transition-all duration-200 
      ${bgColor} 
      ${className}
    `}>
      {avatar && (
        <div className={`
          flex justify-center p-4 border-b
          ${theme ? "border-gray-700" : "border-gray-200"}
        `}>
          {avatar}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
      {actions && (
        <div className={`
          border-t px-4 py-3 flex justify-end gap-2
          ${theme ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}
        `}>
          {actions}
        </div>
      )}
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
  return <div className="border-b pb-3 mb-3">{children}</div>;
};

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
};

// 🟢 Componente de Título
export const CardTitle = ({ children }) => {
  return <h2 className="text-base md:text-lg font-semibold leading-tight mb-0">{children}</h2>;
};

CardTitle.propTypes = {
  children: PropTypes.node.isRequired,
};

// 🟢 Componente de Descripción
export const CardDescription = ({ children }) => {
  return <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">{children}</p>;
};

CardDescription.propTypes = {
  children: PropTypes.node.isRequired,
};

// 🟢 Componente de Contenido con lista sin hover
export const CardContent = ({ items, theme }) => {
  return (
    <ul className="mt-3 space-y-1.5 text-sm">
      {items.map((item, index) => (
        <li 
          key={index} 
          className={`
            pointer-events-none 
            flex items-start gap-2
            ${theme ? "text-gray-200" : "text-gray-700"}
          `}
        >
          <span className={`
            mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full
            ${theme ? "bg-indigo-500" : "bg-indigo-600"}
          `} />
          <span className="flex-1">{item}</span>
        </li>
      ))}
    </ul>
  );
};

CardContent.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  theme: PropTypes.bool.isRequired,
};