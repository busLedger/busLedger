import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import Button from "./Button";
const Modal = ({isOpen,onClose,title,children,showCancel = true,showAccept = true,onCancel,onAccept,cancelText = "Cancelar",acceptText = "Aceptar",size = "default",type = "default",}) => {
    const [isBrowser, setIsBrowser] = useState(false);
    useEffect(() => {setIsBrowser(true);}, []);
    const handleClose = () => onClose();
    const handleCancel = () => {
        if (onCancel) onCancel();
        handleClose();
    };
    const handleAccept = () => {
        if (onAccept) onAccept();
        handleClose();
    };
    // Clases de estilos según el tipo de modal
    const modalStyles = {
        default: "border-l-4 border-indigo-500",
        warning: "border-l-4 border-yellow-500",
        error: "border-l-4 border-red-500",
        success: "border-l-4 border-green-500",
    };
    // tamaños de la modal
    const sizeClasses = { small: "w-[300px]", default: "w-[400px]", large: "w-[600px]", "extra-large": "w-[800px]", full: "w-full",};
    const modalContent = (
        <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50" onClick={handleClose}>
            <div
                className={`bg-white dark:bg-neutral-800 shadow-xl p-6 rounded-lg max-w-full max-h-[80vh] overflow-y-auto ${
                    sizeClasses[size] || sizeClasses.default
                } ${modalStyles[type]}`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Icono de cerrar X */}
                <div className="flex justify-between items-center mb-4">
                    <h2 id="modal-title" className="text-lg font-semibold">{title}</h2>
                    <span onClick={handleClose} className="text-xl text-gray-500 hover:text-gray-700 cursor-pointer" aria-label="Cerrar">&times;</span>
                </div>
                {/* Contenido de la modal */}
                <div className="mb-4">{children}</div> 
                {/* Footer de la modal */}
                <div className="flex justify-end gap-4">
                    {showCancel && (
                        <Button onClick={handleCancel} text={cancelText} type="button"/>
                    )}
                    {showAccept && (
                        <Button onClick={handleAccept} text={acceptText} type="button"/>
                    )}
                </div>
            </div>
        </div>
    );
    if (isBrowser) {
        return isOpen ? createPortal(modalContent, document.body) : null;
    } else {
        return null;
    }
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
export default Modal;