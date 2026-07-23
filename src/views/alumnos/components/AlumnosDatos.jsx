/* eslint-disable react/prop-types */
import Button from "@/components/ui/Button";
import { User, Phone, MapPin, DollarSign, Calendar } from "lucide-react";

export const AlumnoDatos = ({ alumno, darkMode, onEdit, onDeactivate }) => {
  const ingresosAnualesEsperados = (alumno.pago_mensual || 0) * 10;

  return (
    <div className="space-y-4">
      <div
        className={`
          rounded-lg overflow-hidden border
          ${
            darkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }
        `}
      >
        {/* Encargado */}
        <div
          className={`
            flex items-center gap-3 p-4 border-b
            ${
              darkMode
                ? "border-gray-800 hover:bg-gray-800/50"
                : "border-gray-200 hover:bg-gray-50"
            }
            transition-colors
          `}
        >
          <User
            className={`h-5 w-5 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          />
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Encargado
            </p>
            <p
              className={`text-base ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {alumno.encargado}
            </p>
          </div>
        </div>

        {/* Teléfono */}
        <div
          className={`
            flex items-center gap-3 p-4 border-b
            ${
              darkMode
                ? "border-gray-800 hover:bg-gray-800/50"
                : "border-gray-200 hover:bg-gray-50"
            }
            transition-colors
          `}
        >
          <Phone
            className={`h-5 w-5 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          />
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Teléfono
            </p>
            <p
              className={`text-base ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {alumno.no_encargado}
            </p>
          </div>
        </div>

        {/* Dirección */}
        <div
          className={`
            flex items-center gap-3 p-4 border-b
            ${
              darkMode
                ? "border-gray-800 hover:bg-gray-800/50"
                : "border-gray-200 hover:bg-gray-50"
            }
            transition-colors
          `}
        >
          <MapPin
            className={`h-5 w-5 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          />
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Dirección
            </p>
            <p
              className={`text-base ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {alumno.direccion}
            </p>
          </div>
        </div>

        {/* Pago mensual */}
        <div
          className={`
            flex items-center gap-3 p-4 border-b
            ${
              darkMode
                ? "border-gray-800 hover:bg-gray-800/50"
                : "border-gray-200 hover:bg-gray-50"
            }
            transition-colors
          `}
        >
          <DollarSign
            className={`h-5 w-5 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          />
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Pago Mensual
            </p>
            <p
              className={`text-base font-semibold ${
                darkMode ? "text-green-400" : "text-green-600"
              }`}
            >
              {`L. ${alumno.pago_mensual.toLocaleString("es-HN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
            </p>
          </div>
        </div>

        {/* Ingreso anual esperado */}
        <div
          className={`
            flex items-center gap-3 p-4
            ${darkMode ? "hover:bg-gray-800/50" : "hover:bg-gray-50"}
            transition-colors
          `}
        >
          <Calendar
            className={`h-5 w-5 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          />
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Ingreso Anual Esperado
            </p>
            <p
              className={`text-base font-semibold ${
                darkMode ? "text-green-400" : "text-green-600"
              }`}
            >
              {`L. ${ingresosAnualesEsperados.toLocaleString("es-HN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
            </p>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button text="Editar Alumno" onClick={onEdit} />
        <Button
          text="Desactivar Alumno"
          onClick={onDeactivate}
          confirm
          confirmTitle="¿Desactivar alumno?"
          confirmDescription="Esta acción no se puede deshacer y eliminará todos los registros relacionados con este alumno."
          confirmOkText="Sí, desactivar"
          confirmCancelText="No"
          confirmPlacement="top"
          className="!bg-red-600 hover:!bg-red-700"
        />
      </div>
    </div>
  );
};
