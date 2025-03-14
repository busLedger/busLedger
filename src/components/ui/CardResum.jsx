import PropTypes from "prop-types";

export const CardResum = ({ title, description, theme }) => {
  const bgColor = theme ? "bg-gray-800 text-white" : "bg-white text-black border border-gray-300";

  return (
    <div className={`shadow-md rounded-lg p-4 ${bgColor}`}>
      <h2 className="text-sm ">{title}</h2>
      <p className="text-lg font-bold">{description}</p>
    </div>
  );
};

CardResum.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  theme: PropTypes.bool,
};

CardResum.defaultProps = {
  theme: false,
};
