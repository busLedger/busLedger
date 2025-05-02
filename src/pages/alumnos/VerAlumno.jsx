/* eslint-disable react-hooks/exhaustive-deps */
import { useParams, useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAlumno, deleteAlumno } from "../../api/alumnos.service";
import { Load } from "../../components/ui/Load";
import { CardResum } from "../../components/ui/CardResum";
import FilterTabs from "../../components/ui/FilterTabs";
import Button from "../../components/ui/Button";
import { Fab } from "../../components/ui/Fab/Fab.jsx";
import { RegisterPagoModal } from "../../components/ui/Modales/RegisterPagoModal.jsx";
import { generarFacturaPDF } from "../facturas/FacturaPdf.jsx";
import { message, Spin } from "antd";
import { LoadingOutlined, DownloadOutlined } from "@ant-design/icons";
import { eliminarPagoAlumno } from "../../api/pagos.service.js";

export const VerAlumno = () => {
  const navigate = useNavigate();
  const [isRegisterPagoModalOpen, setIsRegisterPagoModalOpen] = useState(false);
  const { darkMode, userData } = useOutletContext();
  const [optFilter, setOptFilter] = useState(["Datos", "Pagos"]);
  const [load, setLoad] = useState(true);
  const [alumno, setAlumno] = useState(null);
  const { id } = useParams();
  const [selectedTab, setSelectedTab] = useState("Datos");
  const [openAccordion, setOpenAccordion] = useState(null);
  const [donwload, setDownload] = useState(false);

  const toggleAccordion = (pagoId) => {
    setOpenAccordion(openAccordion === pagoId ? null : pagoId);
  };

  const fetchAlumno = async () => {
    setLoad(true);
    try {
      const alumnoData = await getAlumno(id);
      if (alumnoData?.ubicacion !== "") {
        setOptFilter(["Datos", "Pagos", "Ubicación"]);
      }
      setAlumno(alumnoData[0]);
    } catch (error) {
      console.error("Error al obtener el alumno:", error);
      message.error("Error al cargar los datos del alumno.");
    } finally {
      setLoad(false);
    }
  };
  const handleDeleteAlumno = async () => {
    try {
      await deleteAlumno(id);
      message.success("Alumno eliminado correctamente.");
      navigate("/home/alumnos");
    } catch (error) {
      console.error("Error al eliminar el alumno:", error);
    }
  };

  const descargarFactura = async (pago) => {
    let data = {
      colaborador: userData.nombre,
      data_pago: pago,
      alumno_data: alumno,
      invoiceNumber: `FAC-00${alumno.id}-00${pago.id}`,
      date: "2023-10-15",
      companyName: "BusLedger",
      companyAddress: "Calle Principal 123\n28001 Madrid",
      companyPhone: userData.whatsapp,
      companyEmail: userData.correo,
      clientName: alumno.encargado,
      clientAddress: alumno.direccion,
      clientEmail: alumno.no_encargado,
      item: [
        {
          id: alumno.id,
          description: `Pago de transporte de ${pago.mes_correspondiente} ${pago.anio_correspondiente} del alumno ${alumno.nombre}`,
          fecha_pago: pago.fecha_pago,
          quantity: 1,
          price: parseFloat(pago.monto),
        },
      ],
      taxRate: 0,
      paymentTerms: "Se aceptan pagos en efectivo y transferencias bancarias",
      notes:
        "Gracias por su confianza.\nCualquier consulta, no dude en contactarnos.",
    };
    setDownload(true);
    try {
      await generarFacturaPDF(data);
    } catch (error) {
      console.error("Error al imprimir la factura: ", error);
    } finally {
      donwload(false);
    }
  };

  const verFactura = async (pago) => {
    let data = {
      colaborador: userData.nombre,
      data_pago: pago,
      alumno_data: alumno,
      invoiceNumber: `FAC-00${alumno.id}-00${pago.id}`,
      date: "2023-10-15",
      companyName: "BusLedger",
      companyAddress: "Calle Principal 123\n28001 Madrid",
      companyPhone: userData.whatsapp,
      companyEmail: userData.correo,
      clientName: alumno.encargado,
      clientAddress: alumno.direccion,
      clientEmail: alumno.no_encargado,
      item: [
        {
          id: alumno.id,
          description: `Pago de transporte de ${pago.mes_correspondiente} ${pago.anio_correspondiente} del alumno ${alumno.nombre}`,
          fecha_pago: pago.fecha_pago,
          quantity: 1,
          price: parseFloat(pago.monto),
        },
      ],
      taxRate: 0,
      paymentTerms: "Se aceptan pagos en efectivo y transferencias bancarias",
      notes:
        "Gracias por su confianza.\nCualquier consulta, no dude en contactarnos.",
    };
    navigate("factura", {
      state: data,
    });
  };

  const handleDeletePago = async (pago) => {
    try {
      await eliminarPagoAlumno(pago);
      message.success("Pago eliminado correctamente");
      fetchAlumno();
    } catch (error) {
      message.error("Error al eliminar el ingreso");
      console.error("Error al eliminar el pago:", error);
    }
  };

  useEffect(() => {
    fetchAlumno();
  }, []);

  if (load) return <Load />;

  const pagosRealizados = alumno?.pagos_alumnos.length || 0;
  const totalRecibido =
    alumno?.pagos_alumnos.reduce((sum, pago) => sum + pago.monto, 0) || 0;
  const pagosEsperados = 10;
  const pagosFaltantes = pagosEsperados - pagosRealizados;
  const ingresosAnualesEsperados = alumno?.pago_mensual * 10 || 0;

  return (
    <section className="h-[95vh] p-3">
      <div className="h-[25%] mb-4">
        <div className="flex justify-center w-full pt-4">
          <p className="title-pages w-4/5">Información del alumno</p>
        </div>
        <FilterTabs
          options={optFilter}
          onSelect={setSelectedTab}
          theme={darkMode}
        />
      </div>

      <div className="h-[75%]">
        <p className="text-center pt-5 mb-2 text-xl font-semibold">
          {alumno.nombre}
        </p>
        {selectedTab === "Datos" && alumno && (
          <div className="overflow-auto max-h-[80%]">
            <table
              className={`w-full border-collapse rounded-lg ${
                darkMode
                  ? "bg-dark-purple text-white"
                  : "bg-white text-black border border-gray-300"
              }`}
            >
              <thead>
                <tr
                  className={`border-b ${
                    darkMode
                      ? "border-gray-500 text-white"
                      : "border-gray-300 text-black"
                  }`}
                ></tr>
              </thead>
              <tbody>
                <tr
                  className={`border-b ${
                    darkMode
                      ? "border-gray-600 hover:bg-dark-purple/80"
                      : "border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <td className="p-3 font-semibold">Encargado</td>
                  <td className="p-3">{alumno.encargado}</td>
                </tr>
                <tr
                  className={`border-b ${
                    darkMode
                      ? "border-gray-600 hover:bg-dark-purple/80"
                      : "border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <td className="p-3 font-semibold">Teléfono</td>
                  <td className="p-3">{alumno.no_encargado}</td>
                </tr>
                <tr
                  className={`border-b ${
                    darkMode
                      ? "border-gray-600 hover:bg-dark-purple/80"
                      : "border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <td className="p-3 font-semibold">Dirección</td>
                  <td className="p-3">{alumno.direccion}</td>
                </tr>
                <tr
                  className={`border-b ${
                    darkMode
                      ? "border-gray-600 hover:bg-dark-purple/80"
                      : "border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <td className="p-3 font-semibold">Pago Mensual</td>
                  <td className="p-3">
                    {alumno.pago_mensual.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    Lps
                  </td>
                </tr>
                <tr
                  className={`border-b ${
                    darkMode
                      ? "border-gray-600 hover:bg-dark-purple/80"
                      : "border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <td className="p-3 font-semibold">Ingreso Anual Esperado</td>
                  <td className="p-3">
                    {ingresosAnualesEsperados.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    Lps
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="w-full flex justify-center gap-4 mt-4">
              {/* <Button text={"Editar Alumno"} /> */}
              <Button
                text={"Eliminar Alumno"}
                onClick={handleDeleteAlumno.bind(this, alumno.id)}
                confirm={true}
                confirmTitle="¿Eliminar alumno?"
                confirmDescription="Esta acción no se puede deshacer y eliminara todos los registros relaciondas con este alumno."
                confirmOkText="Sí, eliminar"
                confirmCancelText="No"
                confirmPlacement="top"
              />
            </div>
          </div>
        )}

        {selectedTab === "Pagos" && alumno?.pagos_alumnos.length >= 0 && (
          <div>
            {/* 📌 Sección de estadísticas con CardResum */}
            <div className="h-[20%] grid grid-cols-2 gap-4 mb-4">
              <CardResum
                title="Total Recibido"
                description={`${totalRecibido.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} Lps`}
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

            {/* 📌 Tabla de pagos con scroll y sin paginación */}
            <div className="overflow-auto max-h-[75%]">
              <div
                className={`rounded-lg ${
                  darkMode
                    ? "bg-dark-purple text-white"
                    : "bg-white text-black border border-gray-300"
                }`}
              >
                {alumno.pagos_alumnos.map((pago, index) => (
                  <div key={pago.id} className="border-b last:border-b-0">
                    <button
                      type="button"
                      onClick={() => toggleAccordion(pago.id)}
                      className={`flex items-center justify-between w-full p-5 font-medium ${
                        darkMode
                          ? "hover:bg-gray-800 text-gray-300"
                          : "hover:bg-gray-100 text-gray-600"
                      } ${index === 0 ? "rounded-t-lg" : ""} transition-colors`}
                    >
                      <span>Pago de {pago.mes_correspondiente}</span>
                      <svg
                        className={`w-4 h-4 transform transition-transform ${
                          openAccordion === pago.id ? "rotate-180" : ""
                        } ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <div
                      className={`${
                        openAccordion === pago.id ? "block" : "hidden"
                      } p-5 ${
                        darkMode ? "bg-dark-purple" : "bg-gray-50"
                      } border-t ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p
                            className={`font-semibold ${
                              darkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            Monto:
                          </p>
                          <p
                            className={
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }
                          >
                            {pago.monto.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            Lps
                          </p>
                        </div>
                        <div>
                          <p
                            className={`font-semibold ${
                              darkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            Fecha de Pago:
                          </p>
                          <p
                            className={
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }
                          >
                            {pago.fecha_pago}
                          </p>
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-center gap-4">
                        <Button
                          text="Eliminar"
                          onClick={() => handleDeletePago(pago)}
                          confirm={true}
                          confirmTitle="¿Eliminar este pago?"
                          confirmDescription="Esta acción no se puede deshacer."
                          confirmOkText="Sí, eliminar"
                          confirmCancelText="No"
                          confirmPlacement="bottom"
                        />
                        <Button
                          text={"Ver Factura"}
                          onClick={() => verFactura(pago)}
                        ></Button>
                        <button
                          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2"
                          onClick={() => descargarFactura(pago)}
                          disabled={load}
                        >
                          {load ? (
                            <Spin
                              indicator={
                                <LoadingOutlined
                                  style={{ fontSize: 24, color: "white" }}
                                  spin
                                />
                              }
                            />
                          ) : (
                            <DownloadOutlined
                              style={{ fontSize: 24, color: "white" }}
                            />
                          )}
                        </button>
                        <button></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Fab onClick={() => setIsRegisterPagoModalOpen(true)} />
            <RegisterPagoModal
              isOpen={isRegisterPagoModalOpen}
              onClose={() => setIsRegisterPagoModalOpen(false)}
              theme={darkMode}
              onPagoRegistered={fetchAlumno}
              alumnoData={alumno}
            />
          </div>
        )}

        {selectedTab === "Ubicación" && (
          <div
            className={`overflow-auto max-h-[95%] rounded-lg p-4 text-center text-lg font-semibold ${
              darkMode ? "bg-dark-purple text-white" : "bg-gray-100 text-black"
            }`}
          >
            Aquí se verá la ubicación pronto.
          </div>
        )}
      </div>
    </section>
  );
};
