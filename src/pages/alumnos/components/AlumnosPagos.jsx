/* eslint-disable react/prop-types */
import { useState, useMemo, useEffect } from "react";
import { CardResum } from "@/components/ui/CardResum";
import Button from "@/components/ui/Button.jsx";
import { Fab } from "@/components/ui/Fab/Fab";
import {
  DollarSign,
  ChevronDown,
  Trash2,
  Eye,
  Download,
} from "lucide-react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export const AlumnoPagos = ({
  alumno,
  darkMode,
  onDeletePago,
  onVerFactura,
  onDescargarFactura,
  onOpenRegisterPagoModal,
}) => {
  const [openAccordion, setOpenAccordion] = useState(null);
  const [download, setDownload] = useState(false);

  const toggleAccordion = (pagoId) => {
    setOpenAccordion(openAccordion === pagoId ? null : pagoId);
  };

  const currentYear = new Date().getFullYear();

  // ===== 1) AÑOS DISPONIBLES (SIEMPRE INCLUYE EL AÑO ACTUAL) =====
  const years = useMemo(() => {
    const set = new Set();
    // siempre incluir el año actual
    set.add(currentYear);

    if (alumno?.pagos_alumnos?.length) {
      alumno.pagos_alumnos.forEach((p) =>
        set.add(Number(p.anio_correspondiente))
      );
    }

    return Array.from(set).sort((a, b) => b - a); // descendente
  }, [alumno, currentYear]);

  // Año inicial: el año actual (que siempre está en la lista)
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Si cambian los años (por recarga de datos) y por alguna razón el seleccionado
  // ya no está en la lista, volvemos al año actual.
  useEffect(() => {
    if (!years.includes(selectedYear)) {
      setSelectedYear(currentYear);
    }
  }, [years, selectedYear, currentYear]);

  // ===== 2) PAGOS FILTRADOS POR EL AÑO SELECCIONADO =====
  const pagosFiltrados =
    alumno?.pagos_alumnos?.filter(
      (p) => Number(p.anio_correspondiente) === selectedYear
    ) || [];

  const pagosEsperados = 10;
  const pagosRealizados = pagosFiltrados.length;
  const pagosFaltantes = Math.max(0, pagosEsperados - pagosRealizados);

  const totalRecibido = pagosFiltrados.reduce(
    (sum, p) => sum + p.monto,
    0
  );

  const handleDescargar = async (pago) => {
    setDownload(true);
    try {
      await onDescargarFactura(pago);
    } finally {
      setDownload(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Selector de año */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Año:</span>
        <select
          className={`border rounded-md px-2 py-1 text-sm ${
            darkMode
              ? "bg-gray-900 border-gray-700 text-gray-100"
              : "bg-white border-gray-300 text-gray-900"
          }`}
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Cards resumen (del año seleccionado) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CardResum
          title="Total Recibido"
          description={`L. ${totalRecibido.toLocaleString("es-HN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          theme={darkMode}
        />
        <CardResum
          title="Pagos Faltantes"
          description={`${pagosFaltantes} ${
            pagosFaltantes === 1 ? "pago" : "pagos"
          }`}
          theme={darkMode}
        />
      </div>

      {/* Acordeón pagos (SOLO del año seleccionado) */}
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
        {pagosFiltrados.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            No hay pagos registrados para {selectedYear}.
          </p>
        )}

        {pagosFiltrados.map((pago) => (
          <div
            key={pago.id}
            className={`border-b last:border-b-0 ${
              darkMode ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <button
              type="button"
              onClick={() => toggleAccordion(pago.id)}
              className={`
                flex items-center justify-between w-full p-4 
                font-medium transition-colors
                ${
                  darkMode
                    ? "hover:bg-gray-800 text-gray-200"
                    : "hover:bg-gray-50 text-gray-900"
                }
              `}
            >
              <span className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pago de {pago.mes_correspondiente}{" "}
                {pago.anio_correspondiente}
              </span>
              <ChevronDown
                className={`h-4 w-4 transform transition-transform ${
                  openAccordion === pago.id ? "rotate-180" : ""
                }`}
              />
            </button>

            {openAccordion === pago.id && (
              <div
                className={`
                  p-4 space-y-4
                  ${darkMode ? "bg-gray-800/50" : "bg-gray-50"}
                `}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Monto
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        darkMode ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      {`L. ${pago.monto.toLocaleString("es-HN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Fecha de Pago
                    </p>
                    <p
                      className={`text-base ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {pago.fecha_pago}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  <Button
                    text={
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </div>
                    }
                    onClick={() => onDeletePago(pago)}
                    confirm
                    confirmTitle="¿Eliminar este pago?"
                    confirmDescription="Esta acción no se puede deshacer."
                    confirmOkText="Sí, eliminar"
                    confirmCancelText="No"
                    confirmPlacement="bottom"
                    className="!bg-red-600 hover:!bg-red-700"
                  />
                  <Button
                    text={
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Ver Factura
                      </div>
                    }
                    onClick={() => onVerFactura(pago)}
                  />
                  <button
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2"
                    onClick={() => handleDescargar(pago)}
                    disabled={download}
                  >
                    {download ? (
                      <Spin
                        indicator={
                          <LoadingOutlined
                            style={{ fontSize: 20, color: "white" }}
                            spin
                          />
                        }
                      />
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Descargar
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Fab onClick={onOpenRegisterPagoModal} />
    </div>
  );
};
