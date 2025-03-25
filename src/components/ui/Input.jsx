import PropTypes from "prop-types";
import { Input as AntdInput } from "antd";

const Input = ({ label, type, name, value, onChange, placeholder, theme, className, disabled }) => {
  return (
    <div className={className + " h-fit-content"}>
      {label && (
        <label className={`block text-sm font-bold mb-2 ${theme ? "text-white" : "text-black"}`}>
          {label}
        </label>
      )}
      <AntdInput
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
       className={`${theme ? "text-white" : "text-black"}`}
        disabled={disabled}
      />
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  theme: PropTypes.bool,
  className: PropTypes.string,
  disabled: PropTypes.bool
};

Input.defaultProps = {
  type: "text",
  placeholder: "",
};

export default Input;