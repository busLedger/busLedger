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
  hasUnsavedChanges = false, // Nueva prop para detectar cambios en el formulario
}) => {
  const [darkMode, setDarkMode] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false); // Estado para el Popconfirm

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

  // Función para gestionar el cierre con confirmación si hay cambios
  const handleRequestClose = () => {
    if (hasUnsavedChanges) {
      setConfirmVisible(true);
    } else {
      handleClose();
    }
  };

  // Confirmación de cierre
  const handleClose = () => {
    setConfirmVisible(false);
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
            <span
              onClick={handleRequestClose}
              className="text-red-500 hover:text-red-700 cursor-pointer text-xl font-bold"
            ></span>
          </div>
        }
        open={isOpen}
        onCancel={handleRequestClose} // Ahora usa la función con confirmación
        footer={null}
        width={sizeMap[size] || sizeMap.default}
        maskClosable={!hasUnsavedChanges} // Evita cerrar al hacer clic afuera si hay cambios
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

        {/* Popconfirm para confirmar cierre si hay cambios */}
        <Popconfirm
          title="¿Seguro que quieres cerrar?"
          description="Perderás todos los datos ingresados en el formulario."
          visible={confirmVisible}
          onConfirm={handleClose}
          onCancel={() => setConfirmVisible(false)}
          okText="Sí, cerrar"
          cancelText="Cancelar"
        />
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
  hasUnsavedChanges: PropTypes.bool, // Nueva prop para detectar si hay cambios
};

export default Modal;
