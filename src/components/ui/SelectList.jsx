import PropTypes from "prop-types";

const SelectList = ({ options, onChange, placeholder, className, disabled, value }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`
        w-full bg-indigo-600 text-white 
        py-2.5 px-4 
        rounded-lg 
        text-sm md:text-base
        font-medium
        hover:bg-indigo-500 
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        transition-all duration-200
        appearance-none
        cursor-pointer
        ${disabled ? "opacity-50 cursor-not-allowed" : ""} 
        ${className}
      `}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: "right 0.5rem center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "1.5em 1.5em",
        paddingRight: "2.5rem",
        color: "white", // ← Fuerza el texto blanco siempre
      }}
    >
      <option value="" disabled className="!bg-white !text-gray-900">
        {placeholder}
      </option>
      {options.map((option) => (
        <option 
          key={option.value} 
          value={option.value} 
          className="!bg-white !text-gray-900 py-2"
        >
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
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

SelectList.defaultProps = {
  onChange: () => {},
  placeholder: "Seleccione una opción",
  className: "",
  disabled: false,
  value: "",
};

export default SelectList;