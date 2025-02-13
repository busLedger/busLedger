import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const Input = ({ label, type, name, value, onChange, placeholder }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("darkMode");
    setDarkMode(storedTheme === "true");
  }, []);

  return (
    <div className="mb-4">
      <label className={`block text-sm font-bold mb-2 ${darkMode ? "text-white" : "text-black"}`}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 
          ${darkMode ? "bg-gray-800 text-white border border-white" : "bg-white text-black border border-gray-300"}`}
      />
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

Input.defaultProps = {
  type: "text",
  placeholder: "",
};

export default Input;