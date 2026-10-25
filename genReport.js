const form = document.querySelector("#report-form");
const statusMessage = document.querySelector("#status");

const pad2 = (value) => String(value).padStart(2, "0");

function getDateParts(dateValue) {
  const [year, month, day] = dateValue.split("-");
  return { year, month, day };
}

function formatDate(dateValue) {
  const { year, month, day } = getDateParts(dateValue);
  return `${day}/${month}/${year}`;
}

const folioCounters = new Map();

function createFolio(dateValue) {
  const [year, month, day] = dateValue.split("-");
  const dateCode = `${day}${month}${year.slice(-2)}`;
  const storageKey = `reportes-tt-${dateCode}`;

  let nextNumber;

  try {
    nextNumber = Number(localStorage.getItem(storageKey) || 0) + 1;
    localStorage.setItem(storageKey, String(nextNumber));
  } catch {
    // Respaldo para navegadores que bloquean localStorage en archivos locales.
    nextNumber = (folioCounters.get(dateCode) || 0) + 1;
    folioCounters.set(dateCode, nextNumber);
  }

  return `R-TT-${dateCode}-${String(nextNumber).padStart(2, "0")}`;
}

function setCurrentDateAndTime() {
  const now = new Date();

  form.elements.fecha.value =
    `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;

  form.elements.hora.value =
    `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
}

function generarPDF(report) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  // Encabezado
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(24, 61, 66);
  doc.text("Reporte de inspección:", 18, 24);
  doc.text("Tratamientos Termicos", 18, 34);

  // Folio
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(18, 105, 95);
  doc.text(`Folio: ${report.folio}`, 18, 45);

  // Tabla con los datos
  doc.autoTable({
    startY: 55,
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
      fillColor: [24, 61, 66],
      textColor: 255,
      fontStyle: "bold",
    },
    styles: {
      font: "helvetica",
      fontSize: 10,
      textColor: [43, 64, 66],
      lineColor: [225, 233, 230],
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [246, 249, 247],
    },
    columnStyles: {
      0: { cellWidth: 82, fontStyle: "bold" },
    },
    margin: { left: 18, right: 18 },
  });

  // Pie de página
  doc.setFontSize(8);
  doc.setTextColor(104, 125, 125);
  doc.text(
    "Documento generado automáticamente",
    pageWidth / 2,
    285,
    { align: "center" }
  );

  // Descarga directa del PDF
  doc.save(`${report.folio}.pdf`);
}

setCurrentDateAndTime();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  statusMessage.classList.remove("error");
  statusMessage.textContent = "";

  if (!form.reportValidity()) return;

  if (!window.jspdf?.jsPDF) {
    statusMessage.textContent =
      "No se cargó jsPDF. Recarga la página y revisa tu conexión a internet.";
    statusMessage.classList.add("error");
    return;
  }

  const report = Object.fromEntries(new FormData(form).entries());
  report.empleado = report.empleado.trim();
  report.folio = createFolio(report.fecha);

  try {
    generarPDF(report);
    statusMessage.textContent = `Descarga iniciada: ${report.folio}.pdf`;
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    statusMessage.textContent =
      `Error al generar el PDF: ${error.message}`;
    statusMessage.classList.add("error");
  }
});
