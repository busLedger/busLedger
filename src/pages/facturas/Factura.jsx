import { useState, useEffect } from 'react';
import "./factura.css";
import { useLocation } from 'react-router-dom';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { generarFacturaPDF } from './FacturaPdf';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

export const Factura = () => {
  const { state: data } = useLocation();
  const [isMounted, setIsMounted] = useState(false);
  const [load, setLoad] = useState(false);
  console.log(data)

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const formatDate = () => {
    try {
      return format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) {
      console.error(error);
      return "Fecha inválida";
    }
  };

  const descargarFactura = async () => {
    setLoad(true);
    try {
      await generarFacturaPDF(data);
    } catch (error) {
      console.error("Error al imprimir la factura: ", error);
    } finally {
      setLoad(false);
    }
  };

  if (!isMounted || !data?.item) {
    return <div className="p-8">Cargando...</div>;
  }

  const item = data.item[0];
  const subtotal = item.quantity * item.price;
  const total = subtotal;

  return (
    <div className="  p-4 bg-dark-purple w-full h-[97vh]">
      {/* Botón de imprimir */}
      <div className="container-movil container w-full mx-auto p-2 div-btn-imprimir">
        <button 
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2"
          onClick={descargarFactura}
          disabled={load}
        >
          {load ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: 'white' }} spin />} /> : "Generar Factura"}
        </button>
      </div>

      {/* Contenido responsive */}
      <div className=" shadow-lg rounded-lg pt-4 md:pt-0 contenido-factura">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-blue-600 mb-2">FACTURA</h1>
            <p className="text-lg md:text-xl font-semibold">#{data.invoiceNumber}</p>
            <p className="text-sm text-gray-600 mt-2">
              Fecha de emisión: {formatDate()}
            </p>
          </div>
          
          <div className="text-right flex-1">
            <h2 className="text-lg md:text-xl font-bold">{data.companyName}</h2>
            <p className="text-sm">Colaborador: {data.colaborador}</p>
            <p className="text-sm">Whatsapp: {data.companyPhone}</p>
            <p className="text-sm">Email: {data.companyEmail}</p>
          </div>
        </div>

        {/* Información del Cliente */}
        <div className="mb-6 p-3 md:p-4 rounded-md">
          <h2 className="text-base md:text-lg font-semibold mb-2">Facturar a: {data.clientName}</h2>
          <p className="font-medium text-sm md:text-base">Colonia: {data.clientAddress}</p>
          <p className="font-medium text-sm md:text-base">Contacto: {data.clientEmail}</p>
        </div>

        {/* Tabla de Artículos */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr>
                <th className="py-2 px-3 text-left text-sm md:text-base">Descripción</th>
                <th className="py-2 px-3 text-right text-sm md:text-base">Fecha de pago</th>
                <th className="py-2 px-3 text-right text-sm md:text-base">Importe</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-3 text-sm md:text-base">{item.description}</td>
                <td className="py-3 px-3 text-right text-sm md:text-base">{item[0].fecha_pago}</td>
                <td className="py-3 px-3 text-right text-sm md:text-base">{(item.price).toFixed(2)} Lps</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="flex justify-end mb-6">
          <div className="w-full md:w-64">
            <div className="flex justify-between py-2 text-sm md:text-base">
              <span>Subtotal:</span>
              <span>{subtotal.toFixed(2)} Lps</span>
            </div>
            <div className="flex justify-between py-2 border-b text-sm md:text-base">
              <span>ISV:</span>
              <span>0.00 Lps</span>
            </div>
            <div className="flex justify-between py-3 font-bold text-base md:text-lg px-2 rounded">
              <span>Total:</span>
              <span>{total.toFixed(2)} Lps</span>
            </div>
          </div>
        </div>

        {/* Términos de Pago y Notas */}
        <div className="border-t pt-4 text-sm md:text-base">
          <p className="font-semibold mb-2">Condiciones de pago:</p>
          <p className="mb-4">{data.paymentTerms}</p>
          
          {data.notes && (
            <>
              <p className="font-semibold mb-2">Notas:</p>
              <p className="whitespace-pre-line">{data.notes}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};