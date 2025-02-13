import { useState, useEffect } from "react";
import { Modal as AntdModal, ConfigProvider, theme } from "antd";
import PropTypes from "prop-types";
import Button from "./Button";

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  showCancel = true,
  showAccept = true,
  onCancel,
  onAccept,
  cancelText = "Cancelar",
  acceptText = "Aceptar",
  size = "default",
}) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("darkMode");
    setDarkMode(storedTheme === "true");
  }, [isOpen]); 

  const sizeMap = {
    small: 320,
    default: 420,
    large: 600,
    "extra-large": 800,
    full: "100%",
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <AntdModal
        title={
          <div className="flex justify-between items-center w-full">
            <span>{title}</span>
            <span
              onClick={onClose}
              className="text-red-500 hover:text-red-700 cursor-pointer text-xl font-bold"
            >
            </span>
          </div>
        }
        open={isOpen}
        onCancel={onClose}
        footer={null} 
        width={sizeMap[size] || sizeMap.default}
      >
        {children}
        <div className="flex justify-end gap-4 mt-4">
          {showCancel && (
            <Button onClick={onCancel || onClose} text={cancelText} type="button" />
          )}
          {showAccept && (
            <Button onClick={onAccept || onClose} text={acceptText} type="button" />
          )}
        </div>
      </AntdModal>
    </ConfigProvider>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  showCancel: PropTypes.bool,
  showAccept: PropTypes.bool,
  onCancel: PropTypes.func,
  onAccept: PropTypes.func,
  cancelText: PropTypes.string,
  acceptText: PropTypes.string,
  size: PropTypes.oneOf(["small", "default", "large", "extra-large", "full"]),
  type: PropTypes.oneOf(["default", "warning", "error", "success"]),
};
