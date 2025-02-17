/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../Modal.jsx";
import { Select } from "antd";
import Input from "../Input.jsx";
import { createBus } from "../../../api/buses.service.js";
import RegisterUserModal from "./RegisterUserModal.jsx";
import { RegisterMessage } from "../RegisterMessage.jsx";

const { Option } = Select;

const RegisterBusModal = ({ isOpen, onClose, onBusRegistered, theme, currentUser }) => {
  const [formData, setFormData] = useState({
    placa: "",
    modelo: "",
    año: "",
    id_dueño: currentUser.uid,
    id_conductor: "",
    nombre_ruta: "",
  });

  const [conductores, setConductores] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isRegisterUserModalOpen, setIsRegisterUserModalOpen] = useState(false);

  const { mostrarMensaje, contextHolder } = RegisterMessage();

  useEffect(() => {
    // Reset form when modal is closed
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Función para manejar el cambio en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setIsDirty(true);
  };

  // Función para manejar el cambio en la selección de conductor
  const handleConductorChange = (value) => {
    if (value === "self") {
      setFormData({ ...formData, id_conductor: currentUser.uid, conductor_nombre: currentUser.nombre });
    } else if (value === "new") {
      setIsRegisterUserModalOpen(true);
    } else {
      const selectedConductor = conductores.find(conductor => conductor.uid === value);
      setFormData({ ...formData, id_conductor: value, conductor_nombre: selectedConductor.nombre });
    }
    setIsDirty(true);
  };

  // Función para registrar un nuevo bus
  const handleRegisterBus = async () => {
    const { placa, modelo, año, id_dueño, id_conductor, nombre_ruta } = formData;

    // Validar que todos los campos estén llenos
    if (!placa || !modelo || !año || !id_dueño) {
      mostrarMensaje('error', 'Todos los campos deben estar llenos');
      return;
    }

    try {
      mostrarMensaje('loading', 'Registrando bus...');
      await createBus({ placa, modelo, año, id_dueño, id_conductor, nombre_ruta });
      mostrarMensaje('success', 'Bus registrado correctamente');
      resetForm();
      onClose();
      onBusRegistered();
    } catch (error) {
      mostrarMensaje('error', `Error al registrar el bus: ${error.message}`);
    }
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      placa: "",
      modelo: "",
      año: "",
      id_dueño: currentUser.uid,
      id_conductor: "",
      nombre_ruta: "",
      conductor_nombre: "",
    });
    setIsDirty(false);
  };

  // Función para manejar el registro de un nuevo conductor
  const handleUserRegistered = () => {
    const conductorData = JSON.parse(localStorage.getItem("conductorData"));
    setConductores([...conductores, conductorData]);
    setFormData({ ...formData, id_conductor: conductorData.uid, conductor_nombre: conductorData.nombre });
    setIsRegisterUserModalOpen(false);
  };

  return (
    <>
      {contextHolder}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Registrar Nuevo Bus"
        onAccept={handleRegisterBus}
        acceptText="Registrar"
        hasUnsavedChanges={isDirty}
      >
        <div className="space-y-4">
          <Input
            theme={theme}
            label="Placa"
            type="text"
            name="placa"
            value={formData.placa}
            onChange={handleInputChange}
            placeholder="Ingrese la placa"
          />
          <Input
            theme={theme}
            label="Modelo"
            type="text"
            name="modelo"
            value={formData.modelo}
            onChange={handleInputChange}
            placeholder="Ingrese el modelo"
          />
          <Input
            theme={theme}
            label="Año"
            type="number"
            name="año"
            value={formData.año}
            onChange={handleInputChange}
            placeholder="Ingrese el año"
          />
          <Input
            theme={theme}
            label="Nombre de la Ruta"
            type="text"
            name="nombre_ruta"
            value={formData.nombre_ruta}
            onChange={handleInputChange}
            placeholder="Ingrese el nombre de la ruta"
          />
          <div>
            <label className="block text-sm font-bold mb-2">Conductor</label>
            <Select
              style={{ width: '100%' }}
              placeholder="Seleccione un conductor"
              value={formData.id_conductor}
              onChange={handleConductorChange}
            >
              <Option value="">Ninguno</Option>
              <Option value="self">Asignarme como conductor</Option>
              <Option value="new">Registrar nuevo conductor</Option>
              {conductores.map((conductor) => (
                <Option key={conductor.uid} value={conductor.uid}>
                  {conductor.nombre}
                </Option>
              ))}
            </Select>
            {formData.id_conductor && (
              <Input
                theme={theme}
                label="Nombre del Conductor"
                type="text"
                value={formData.conductor_nombre}
                disabled
              />
            )}
          </div>
        </div>
      </Modal>
      <RegisterUserModal
        isOpen={isRegisterUserModalOpen}
        onClose={() => setIsRegisterUserModalOpen(false)}
        onUserRegistered={handleUserRegistered}
        theme={theme}
        isOwner={true}
      />
    </>
  );
};

RegisterBusModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onBusRegistered: PropTypes.func.isRequired,
  theme: PropTypes.bool.isRequired,
  currentUser: PropTypes.object.isRequired,
};

export default RegisterBusModal;