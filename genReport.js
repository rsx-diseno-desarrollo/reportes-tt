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
