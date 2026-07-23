import { useState, useEffect } from "react";
import { useContainerHeight } from "../../Hooks/useContainerHeight.js";
import { useResponsivePagination } from "../../Hooks/useResponsivePagination.js";
import { useOutletContext } from "react-router-dom";
import { getAllUsers, toggleUserStatus } from "../../api/user.service.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/CardUsers";
import adminIcon from "../../assets/admin-panel.png";
import usuarioIcon from "../../assets/user_panel.png";
import { Switch, message, ConfigProvider } from "antd";
import Input from "../../components/ui/Input.jsx";
import FilterTabs from "../../components/ui/FilterTabs.jsx";
import { Load } from "../../components/ui/Load.jsx";
import RegisterUserModal from "../../components/ui/Modales/RegisterUserModal.jsx";
import { Fab } from "../../components/ui/Fab/Fab.jsx";
import { Pagination } from "../../components/ui/Pagination/Pagination.jsx";

export const AdminPanel = () => {
  const containerMovilRef = useContainerHeight();
  const { darkMode } = useOutletContext();
  const { pageSize, currentPage, setCurrentPage, isPaginated } = useResponsivePagination(3);
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const obtenerUsuarios = async () => {
    const users = await getAllUsers();
    setUsers(users);
    setFilteredUsers(users);
    setLoading(false);
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const handleFilterChange = (value) => {
    if (value === "all") {
      setFilteredUsers(users);
    } else {
      const isActive = value === "active";
      setFilteredUsers(users.filter((user) => user.activo === isActive));
    }
    setCurrentPage(1);
  };

  const handleToggleStatus = async (uid, currentStatus) => {
    try {
      await toggleUserStatus(uid, !currentStatus);
      message.success(`Usuario ${!currentStatus ? "activado" : "desactivado"} correctamente`);
      obtenerUsuarios();
    } catch (error) {
      message.error("Error al cambiar el estado del usuario: " + error.message);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    const filtered = users.filter(
      (user) =>
        user.nombre.toLowerCase().includes(e.target.value.toLowerCase()) ||
        user.correo.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const customTheme = {
    token: {
      colorPrimary: darkMode ? "#1890ff" : "#ff4d4f",
      colorText: darkMode ? "#ffffff" : "#000000",
      colorBgContainer: darkMode ? "#141414" : "#ffffff",
    },
  };

  const paginatedUsers = isPaginated
    ? filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredUsers; // En móviles, mostrar todos los usuarios sin paginar

  return (
    <ConfigProvider theme={customTheme}>
      <div className={`p-4 md:p-0 bg-dark-purple w-full`}>
        <section ref={containerMovilRef} className="container-movil container w-full mx-auto p-2">
          <p className="title-pages">Admin Panel</p>
          <div className="pages-option-container">
            <div className="w-full sm:w-1/2 lg:w-1/2">
              <FilterTabs
                options={["Todos", "Activos", "Inactivos"]}
                onSelect={(option) =>
                  handleFilterChange(
                    option === "Todos"
                      ? "all"
                      : option === "Activos"
                      ? "active"
                      : "inactive"
                  )
                }
                theme={darkMode}
              />
            </div>

            <div className="center-item">
              <Input
                className="w-full md:w-3/4 md:mt-1"
                theme={darkMode}
                type="text"
                name="nombre"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar usuarios"
              />
            </div>
          </div>
          <Fab onClick={() => setIsModalOpen(true)} />
        </section>

        <div className="pt-4 md:pt-0 data-div">
          {loading ? (
            <Load />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedUsers.map((user) => (
                <Card
                  theme={darkMode}
                  key={user.uid}
                  avatar={
                    <img
                      src={user.roles.includes("Admin") ? adminIcon : usuarioIcon}
                      alt="avatar"
                      className="w-16 h-16 rounded-full"
                    />
                  }
                >
                  <CardHeader>
                    <CardTitle>{user.nombre}</CardTitle>
                  </CardHeader>
                  <CardContent
                    items={[
                      `Correo: ${user.correo}`,
                      `WhatsApp: ${user.whatsapp}`,
                      `Fecha de Creación: ${new Date(user.fecha_creacion).toLocaleDateString()}`,
                      `Roles: ${user.roles.join(", ")}`,
                    ]}
                    theme={darkMode}
                  />
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

        {isPaginated && (
          <Pagination totalItems={filteredUsers.length} currentPage={currentPage} pageSize={pageSize} onPageChange={setCurrentPage} />
        )}

        <RegisterUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUserRegistered={obtenerUsuarios} theme={darkMode} isOwner={false} />
      </div>
    </ConfigProvider>
  );
};
