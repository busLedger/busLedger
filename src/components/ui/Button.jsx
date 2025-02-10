import PropTypes from "prop-types";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

const Button = ({ text, onClick, type, className, loading }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-500 transition-all 
        ${loading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {loading ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: "white" }} spin />} /> : text}
    </button>
  );
};

Button.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.string,
  className: PropTypes.string,
  loading: PropTypes.bool,
};

Button.defaultProps = {
  onClick: () => {},
  type: "button",
  className: "",
  loading: false,
};

export default Button;
