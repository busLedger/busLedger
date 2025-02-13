import PropTypes from "prop-types";

const SelectList = ({ options, onChange, placeholder, className, disabled }) => {
  return (
    <select
      onChange={onChange}
      disabled={disabled}
      className={`bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-500 transition-all 
        focus:outline-none focus:ring-2 focus:ring-indigo-500
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
    >
      <option value="" disabled selected className="text-white">
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value} className="text-white">
          {option.label}
        </option>
      ))}
    </select>
  );
};

SelectList.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

SelectList.defaultProps = {
  onChange: () => {},
  placeholder: "Seleccione una opción",
  className: "",
  disabled: false,
};

export default SelectList;