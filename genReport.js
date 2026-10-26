function generarPDF(report) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  // Encabezado en tono aceite
  doc.setFillColor(33, 26, 23);
  doc.rect(0, 0, pageWidth, 48, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("Reporte de inspección:", 18, 23);
  doc.text("Tratamientos Termicos", 18, 33);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(228, 222, 216);
  doc.text("CONTROL DE CALIDAD / REGISTRO DE INSPECCIÓN", 18, 41);

  // Folio en tono óxido
  doc.setFontSize(10);
  doc.setTextColor(168, 66, 43);
  doc.text(`Folio: ${report.folio}`, 18, 59);

  // Tabla de inspección
  doc.autoTable({
    startY: 67,
    head: [["Dato de inspección", "Registro"]],
    body: [
      ["Fecha", formatDate(report.fecha)],
      ["Hora", report.hora],
      ["Empleado", report.empleado],
      ["Temp. de Austenizado Z1", `${report.z1} °C`],
      ["Temp. de Austenizado Z2", `${report.z2} °C`],
      ["Avance", `${report.avance} mm`],
      ["Ciclo", `${report.ciclo} seg`],
      ["Tiempo de Austenizado", `${report.tiempo} min`],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [168, 66, 43],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      font: "helvetica",
      fontSize: 10,
      textColor: [41, 37, 34],
      lineColor: [228, 222, 216],
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [248, 246, 243],
    },
    columnStyles: {
      0: {
        cellWidth: 82,
        fontStyle: "bold",
        textColor: [104, 98, 94],
      },
    },
    margin: { left: 18, right: 18 },
  });

  // Pie de página en gris acero
  doc.setFontSize(8);
  doc.setTextColor(119, 113, 108);
  doc.text(
    "Documento generado automáticamente",
    pageWidth / 2,
    285,
    { align: "center" }
  );

  // Descarga directa del PDF
  doc.save(`${report.folio}.pdf`);
}
