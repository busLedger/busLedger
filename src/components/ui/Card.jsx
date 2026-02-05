import PropTypes from "prop-types";

export const Card = ({ children, className }) => {
  return (
    <div 
      className={`
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
        shadow-sm hover:shadow-md
        rounded-lg 
        transition-shadow duration-200
        ${className}
      `}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Card.defaultProps = {
  className: "",
};

export const CardHeader = ({ children, className }) => {
  return (
    <div 
      className={`
        border-b border-gray-200 dark:border-gray-800
        px-4 py-3
        ${className}
      `}
    >
      {children}
    </div>
  );
};

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardHeader.defaultProps = {
  className: "",
};

export const CardTitle = ({ children, className }) => {
  return (
    <h2 
      className={`
        text-base md:text-lg 
        font-semibold 
        text-gray-900 dark:text-gray-100
        tracking-tight
        ${className}
      `}
    >
      {children}
    </h2>
  );
};

CardTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardTitle.defaultProps = {
  className: "",
};

export const CardDescription = ({ children, className }) => {
  return (
    <p 
      className={`
        text-xs md:text-sm 
        text-gray-600 dark:text-gray-400
        mt-1
        ${className}
      `}
    >
      {children}
    </p>
  );
};

CardDescription.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardDescription.defaultProps = {
  className: "",
};

export const CardContent = ({ children, className }) => {
  return (
    <div 
      className={`
        px-4 py-3
        ${className}
      `}
    >
      {children}
    </div>
  );
};

CardContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardContent.defaultProps = {
  className: "",
};