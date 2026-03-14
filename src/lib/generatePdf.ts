/**
 * Generates a PDF by opening a dedicated print window with the invoice HTML.
 * The filename (trainer name + invoice number) is set as the document title,
 * which browsers use as the default filename when saving as PDF.
 * This uses the browser's native print engine (not html2canvas), which always
 * renders fonts and layout identically to the live preview.
 *
 * The user will see a "Print" dialog — they should choose "Save as PDF" as the
 * destination. The window will close automatically after printing/cancelling.
 */
export async function generatePDF(
  element: HTMLElement,
  filename: string
): Promise<void> {
  // Serialize the invoice element's outerHTML
  const invoiceHTML = element.outerHTML;

  // Strip .pdf extension for the document title (browser adds its own)
  const title = filename.replace(/\.pdf$/i, "");

  // Build a self-contained HTML document for printing
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
  />
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 210mm;
      margin: 0 auto;
      background: white;
      font-family: 'Inter', 'Helvetica', sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Override the fixed px width used for on-screen preview */
    body > div {
      width: 210mm !important;
      min-height: 297mm !important;
      padding: 20mm !important;
    }

    @page {
      size: A4 portrait;
      margin: 0;
    }

    @media print {
      html, body {
        width: 210mm;
        height: 297mm;
      }
    }
  </style>
</head>
<body>
  ${invoiceHTML}
  <script>
    // Wait for Inter font to load, then print
    document.fonts.ready.then(function () {
      window.print();
      // Close the print window after the dialog is dismissed
      window.addEventListener('afterprint', function () {
        window.close();
      });
    });
  </script>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    alert("Please allow pop-ups for this site to download the invoice PDF.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
