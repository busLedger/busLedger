/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../Modal.jsx";
import { Select, DatePicker, Checkbox } from "antd";
import Input from "../Input.jsx";
import { createGasto } from "../../../api/gastos.service.js";
import { getBusesByUser } from "../../../api/buses.service.js";
import { RegisterMessage } from "../RegisterMessage.jsx";

const { Option } = Select;

const RegisterGastoModal = ({ isOpen, onClose, onGastoRegistered, theme, currentUser, busId }) => {
  const [formData, setFormData] = useState({
    descripcion_gasto: "",
    monto: "",
    fecha_gasto: null,
    id_bus: busId || "",
  });

  const [buses, setBuses] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isCombustible, setIsCombustible] = useState(false);

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
    setFormData({ ...formData, fecha_gasto: date });
    setIsDirty(true);
  };

  // Función para manejar el cambio en el checkbox de combustible
  const handleCombustibleChange = (e) => {
    const checked = e.target.checked;
    setIsCombustible(checked);
    if (checked) {
      setFormData({ ...formData, descripcion_gasto: "Combustible" });
    } else {
      setFormData({ ...formData, descripcion_gasto: "" });
    }
    setIsDirty(true);
  };

  // Función para registrar un nuevo gasto
  const handleRegisterGasto = async () => {
    const { descripcion_gasto, monto, fecha_gasto, id_bus } = formData;

    // Validar que todos los campos estén llenos
    if (!descripcion_gasto || !monto || !fecha_gasto || !id_bus) {
      mostrarMensaje('error', 'Todos los campos deben estar llenos');
      return;
    }

    try {
      mostrarMensaje('loading', 'Registrando gasto...');
      await createGasto({ descripcion_gasto, monto, fecha_gasto: fecha_gasto.format("YYYY-MM-DD"), id_bus });
      mostrarMensaje('success', 'Gasto registrado correctamente');
      resetForm();
      onClose();
      onGastoRegistered();
    } catch (error) {
      mostrarMensaje('error', `Error al registrar el gasto: ${error.message}`);
    }
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      descripcion_gasto: "",
      monto: "",
      fecha_gasto: null,
      id_bus: busId || "",
    });
    setIsCombustible(false);
    setIsDirty(false);
  };

  return (
    <>
      {contextHolder}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Registrar Nuevo Gasto"
        onAccept={handleRegisterGasto}
        acceptText="Registrar"
        hasUnsavedChanges={isDirty}
      >
        <div className="space-y-4 mt-4">
          {!busId && (
            <div className="w-full">
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
          <div className="flex items-center">
            <Checkbox checked={isCombustible} onChange={handleCombustibleChange}>
              Combustible
            </Checkbox>
          </div>
          <Input
            theme={theme}
            label="Descripción"
            type="text"
            name="descripcion_gasto"
            value={formData.descripcion_gasto}
            onChange={handleInputChange}
            placeholder="Ingrese la descripción del gasto"
            disabled={isCombustible}
          />
          <Input
            theme={theme}
            label="Monto"
            type="number"
            name="monto"
            value={formData.monto}
            onChange={handleInputChange}
            placeholder="Ingrese el monto del gasto"
          />
          <div>
            <label className="block text-sm font-bold mb-2">Fecha</label>
            <DatePicker
              style={{ width: '100%' }}
              value={formData.fecha_gasto}
              onChange={handleDateChange}
              placeholder="Seleccione la fecha del gasto"
              format="YYYY-MM-DD"
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

RegisterGastoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onGastoRegistered: PropTypes.func.isRequired,
  theme: PropTypes.bool.isRequired,
  currentUser: PropTypes.object.isRequired,
  busId: PropTypes.string,
};

export default RegisterGastoModal;