// src/utils/pdfGenerator.js

import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateQuotationPDF = (quotation, photographerData) => {
  const doc = new jsPDF();

  // Add a header
  doc.setFontSize(20);
  doc.text('Quotation', 14, 22);

  // Add photographer and client details
  doc.setFontSize(12);
  doc.text(`From: ${photographerData.displayName || photographerData.email}`, 14, 40);
  doc.text(`To: ${quotation.clientEmail}`, 14, 46);
  doc.text(`Date: ${new Date(quotation.createdAt?.toDate()).toLocaleDateString()}`, 14, 52);
  
  doc.setFontSize(16);
  doc.text(`Subject: ${quotation.title}`, 14, 65);

  // Define the table columns and rows
  const tableColumn = ["#", "Service Description", "Price"];
  const tableRows = [];

  quotation.items.forEach((item, index) => {
    const itemData = [
      index + 1,
      item.title,
      `$${item.price.toFixed(2)}`
    ];
    tableRows.push(itemData);
  });

  // Add the table to the PDF
  doc.autoTable({
    startY: 75,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [22, 160, 133] },
  });

  // Add the total amount
  const finalY = doc.lastAutoTable.finalY || 100;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: $${quotation.totalPrice.toFixed(2)}`, 14, finalY + 15);
  
  // Add notes if they exist
  if(quotation.notes) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Notes:', 14, finalY + 25);
      const splitNotes = doc.splitTextToSize(quotation.notes, 180);
      doc.text(splitNotes, 14, finalY + 30);
  }

  // Save the PDF
  doc.save(`Quotation-${quotation.title}.pdf`);
};