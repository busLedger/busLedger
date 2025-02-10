import PropTypes from "prop-types";
const Input = ({ label, type, name, value, onChange, placeholder }) => {
    return (
        <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
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
