import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateInvoicePDF = (payment, project) => {
  const dir = "invoices";
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const filePath = `${dir}/invoice-${payment.invoiceNo}.pdf`;

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text("YarrowTech Invoice", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Invoice No: ${payment.invoiceNo}`);
  doc.text(`Project: ${project.name}`);
  doc.text(`Client Email: ${payment.clientEmail}`);
  doc.text(`Amount Paid: ₹${payment.amount}`);
  doc.text(`Payment Method: ${payment.method}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);

  doc.end();

  return path.resolve(filePath);
};
