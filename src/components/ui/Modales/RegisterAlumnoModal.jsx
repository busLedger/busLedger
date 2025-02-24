/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../Modal.jsx";
import { Select, Checkbox } from "antd";
import Input from "../Input.jsx";
import { createAlumno } from "../../../api/alumnos.service.js";
import { getBusesByUser } from "../../../api/buses.service.js";
import { RegisterMessage } from "../RegisterMessage.jsx";
import { MapPicker } from "../MapPicker.jsx";

const { Option } = Select;

export const RegisterAlumnoModal = ({ isOpen, onClose, onAlumnoRegistered, theme, currentUser }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    encargado: "",
    no_encargado: "",
    id_bus: "",
    direccion: "",
    ubicacion: "",
    pago_mensual: "",
  });

  const [buses, setBuses] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [useMap, setUseMap] = useState(false);

  const { mostrarMensaje, contextHolder } = RegisterMessage();

  useEffect(() => {
    // Reset form when modal is closed
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const busesData = await getBusesByUser(currentUser.uid);
        setBuses(busesData);
      } catch (error) {
        mostrarMensaje('error', `Error al obtener los buses: ${error.message}`);
      }
    };

    fetchBuses();
  }, [currentUser.uid]);

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

  // Función para manejar la selección de ubicación en el mapa
  const handleLocationSelect = (latlng) => {
    setFormData({ ...formData, ubicacion: `${latlng.lat},${latlng.lng}` });
    setIsDirty(true);
  };

  // Función para registrar un nuevo alumno
  const handleRegisterAlumno = async () => {
    if(!useMap){
      setFormData({ ...formData, ubicacion: "" });
    }
    const { nombre, encargado, no_encargado, id_bus, direccion, ubicacion, pago_mensual } = formData;

    // Validar que todos los campos estén llenos
    if (!nombre || !encargado || !no_encargado || !id_bus || !direccion || !pago_mensual) {
      mostrarMensaje('error', 'Todos los campos deben estar llenos');
      return;
    }

    // Validar que la ubicación esté presente si se seleccionó usar el mapa
    if (useMap && !ubicacion) {
      mostrarMensaje('error', 'Debe seleccionar una ubicación en el mapa');
      return;
    }

    try {
      mostrarMensaje('loading', 'Registrando alumno...');
      await createAlumno({ nombre, encargado, no_encargado, id_bus, direccion, ubicacion, pago_mensual });
      mostrarMensaje('success', 'Alumno registrado correctamente');
      resetForm();
      onClose();
      onAlumnoRegistered();
    } catch (error) {
      mostrarMensaje('error', `Error al registrar el alumno: ${error.message}`);
    }
  };

  const handleWhatsAppChange = (e) => {
    const value = e.target.value;
    // Validar que solo contenga números y tenga una longitud máxima de 8 dígitos
    if (/^\d{0,8}$/.test(value)) {
      setFormData({ ...formData, no_encargado: value });
      setIsDirty(true);
    }
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      nombre: "",
      encargado: "",
      no_encargado: "",
      id_bus: "",
      direccion: "",
      ubicacion: "",
      pago_mensual: "",
    });
    setUseMap(false);
    setIsDirty(false);
  };

  return (
    <>
      {contextHolder}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Registrar Nuevo Alumno"
        onAccept={handleRegisterAlumno}
        acceptText="Registrar"
        hasUnsavedChanges={isDirty}
      >
        <div className="space-y-4">
          <Input
            theme={theme}
            label="Nombre"
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder="Ingrese el nombre del alumno"
          />
          <Input
            theme={theme}
            label="Encargado"
            type="text"
            name="encargado"
            value={formData.encargado}
            onChange={handleInputChange}
            placeholder="Ingrese el nombre del encargado"
          />
          <label
            className={`block text-sm font-bold mb-2 ${
              theme ? "text-white" : "text-black"
            }`}
          >
            Whatsapp
          </label>
          <div className="flex gap-2 w-full">
            <div className="w-1/6">
              <Input theme={theme} type="text" value="+504" disabled />
            </div>
            <div className="w-5/6">
              <Input
                theme={theme}
                type="text"
                name="no_encargado"
                value={formData.no_encargado}
                onChange={handleWhatsAppChange}
                placeholder="Ingrese el número de WhatsApp"
              />
            </div>
          </div>

          <Input
            theme={theme}
            label="Dirección"
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleInputChange}
            placeholder="Ingrese la dirección"
          />
          <Input
            theme={theme}
            label="Pago Mensual"
            type="number"
            name="pago_mensual"
            value={formData.pago_mensual}
            onChange={handleInputChange}
            placeholder="Ingrese el pago mensual"
          />
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

          <div className="flex items-center">
            <label className="block text-sm font-bold w-fit mr-5">Agregar ubicacion en el mapa</label>
            <Checkbox
            className="mx-2"
            checked={useMap}
            onChange={(e) => setUseMap(e.target.checked)}
            
          />
          </div>
         
            
          {useMap && (
            <>
              <Input
                theme={theme}
                label="Ubicación"
                type="text"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleInputChange}
                placeholder="Ingrese la ubicación"
                disabled
              />
              <MapPicker onLocationSelect={handleLocationSelect} />
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

RegisterAlumnoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAlumnoRegistered: PropTypes.func.isRequired,
  theme: PropTypes.bool.isRequired,
  currentUser: PropTypes.object.isRequired,
};