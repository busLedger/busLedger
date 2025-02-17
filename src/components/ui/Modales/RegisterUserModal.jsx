/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../Modal.jsx";
import { Select } from "antd";
import Input from "../Input.jsx";
import { createUser, getRoles } from "../../../api/user.service.js";
import { RegisterMessage } from "../RegisterMessage.jsx";
import { v5 as uuidv5 } from "uuid";

const { Option } = Select;

const RegisterUserModal = ({
  isOpen,
  onClose,
  onUserRegistered,
  theme,
  isOwner,
}) => {
  const [formData, setFormData] = useState({
    uid: "",
    nombre: "",
    correo: "",
    whatsapp: "",
    roles: isOwner ? [3] : [],
  });

  const [roles, setRoles] = useState([]);
  const [isDirty, setIsDirty] = useState(false); // Flag para detectar cambios en el formulario

  const { mostrarMensaje, contextHolder } = RegisterMessage();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await getRoles();
        setRoles(rolesData);
      } catch (error) {
        mostrarMensaje("error", `Error al obtener los roles: ${error.message}`);
      }
    };

    fetchRoles();
  }, []);

  // Función para manejar el cambio en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setIsDirty(true); // Marcar el formulario como editado
  };

  // Función para manejar el cambio en la selección de roles
  const handleRolesChange = (value) => {
    setFormData({ ...formData, roles: value });
    setIsDirty(true);
  };

  // Función para manejar el cambio en el input de WhatsApp
  const handleWhatsAppChange = (e) => {
    const value = e.target.value;
    // Validar que solo contenga números y tenga una longitud máxima de 8 dígitos
    if (/^\d{0,8}$/.test(value)) {
      setFormData({ ...formData, whatsapp: value });
      setIsDirty(true);
    }
  };

  // Función para registrar un nuevo usuario
  const handleRegisterUser = async () => {
    const { uid, nombre, correo, whatsapp, roles } = formData;
    if (isOwner) {
      setFormData({ ...formData, roles: [3] });
    }

    if (!nombre || !correo || !whatsapp || roles.length === 0) {
      console.log("Leng de los roles", roles.length);
      mostrarMensaje("error", "Todos los campos deben estar llenos");
      return;
    }

    // Generar UID basado en el nombre si el registro es realizado por un dueño
    const userUid = isOwner ? uuidv5(nombre, uuidv5.URL) : uid;
    localStorage.setItem("conductorData", JSON.stringify({"nombre": nombre, "uid": userUid}));

    try {
      mostrarMensaje("loading", "Registrando usuario...");
      console.log(roles);
      await createUser(
        { uid: userUid, nombre, correo, whatsapp: `+504${whatsapp}` },
        roles
      );
      mostrarMensaje("success", "Usuario registrado correctamente");
      resetForm();
      onClose();
      onUserRegistered();
    } catch (error) {
      localStorage.removeItem("conductorId");
      mostrarMensaje(
        "error",
        `Error al registrar el usuario: ${error.message}`
      );
    }
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      uid: "",
      nombre: "",
      correo: "",
      whatsapp: "",
      roles: isOwner ? [3] : [],
    });
    setIsDirty(false);
  };

  // Función para manejar el cierre del modal
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      {contextHolder}
      <Modal
        isOpen={isOpen}
        onClose={handleClose} // `Modal` maneja la confirmación con `hasUnsavedChanges`
        title="Registrar Nuevo Usuario"
        onAccept={handleRegisterUser}
        acceptText="Registrar"
        hasUnsavedChanges={isDirty} // Si hay cambios, el modal pedirá confirmación antes de cerrar
      >
        <div className="space-y-4">
          {!isOwner && (
            <Input
              theme={theme}
              label="UID"
              type="text"
              name="uid"
              value={formData.uid}
              onChange={handleInputChange}
              placeholder="Ingrese el UID"
            />
          )}
          <Input
            theme={theme}
            label="Nombre Completo"
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder="Ingrese el nombre completo"
          />
          <Input
            theme={theme}
            label="Correo Electrónico"
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleInputChange}
            placeholder="Ingrese el correo electrónico"
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
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleWhatsAppChange}
                placeholder="Ingrese el número de WhatsApp"
              />
            </div>
          </div>

          <div>
            {!isOwner && (
              <>
                <label className="block text-sm font-bold mb-2">Roles</label>
                <Select
                  mode="multiple"
                  style={{ width: "100%" }}
                  placeholder="Seleccione uno o más roles"
                  value={formData.roles}
                  onChange={handleRolesChange}
                  disabled={isOwner}
                >
                  {roles.map((role) => (
                    <Option key={role.id} value={role.id}>
                      {role.nombre}
                    </Option>
                  ))}
                </Select>
              </>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

RegisterUserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUserRegistered: PropTypes.func.isRequired,
  theme: PropTypes.bool.isRequired,
  isOwner: PropTypes.bool.isRequired,
};

export default RegisterUserModal;