import PropTypes from "prop-types";

export const Card = ({ children, className }) => {
  return <div className={`bg-white shadow-md rounded-lg p-4 ${className}`}>{children}</div>;
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Card.defaultProps = {
  className: "",
};

export const CardHeader = ({ children }) => {
  return <div className="border-b pb-2 mb-2">{children}</div>;
};

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
};

export const CardTitle = ({ children }) => {
  return <h2 className="text-lg font-bold">{children}</h2>;
};

CardTitle.propTypes = {
  children: PropTypes.node.isRequired,
};

export const CardDescription = ({ children }) => {
  return <p className="text-gray-600">{children}</p>;
};

CardDescription.propTypes = {
  children: PropTypes.node.isRequired,
};

export const CardContent = ({ children }) => {
  return <div className="mt-2">{children}</div>;
};

CardContent.propTypes = {
  children: PropTypes.node.isRequired,
};
