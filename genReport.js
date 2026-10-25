const form = document.querySelector("#report-form");
const statusMessage = document.querySelector("#status");

const pad2 = (value) => String(value).padStart(2, "0");

function getDateParts(dateValue) {
  const [year, month, day] = dateValue.split("-");
  return { year, month, day };
}

function getFolio(dateValue) {
  const { year, month, day } = getDateParts(dateValue);
  const dateCode = `${day}${month}${year.slice(-2)}`;
  const storageKey = `reportes-tt-${dateCode}`;

  const nextNumber = Number(localStorage.getItem(storageKey) || 0) + 1;
  localStorage.setItem(storageKey, String(nextNumber));

  return `R-TT-${dateCode}-${String(nextNumber).padStart(2, "0")}`;
}

function formatDate(dateValue) {
  const { year, month, day } = getDateParts(dateValue);
  return `${day}/${month}/${year}`;
}

function setCurrentDateAndTime() {
  const now = new Date();

  form.elements.fecha.value =
    `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;

  form.elements.hora.value =
    `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
}

function createPdf(values, folio) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();

  pdf.setFillColor(24, 61, 66);
  pdf.rect(0, 0, pageWidth, 45, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("Reporte de inspección:", 18, 23);
  pdf.text("Tratamientos Termicos", 18, 33);

  pdf.setFontSize(8);
  pdf.text("CONTROL DE CALIDAD / REGISTRO DE INSPECCIÓN", 18, 40);

  pdf.setTextColor(18, 105, 95);
  pdf.setFontSize(10);
  pdf.text(`Folio: ${folio}`, 18, 57);

  pdf.autoTable({
    startY: 66,
    head: [["Dato de inspección", "Registro"]],
    body: [
      ["Fecha", formatDate(values.fecha)],
      ["Hora", values.hora],
      ["Empleado", values.empleado.trim()],
      ["Temp. de Austenizado Z1", `${values.z1} °C`],
      ["Temp. de Austenizado Z2", `${values.z2} °C`],
      ["Avance", `${values.avance} mm`],
      ["Ciclo", `${values.ciclo} seg`],
      ["Tiempo de Austenizado", `${values.tiempo} min`],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [24, 61, 66],
      textColor: 255,
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

  pdf.setFontSize(8);
  pdf.setTextColor(104, 125, 125);
  pdf.text("Documento generado digitalmente", pageWidth / 2, 281, {
    align: "center",
  });

  pdf.save(`${folio}.pdf`);
}

setCurrentDateAndTime();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  statusMessage.classList.remove("error");
  statusMessage.textContent = "";

  if (!form.reportValidity()) return;

  if (!window.jspdf?.jsPDF) {
    statusMessage.textContent =
      "No se pudo cargar el generador PDF. Revisa tu conexión e intenta de nuevo.";
    statusMessage.classList.add("error");
    return;
  }

  const values = Object.fromEntries(new FormData(form).entries());
  const folio = getFolio(values.fecha);

  createPdf(values, folio);
  statusMessage.textContent = `Reporte descargado: ${folio}.pdf`;
});
