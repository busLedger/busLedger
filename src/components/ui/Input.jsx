import PropTypes from "prop-types";
const Input = ({ label, type, name, value, onChange, placeholder, theme }) => {


  return (
    <div className="mb-4">
      <label className={`block text-sm font-bold mb-2 ${theme ? "text-white" : "text-black"}`}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 
          ${theme ? "bg-black text-white border border-white" : "bg-white text-black border border-gray-300"}`}
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
  theme: PropTypes.bool,
};

Input.defaultProps = {
  type: "text",
  placeholder: "",
};

export default Input;