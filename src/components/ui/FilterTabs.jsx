import { useState } from "react";
import PropTypes from "prop-types";

const FilterTabs = ({ options, onSelect, theme }) => {
  const [active, setActive] = useState(options[0]); // Primera opción activa por defecto

  const handleSelect = (option) => {
    setActive(option);
    onSelect(option); // Devuelve la selección al componente padre
  };

  return (
    <div id="div-filter-tabs" className="flex gap-2 overflow-x-auto whitespace-nowrap rounded-lg border border-gray-200 bg-white/70 p-1.5 shadow-sm dark:border-white/10 dark:bg-gray-900/70">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => handleSelect(option)}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition-all duration-200 
            ${active === option ? "bg-indigo-600 !text-white shadow-sm shadow-indigo-600/20" : theme ? "text-gray-300 hover:bg-gray-800 hover:text-white" : "btn-text-black text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

FilterTabs.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelect: PropTypes.func.isRequired,
  theme: PropTypes.bool,
};

export default FilterTabs;
