/* eslint-disable react/prop-types */
import { useNavigate, useLocation } from "react-router-dom";
import { X, Moon, Sun, User } from "lucide-react";
import Button from "./Button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "../../assets/logo.png";
import { cn } from "@/lib/utils";

export const MobileNav = ({
  isOpen,
  onClose,
  Menus,
  toggleTheme,
  cerrarSesion,
  darkMode,
  userData,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (ruta) => {
    navigate(`/home/${ruta}`);
    onClose();
  };

  const handleToggleTheme = () => {
    toggleTheme();
  };

  const handleLogout = () => {
    cerrarSesion();
    onClose();
  };

  const isActiveRoute = (ruta) => {
    return location.pathname === `/home/${ruta}`;
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar móvil */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform shadow-xl transition-transform duration-300 ease-in-out lg:hidden",
          darkMode ? "bg-gray-900" : "bg-white",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className={cn(
            "flex items-center justify-between border-b p-4",
            darkMode ? "border-gray-800" : "border-gray-200"
          )}>
            <div className="flex items-center gap-3">
              <img src={Logo} alt="Logo" className="h-10 w-10" />
              <div>
                <h2 className={cn(
                  "text-lg font-semibold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Bus Ledger
                </h2>
                <p className={cn(
                  "text-xs",
                  darkMode ? "text-gray-400" : "text-gray-600"
                )}>
                  Gestión de transporte
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={cn(
                "rounded-lg p-2 transition-colors",
                darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              )}
            >
              <X className={cn("h-5 w-5", darkMode ? "text-white" : "text-gray-900")} />
            </button>
          </div>

          {/* User Info */}
          {userData && (
            <div className={cn(
              "border-b p-4",
              darkMode ? "border-gray-800" : "border-gray-200"
            )}>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={userData.photoURL} />
                  <AvatarFallback className={darkMode ? "bg-gray-800" : "bg-gray-200"}>
                    <User className={cn("h-4 w-4", darkMode ? "text-white" : "text-gray-900")} />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className={cn(
                    "truncate text-sm font-medium",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    {userData.displayName || userData.email}
                  </p>
                  <p className={cn(
                    "truncate text-xs",
                    darkMode ? "text-gray-400" : "text-gray-600"
                  )}>
                    {userData.roles?.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <ScrollArea className="flex-1 px-3 py-4">
            <div className="space-y-1">
              {Menus.map((menu, index) => {
                const isActive = isActiveRoute(menu.ruta);
                return (
                  <button
                    key={index}
                    onClick={() => handleNavigation(menu.ruta)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative overflow-hidden",
                      menu.gap && "mt-6",
                      isActive
                        ? "bg-indigo-600 text-white"
                        : darkMode 
                          ? "text-white hover:bg-gray-800" 
                          : "text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    {/* Barra indicadora */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                    )}
                    
                    <img
                      src={menu.src}
                      alt={menu.title}
                      className={cn(
                        "h-5 w-5 object-contain transition-all",
                        isActive 
                          ? "brightness-0 invert scale-110" 
                          : darkMode 
                            ? "opacity-90 brightness-200" 
                            : "opacity-70"
                      )}
                    />
                    <span>{menu.title}</span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className={cn(
            "border-t p-4 space-y-3",
            darkMode ? "border-gray-800" : "border-gray-200"
          )}>
            <button
              onClick={handleToggleTheme}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                darkMode 
                  ? "text-white hover:bg-gray-800" 
                  : "text-gray-900 hover:bg-gray-100"
              )}
            >
              {darkMode ? (
                <>
                  <Sun className="h-5 w-5" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5" />
                  <span>Modo Oscuro</span>
                </>
              )}
            </button>

            <Button
              text="Cerrar Sesión"
              onClick={handleLogout}
              confirm={true}
              confirmTitle="¿Cerrar sesión?"
              confirmDescription="¿Estás seguro de que deseas salir?"
              confirmOkText="Sí, salir"
              confirmCancelText="Cancelar"
              className="w-full !bg-red-600 hover:!bg-red-700"
            />
          </div>
        </div>
      </div>
    </>
  );
};