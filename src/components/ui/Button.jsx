import PropTypes from "prop-types";
const Button = ({ text, onClick, type = "button", className }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-500 transition-all ${className}`}
        >
            {text}
        </button>
    );
    };
    Button.propTypes = {
        text: PropTypes.string.isRequired,
        onClick: PropTypes.func,
        type: PropTypes.string,
        className: PropTypes.string,
    };
    Button.defaultProps = {
        onClick: () => {},
        type: "button",
        className: "",
    };
export default Button;