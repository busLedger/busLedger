/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../Modal.jsx";
import { Select, DatePicker } from "antd";
import Input from "../Input.jsx";
import { createIngreso } from "../../../api/ingresos.service.js";
import { getBusesByUser } from "../../../api/buses.service.js";
import { RegisterMessage } from "../RegisterMessage.jsx";

const { Option } = Select;

const RegisterIngresoModal = ({ isOpen, onClose, onIngresoRegistered, theme, currentUser, busId }) => {
  const [formData, setFormData] = useState({
    descripcion_ingreso: "",
    total_ingreso: "",
    fecha: null,
    id_bus: busId || "",
  });

  const [buses, setBuses] = useState([]);
  const [isDirty, setIsDirty] = useState(false);

  const { mostrarMensaje, contextHolder } = RegisterMessage();

  useEffect(() => {
    if (!busId) {
      obtenerBuses();
    }
  }, [busId]);

  useEffect(() => {
    // Reset form when modal is closed
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const obtenerBuses = async () => {
    try {
      const busesData = await getBusesByUser(currentUser.uid);
      setBuses(busesData);
    } catch (error) {
      mostrarMensaje("error", `Error al obtener los buses: ${error.message}`);
    }
  };

  // Función para manejar el cambio en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setIsDirty(true);
  };

  // Función para manejar el cambio en la selección de bus
  const handleBusChange = (value) => {
    setFormData({ ...formData, id_bus: value });
    setIsDirty(true);
  };

  // Función para manejar el cambio en la fecha
  const handleDateChange = (date) => {
    setFormData({ ...formData, fecha: date });
    setIsDirty(true);
  };

  // Función para registrar un nuevo ingreso
  const handleRegisterIngreso = async () => {
    const { descripcion_ingreso, total_ingreso, fecha, id_bus } = formData;

    // Validar que todos los campos estén llenos
    if (!descripcion_ingreso || !total_ingreso || !fecha || !id_bus) {
      mostrarMensaje('error', 'Todos los campos deben estar llenos');
      return;
    }

    try {
      mostrarMensaje('loading', 'Registrando ingreso...');
      await createIngreso({ descripcion_ingreso, total_ingreso, fecha: fecha.format("YYYY-MM-DD"), id_bus });
      mostrarMensaje('success', 'Ingreso registrado correctamente');
      resetForm();
      onClose();
      onIngresoRegistered();
    } catch (error) {
      mostrarMensaje('error', `Error al registrar el ingreso: ${error.message}`);
    }
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      descripcion_ingreso: "",
      total_ingreso: "",
      fecha: null,
      id_bus: busId || "",
    });
    setIsDirty(false);
  };

  return (
    <>
      {contextHolder}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Registrar Nuevo Ingreso"
        onAccept={handleRegisterIngreso}
        acceptText="Registrar"
        hasUnsavedChanges={isDirty}
      >
        <div className="space-y-4 mt-4">
          {!busId && (
            <div>
              <label className="block text-sm font-bold mb-2">Bus</label>
              <Select
                style={{ width: '100%' }}
                placeholder="Seleccione un bus"
                value={formData.id_bus}
                onChange={handleBusChange}
              >
                {buses.map((bus) => (
                  <Option key={bus.id} value={bus.id}>
                    {bus.nombre_ruta}
                  </Option>
                ))}
              </Select>
            </div>
          )}
          <Input
            theme={theme}
            label="Descripción del Ingreso"
            type="text"
            name="descripcion_ingreso"
            value={formData.descripcion_ingreso}
            onChange={handleInputChange}
            placeholder="Ingrese la descripción del ingreso"
          />
          <Input
            theme={theme}
            label="Total del Ingreso"
            type="number"
            name="total_ingreso"
            value={formData.total_ingreso}
            onChange={handleInputChange}
            placeholder="Ingrese el total del ingreso"
          />
          <div>
            <label className="block text-sm font-bold mb-2">Fecha</label>
            <DatePicker
              style={{ width: '100%' }}
              value={formData.fecha}
              onChange={handleDateChange}
              placeholder="Seleccione la fecha del ingreso"
              format="YYYY-MM-DD"
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

RegisterIngresoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onIngresoRegistered: PropTypes.func.isRequired,
  theme: PropTypes.bool.isRequired,
  currentUser: PropTypes.object.isRequired,
  busId: PropTypes.string,
};

export default RegisterIngresoModal;