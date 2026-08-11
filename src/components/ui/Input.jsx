import PropTypes from "prop-types";
import { Input as AntdInput } from "antd";

const splitInputClasses = (className = "") => {
  const classes = className.split(/\s+/).filter(Boolean);
  const inputClasses = classes.filter((item) => /^(pl|pr|px|py|p)-/.test(item));
  const containerClasses = classes.filter((item) => !/^(pl|pr|px|py|p)-/.test(item));

  return {
    containerClassName: containerClasses.join(" "),
    inputClassName: inputClasses.join(" "),
  };
};

const Input = ({ label, type, name, value, onChange, placeholder, theme, className, disabled }) => {
  const { containerClassName, inputClassName } = splitInputClasses(className);

  return (
    <div className={`${containerClassName} h-fit`}>
      {label && (
        <label className={`mb-2 block text-sm font-semibold ${theme ? "text-gray-100" : "text-gray-800"}`}>
          {label}
        </label>
      )}
      <AntdInput
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`h-10 rounded-lg border-gray-200 px-3 shadow-sm transition-all placeholder:!text-gray-400 hover:border-indigo-300 focus:border-indigo-500 focus:shadow-indigo-100 ${inputClassName} ${theme ? "border-white/10 !bg-gray-900 !text-white" : "!bg-white !text-gray-900"}`}
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
