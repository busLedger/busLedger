import { useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "../Modal.jsx"; 
import { Select, message } from "antd";
import Input from "../Input.jsx";
import { createUser } from "../../../api/user.service.js";

const { Option } = Select;

const RegisterUserModal = ({ isOpen, onClose, onUserRegistered }) => {
  const [formData, setFormData] = useState({
    uid: "",
    nombre: "",
    correo: "",
    whatsapp: "+504",
    roles: [],
  });

  // Función para manejar el cambio en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Función para manejar el cambio en la selección de roles
  const handleRolesChange = (value) => {
    setFormData({ ...formData, roles: value });
  };

  // Función para registrar un nuevo usuario
  const handleRegisterUser = async () => {
    const { uid, nombre, correo, whatsapp, roles } = formData;

    // Validar que todos los campos estén llenos
    if (!uid || !nombre || !correo || !whatsapp || roles.length === 0) {
      message.error("Todos los campos deben estar llenos");
      return;
    }

    try {
      await createUser(formData);
      message.success("Usuario registrado correctamente");
      onClose();
      onUserRegistered(); // Refrescar lista de usuarios
    } catch (error) {
      message.error("Error al registrar el usuario: " + error.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Nuevo Usuario"
      onAccept={handleRegisterUser}
      acceptText="Registrar"
    >
      <div className="space-y-4">
        <Input
          label="UID"
          type="text"
          name="uid"
          value={formData.uid}
          onChange={handleInputChange}
          placeholder="Ingrese el UID"
        />
        <Input
          label="Nombre Completo"
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleInputChange}
          placeholder="Ingrese el nombre completo"
        />
        <Input
          label="Correo Electrónico"
          type="email"
          name="correo"
          value={formData.correo}
          onChange={handleInputChange}
          placeholder="Ingrese el correo electrónico"
        />
        <Input
          label="WhatsApp"
          type="text"
          name="whatsapp"
          value={formData.whatsapp}
          onChange={handleInputChange}
          placeholder="+504"
          disabled
        />
        <div>
          <label className="block text-sm font-bold mb-2">Roles</label>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Seleccione uno o más roles"
            value={formData.roles}
            onChange={handleRolesChange}
          >
            <Option value="Admin">Admin</Option>
            <Option value="User">User</Option>
            <Option value="Manager">Manager</Option>
          </Select>
        </div>
      </div>
    </Modal>
  );
};

RegisterUserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUserRegistered: PropTypes.func.isRequired,
};

export default RegisterUserModal;