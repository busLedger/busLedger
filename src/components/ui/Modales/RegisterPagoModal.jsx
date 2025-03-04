/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../Modal.jsx";
import Input from "../Input.jsx";
import { Select } from "antd";
import { registrarPagoAlumno, obtenerPagosAlumno } from "../../../api/pagos.service.js";
import { RegisterMessage } from "../RegisterMessage.jsx";

const { Option } = Select;

export const RegisterPagoModal = ({ isOpen, onClose, onPagoRegistered, theme, alumnoData }) => {
  const [formData, setFormData] = useState({
    monto: "",
    mes_correspondiente: "",
    fecha_pago: new Date().toISOString().split("T")[0],
    anio_correspondiente: new Date().getFullYear()
  });

  const [isDirty, setIsDirty] = useState(false);
  const [mesesDisponibles, setMesesDisponibles] = useState([]);
  const { mostrarMensaje, contextHolder } = RegisterMessage();

  useEffect(() => {
    if (isOpen) {
      obtenerMesesDisponibles();
    }
  }, [isOpen]);

  const obtenerMesesDisponibles = async () => {
    const anioActual = new Date().getFullYear();
    const pagos = await obtenerPagosAlumno(alumnoData.id, anioActual);
    const mesesPagados = pagos.map(pago => pago.mes_correspondiente);
    const todosLosMeses = [
       "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre"
    ];

    const mesesNoPagados = todosLosMeses.filter(mes => !mesesPagados.includes(mes));
    setMesesDisponibles(mesesNoPagados);
  };

  // Función para manejar el cambio en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setIsDirty(true);
  };

  // Función para manejar el cambio en la selección del mes
  const handleMesChange = (value) => {
    setFormData({ ...formData, mes_correspondiente: value });
    setIsDirty(true);
  };

  // Función para registrar un nuevo pago
  const handleRegisterPago = async () => {
    const { monto, mes_correspondiente, fecha_pago } = formData;

    // Validar que todos los campos estén llenos
    if (!monto || !mes_correspondiente || !fecha_pago) {
      mostrarMensaje('error', 'Todos los campos deben estar llenos');
      return;
    }

    const pagoData = {
      monto: parseFloat(monto),
      mes_correspondiente,
      fecha_pago,
      id_alumno: alumnoData.id,
      anio_correspondiente: new Date().getFullYear()
    };

    try {
      mostrarMensaje('loading', 'Registrando pago...');
      const result = await registrarPagoAlumno(pagoData, alumnoData);
      if (result) {
        mostrarMensaje('success', 'Pago registrado correctamente');
        resetForm();
        onClose();
        onPagoRegistered();
      } else {
        mostrarMensaje('error', 'Error al registrar el pago');
      }
    } catch (error) {
      mostrarMensaje('error', `Error al registrar el pago: ${error.message}`);
    }
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      monto: "",
      mes_correspondiente: "",
      fecha_pago: new Date().toISOString().split("T")[0],
    });
    setIsDirty(false);
  };

  return (
    <>
      {contextHolder}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Registrar Pago de Alumno"
        onAccept={handleRegisterPago}
        acceptText="Registrar"
        hasUnsavedChanges={isDirty}
      >
        <div className="space-y-4">
          <Input
            theme={theme}
            label="Monto"
            type="number"
            name="monto"
            value={formData.monto}
            onChange={handleInputChange}
            placeholder="Ingrese el monto del pago"
          />
          <div>
            <label className={`block text-sm font-bold mb-2 ${theme ? "text-white" : "text-black"}`}>
              Mes Correspondiente
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder="Seleccione un mes"
              value={formData.mes_correspondiente}
              onChange={handleMesChange}
            >
              {mesesDisponibles.map((mes) => (
                <Option key={mes} value={mes}>
                  {mes}
                </Option>
              ))}
            </Select>
          </div>
          <Input
            theme={theme}
            label="Fecha de Pago"
            type="date"
            name="fecha_pago"
            value={formData.fecha_pago}
            onChange={handleInputChange}
            placeholder="Seleccione la fecha de pago"
          />
        </div>
      </Modal>
    </>
  );
};

RegisterPagoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPagoRegistered: PropTypes.func.isRequired,
  theme: PropTypes.bool.isRequired,
  alumnoData: PropTypes.object.isRequired,
};

export default RegisterPagoModal;