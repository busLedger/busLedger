import { useState } from "react";
import PropTypes from "prop-types";
import Button from "../../components/ui/Button";
import RegisterGastoModal from "../../components/ui/Modales/RegisterGastoModal";
import RegisterIngresoModal from "../../components/ui/Modales/RegisterIngresoModal";

export const Ingresos_Gastos = ({ busId, userId, onRegistered }) => {
  const [isRegisterGastoModalOpen, setIsRegisterGastoModalOpen] = useState(false);
  const [isRegisterIngresoModalOpen, setIsRegisterIngresoModalOpen] = useState(false);

  const onClose = () => {
    setIsRegisterGastoModalOpen(false);
    setIsRegisterIngresoModalOpen(false);
    onRegistered();
  }

  return (
    <>
      <div className="w-full flex justify-center gap-4">
        <Button text={"Registrar Gasto"} onClick={() => setIsRegisterGastoModalOpen(true)} />
        <Button text={"Registrar Ingreso"} onClick={() => setIsRegisterIngresoModalOpen(true)} />
      </div>
      <RegisterGastoModal
        isOpen={isRegisterGastoModalOpen}
        onClose={() => setIsRegisterGastoModalOpen(false)}
        onGastoRegistered={onClose}
        theme={true} // Puedes ajustar el tema según sea necesario
        currentUser={userId} // Reemplaza con el usuario actual
        busId={busId}
      />
      <RegisterIngresoModal
        isOpen={isRegisterIngresoModalOpen}
        onClose={() => setIsRegisterIngresoModalOpen(false)}
        onIngresoRegistered={() => setIsRegisterIngresoModalOpen(false)}
        theme={true} // Puedes ajustar el tema según sea necesario
        currentUser={userId} // Reemplaza con el usuario actual
        busId={busId}
      />
    </>
  );
};

Ingresos_Gastos.propTypes = {
  busId: PropTypes.string,
  userId: PropTypes.string.isRequired,
  onRegistered: PropTypes.func.isRequired
};