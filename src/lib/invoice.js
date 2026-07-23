const buildInvoiceData = ({ alumno, pago, user }) => ({
  colaborador: user.nombre,
  data_pago: pago,
  alumno_data: alumno,
  invoiceNumber: `FAC-00${alumno.id}-00${pago.id}`,
  companyName: "BusLedger",
  companyAddress: "Calle Principal 123\n28001 Madrid",
  companyPhone: user.whatsapp,
  companyEmail: user.correo,
  clientName: alumno.encargado,
  clientAddress: alumno.direccion,
  clientEmail: alumno.no_encargado,
  item: [
    {
      id: alumno.id,
      description: `Pago de transporte de ${pago.mes_correspondiente} ${pago.anio_correspondiente} del alumno ${alumno.nombre}`,
      fecha_pago: pago.fecha_pago,
      quantity: 1,
      price: Number(pago.monto),
    },
  ],
  taxRate: 0,
  paymentTerms: "Se aceptan pagos en efectivo y transferencias bancarias",
  notes:
    "Gracias por su confianza.\nCualquier consulta, no dude en contactarnos.",
});

export { buildInvoiceData };
