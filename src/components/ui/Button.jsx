import PropTypes from "prop-types";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin, Popconfirm } from "antd";

const Button = ({
  text,
  onClick,
  type,
  className,
  loading,
  confirm, // Habilita o no el Popconfirm
  confirmTitle = "¿Estás seguro?",
  confirmDescription = "Esta acción no se puede deshacer.",
  confirmOkText = "Sí, continuar",
  confirmCancelText = "Cancelar",
  confirmPlacement = "topRight",
}) => {
  const handleConfirm = async () => {
    if (onClick) await onClick();
  };

  const buttonElement = (
      <button
            type={type}
            onClick={!confirm ? onClick : undefined} // Solo ejecuta si `confirm` es `false`
            disabled={loading}
            className={`bg-indigo-600 cursor-pointer text-white py-2 px-4 rounded-lg hover:bg-indigo-500 transition-all h-auto 
              ${loading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
          >
            {loading ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: "white" }} spin />} /> : text}
          </button>
    
  );

  return confirm ? (
    <Popconfirm
    className="bg-indigo-600 "
      title={confirmTitle}
      description={confirmDescription}
      onConfirm={handleConfirm} // Solo ejecuta la acción si el usuario confirma
      okText={confirmOkText}
      cancelText={confirmCancelText}
      placement={confirmPlacement}
    >
      {buttonElement}
    </Popconfirm>
  ) : (
    buttonElement
  );
};

Button.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.string,
  className: PropTypes.string,
  loading: PropTypes.bool,
  confirm: PropTypes.bool,
  confirmTitle: PropTypes.string,
  confirmDescription: PropTypes.string,
  confirmOkText: PropTypes.string,
  confirmCancelText: PropTypes.string,
  confirmPlacement: PropTypes.string,
};

Button.defaultProps = {
  onClick: () => {},
  type: "button",
  className: "",
  loading: false,
  confirm: false,
  confirmTitle: "¿Estás seguro?",
  confirmDescription: "Esta acción no se puede deshacer.",
  confirmOkText: "Sí, continuar",
  confirmCancelText: "Cancelar",
  confirmPlacement: "topRight",
};

export default Button;
