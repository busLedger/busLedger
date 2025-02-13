import { useState } from "react";
import PropTypes from "prop-types";

const FilterTabs = ({ options, onSelect, theme }) => {
  const [active, setActive] = useState(options[0]); // Primera opción activa por defecto

  const handleSelect = (option) => {
    setActive(option);
    onSelect(option); // Devuelve la selección al componente padre
  };

  return (
    <div className="flex gap-2 p-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => handleSelect(option)}
          className={`px-4 py-2 rounded-full border transition-all duration-200 
            ${active === option ? "bg-indigo-600 text-white font-bold" : theme ? "border-gray-400 text-gray-400 hover:border-white hover:text-white" : "border-gray-400 text-black hover:border-black hover:text-black"}`}
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