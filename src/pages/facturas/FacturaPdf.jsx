import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from "date-fns";
import { es } from "date-fns/locale";

const formatDate = () => {
    try {
      return format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) {
      console.error(error);
      return "Fecha inválida";
    }
  };

export const generarFacturaPDF = async (data) => {
  // Crear contenedor oculto
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '210mm';
  container.style.height = '297mm';
  container.style.padding = '20mm';
  container.style.background = '#ffffff'; // Fondo blanco sólido
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.color = '#000000'; // Texto negro forzado
  container.style.lineHeight = '1.5';
  
  document.body.appendChild(container);

  // Generar contenido del PDF
  container.innerHTML = `
    <div style="width: 100%; height: 100%; background: #ffffff; color: #000000;">
      <!-- Encabezado -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px; background: #ffffff;">
        <div style="flex: 1;">
          <h1 style="font-size: 24pt; color: #000000; margin: 0 0 10px 0;">FACTURA</h1>
          <p style="font-size: 14pt; color: #000000; margin: 0 0 5px 0;">#${data.invoiceNumber}</p>
          <p style="font-size: 12pt; color: #000000;">
            Fecha de emisión: ${formatDate(data.date)}
          </p>
        </div>
        
        <div style="flex: 1; text-align: right; color: #000000;">
          <h2 style="font-size: 14pt; color: #000000; margin: 0 0 10px 0;">${data.companyName}</h2>
          <p style="font-size: 11pt; color: #000000; margin: 4px 0;">Colaborador: ${data.colaborador}</p>
          <p style="font-size: 11pt; color: #000000; margin: 4px 0;">Whatsapp: ${data.companyPhone}</p>
          <p style="font-size: 11pt; color: #000000; margin: 4px 0;">Email: ${data.companyEmail}</p>
        </div>
      </div>

      <!-- Información del Cliente -->
      <div style="margin-bottom: 30px; padding: 15px; background: #f8f9fa; border-radius: 5px; color: #000000;">
        <h2 style="font-size: 13pt; color: #000000; margin: 0 0 10px 0;">Facturar a: ${data.clientName}</h2>
        <p style="font-size: 11pt; color: #000000; margin: 5px 0;">Colonia: ${data.clientAddress}</p>
        <p style="font-size: 11pt; color: #000000; margin: 5px 0;">Contacto: ${data.clientEmail}</p>
      </div>

      <!-- Tabla de Artículos -->
      <table style="width: 100%; margin-bottom: 25px; border-collapse: collapse; color: #000000;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; font-size: 12pt; color: #000000;">Descripción</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6; font-size: 12pt; color: #000000;">Fecha de pago</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6; font-size: 12pt; color: #000000;">Importe</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #dee2e6;">
            <td style="padding: 12px; font-size: 11pt; color: #000000;">${data.item[0].description}</td>
            <td style="padding: 12px; text-align: right; font-size: 11pt; color: #000000;">${formatDate(data.item[0].fecha_pago)}</td>
            <td style="padding: 12px; text-align: right; font-size: 11pt; color: #000000;">${data.item[0].price.toFixed(2)} Lps</td>
          </tr>
        </tbody>
      </table>

      <!-- Totales -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 40px; color: #000000;">
        <div style="width: 300px;">
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #dee2e6;">
            <span style="font-size: 11pt; color: #000000;">Subtotal:</span>
            <span style="font-size: 11pt; color: #000000;">${data.item[0].price.toFixed(2)} Lps</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 2px solid #dee2e6;">
            <span style="font-size: 11pt; color: #000000;">ISV:</span>
            <span style="font-size: 11pt; color: #000000;">0.00 Lps</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0;">
            <span style="font-size: 14pt; font-weight: bold; color: #000000;">Total:</span>
            <span style="font-size: 14pt; font-weight: bold; color: #000000;">${data.item[0].price.toFixed(2)} Lps</span>
          </div>
        </div>
      </div>

      <!-- Términos de Pago -->
      <div style="border-top: 2px solid #dee2e6; padding-top: 20px; color: #000000;">
        <p style="font-size: 12pt; font-weight: bold; margin: 0 0 10px 0; color: #000000;">Condiciones de pago:</p>
        <p style="font-size: 11pt; margin: 0 0 20px 0; color: #000000;">${data.paymentTerms}</p>
        ${
          data.notes 
            ? `<div>
                <p style="font-size: 12pt; font-weight: bold; margin: 0 0 10px 0; color: #000000;">Notas:</p>
                <p style="font-size: 11pt; margin: 0; white-space: pre-line; color: #000000;">${data.notes}</p>
               </div>`
            : ''
        }
      </div>
    </div>
  `;

  try {
    // Convertir a imagen
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: 794,
      height: 1123,
      windowWidth: 794,
      windowHeight: 1123,
      backgroundColor: '#ffffff' // Fuerza fondo blanco en el canvas
    });

    // Generar PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    pdf.addImage(canvas, 'JPEG', 0, 0, 210, 297);
    pdf.save(`Factura-${data.data_pago.mes_correspondiente}-${data.data_pago.anio_correspondiente}-${data.alumno_data.nombre}.pdf`);

  } catch (error) {
    console.error('Error generando PDF:', error);
  } finally {
    document.body.removeChild(container);
  }
};