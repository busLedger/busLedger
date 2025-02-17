import { useState, useEffect } from "react";
import { Modal as AntdModal, ConfigProvider, Popconfirm, theme } from "antd";
import PropTypes from "prop-types";
import Button from "./Button";

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  showCancel = false,
  showAccept = true,
  onAccept,
  cancelText = "Cancelar",
  acceptText = "Aceptar",
  size = "default",
  hasUnsavedChanges = false,
}) => {
  const [darkMode, setDarkMode] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

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

  const handleRequestClose = () => {
    if (hasUnsavedChanges) {
      setConfirmVisible(true);
    } else {
      handleClose();
    }
  };

  const handleClose = async () => {
    await setConfirmVisible(false);
    onClose();
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
            <Popconfirm
              title="¿Seguro que quieres cerrar?"
              description="Perderás todos los datos ingresados en el formulario."
              open={confirmVisible}
              onConfirm={handleClose}
              onCancel={() => setConfirmVisible(false)}
              okText="Sí, cerrar"
              cancelText="Cancelar"
            >
              <span
                onClick={handleRequestClose}
                
              >
              </span>
            </Popconfirm>
          </div>
        }
        open={isOpen}
        onCancel={handleRequestClose}
        footer={null}
        width={sizeMap[size] || sizeMap.default}
        maskClosable={!hasUnsavedChanges}
      >
        {children}
        <div className="flex justify-end gap-4 mt-4">
          {showCancel && (
            <Button onClick={handleRequestClose} text={cancelText} type="button" />
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
  hasUnsavedChanges: PropTypes.bool,
};

export default Modal;