import PropTypes from "prop-types";

export const Card = ({ children, className, actions, avatar, theme }) => {
  const bgColor = theme 
    ? "bg-gray-900/95 text-white border border-white/10 shadow-black/20" 
    : "bg-white/95 text-gray-900 border border-gray-200/80 shadow-gray-200/70";

  return (
    <div className={`
      cursor-pointer 
      shadow-sm hover:shadow-md 
      rounded-lg 
      overflow-hidden
      transition-all duration-200 hover:-translate-y-0.5
      ${bgColor} 
      ${className}
    `}>
      {avatar && (
        <div className={`
          flex justify-center p-4 border-b
          ${theme ? "border-white/10 bg-gray-950/20" : "border-gray-100 bg-gray-50/70"}
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
          ${theme ? "border-white/10 bg-gray-950/30" : "border-gray-100 bg-gray-50/80"}
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
  return <div className="mb-3 border-b border-gray-100 pb-3 dark:border-white/10">{children}</div>;
};

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
};

// 🟢 Componente de Título
export const CardTitle = ({ children }) => {
  return <h2 className="mb-0 text-base font-semibold leading-tight tracking-tight md:text-lg">{children}</h2>;
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
    <ul className="mt-3 space-y-2 text-sm">
      {items.map((item, index) => (
        <li 
          key={index} 
          className={`
            pointer-events-none 
            flex items-start gap-2 leading-relaxed
            ${theme ? "text-gray-200" : "text-gray-700"}
          `}
        >
          <span className={`
            mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full
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
