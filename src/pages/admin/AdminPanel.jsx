import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { getAllUsers, toggleUserStatus } from "../../api/user.service.js";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/CardUsers";
import adminIcon from "../../assets/admin-panel.png";
import usuarioIcon from "../../assets/user_panel.png"; 
import { Switch, message, ConfigProvider } from "antd";
import FilterTabs from "../../components/ui/FilterTabs.jsx";
import { Load } from "../../components/ui/Load.jsx";
import RegisterUserModal from "../../components/ui/Modales/RegisterUserModal.jsx";
import { Fab } from "../../components/ui/Fab/Fab.jsx";

export const AdminPanel = () => {
  const { userData, darkMode } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const obtenerUsuarios = async () => {
    setLoading(true);
    const users = await getAllUsers();
    setUsers(users);
    setFilteredUsers(users);
    setLoading(false);
  };

  useEffect(() => {
    console.log('informacion de usuario', userData);
    obtenerUsuarios();
  }, []);

  // Función para filtrar usuarios según el estado
  const handleFilterChange = (value) => {
    if (value === "all") {
      setFilteredUsers(users);
    } else {
      const isActive = value === "active";
      setFilteredUsers(users.filter((user) => user.activo === isActive));
    }
  };

  // Función para cambiar el estado de un usuario
  const handleToggleStatus = async (uid, currentStatus) => {
    try {
      await toggleUserStatus(uid, !currentStatus);
      message.success(`Usuario ${!currentStatus ? "activado" : "desactivado"} correctamente`);
      obtenerUsuarios(); // Refrescar lista de usuarios
    } catch (error) {
      message.error("Error al cambiar el estado del usuario: " + error.message);
    }
  };

  const customTheme = {
    token: {
      colorPrimary: darkMode ? '#1890ff' : '#ff4d4f',
      colorText: darkMode ? '#ffffff' : '#000000',
      colorBgContainer: darkMode ? '#141414' : '#ffffff',
    },
  };

  return (
    <ConfigProvider theme={customTheme}>
      <div className={`p-4 bg-dark-purple`}>
        <section className="container mx-auto fixed top-0 left-0 right-0 bg-dark-purple z-10 p-10">
          <p className="title-pages">Admin Panel</p>
          <div className="flex justify-between mb-4">
            <FilterTabs
              options={["Todos", "Activos", "Inactivos"]}
              onSelect={(option) => handleFilterChange(option === "Todos" ? "all" : option === "Activos" ? "active" : "inactive")}
              theme={darkMode}
            />
            <Fab onClick={() => setIsModalOpen(true)} />
          </div>
        </section>

        <div className="pt-38"> {/* Añadir padding-top para evitar superposición */}
          {/* Listado de usuarios */}
          {loading ? (
            <Load />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <Card theme={darkMode} key={user.uid} avatar={<img src={user.roles.includes("Admin") ? adminIcon : usuarioIcon} alt="avatar" className="w-16 h-16 rounded-full" />}>
                  <CardHeader>
                    <CardTitle>{user.nombre}</CardTitle>
                  </CardHeader>
                  <CardContent items={[
                    `Correo: ${user.correo}`,
                    `WhatsApp: ${user.whatsapp}`,
                    `Fecha de Creación: ${new Date(user.fecha_creacion).toLocaleDateString()}`,
                    `Roles: ${user.roles.join(", ")}`,
                  ]} theme={darkMode} />
                  {/* Switch para activar/desactivar usuario */}
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm font-medium">Activo:</p>
                    <Switch 
                      checked={user.activo}
                      onChange={() => handleToggleStatus(user.uid, user.activo)}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Registro de Usuario */}
        <RegisterUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUserRegistered={obtenerUsuarios}
        />
      </div>
    </ConfigProvider>
  );
};