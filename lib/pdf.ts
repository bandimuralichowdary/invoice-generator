// lib/pdf.ts
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportInvoicePDF(elementId: string, fileName = 'invoice.pdf') {
  const el = document.getElementById(elementId);
  if (!el) throw new Error('Element not found: ' + elementId);
  const canvas = await html2canvas(el, { scale: 2, useCORS: true });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgHeight = (canvas.height * pageWidth) / canvas.width;
  pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);
  pdf.save(fileName);
}
