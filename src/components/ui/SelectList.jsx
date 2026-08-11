import PropTypes from "prop-types";

const SelectList = ({ options, onChange, placeholder, className, disabled, value }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`
        w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5
        text-sm font-medium text-gray-900 shadow-sm transition-all duration-200
        hover:border-indigo-300
        focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40
        dark:border-white/10 dark:bg-gray-900 dark:text-gray-100
        ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
        ${className}
      `}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%234338ca' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.8' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: "right 0.5rem center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "1.5em 1.5em",
        paddingRight: "2.5rem",
      }}
    >
      <option value="" disabled className="bg-white text-gray-900">
        {placeholder}
      </option>
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="bg-white py-2 text-gray-900"
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
  placeholder: "Seleccione una opcion",
  className: "",
  disabled: false,
  value: "",
};

export default SelectList;
