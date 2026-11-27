
import { useRef } from "react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

import CandidateDetails from "./pages/CandidateDetails";
import CandidatePDFReport from "./pages/CandidatePDFReport";

function App() {
  const reportRef = useRef(null);

  const handleDownloadReport = async () => {
    const reportElement = reportRef.current;

    if (!reportElement) return;

    // Open new tab immediately
    const pdfWindow = window.open("", "_blank");

    if (!pdfWindow) {
      alert("Please allow pop-ups for this website.");
      return;
    }

    pdfWindow.document.write("<h3>Generating PDF...</h3>");

    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollY: 0,
      });

      const imageData = canvas.toDataURL("image/jpeg", 0.98);

      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = 210;
      const pageHeight = 297;
      const imageHeight = (canvas.height * pageWidth) / canvas.width;

      pdf.addImage(
        imageData,
        "JPEG",
        0,
        0,
        pageWidth,
        Math.min(imageHeight, pageHeight)
      );

      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Open PDF viewer with download button
      pdfWindow.document.open();

      pdfWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Candidate PDF Report</title>
            <style>
              * {
                box-sizing: border-box;
              }

              body {
                margin: 0;
                font-family: Arial, sans-serif;
                background: #e2e8f0;
              }

              .toolbar {
                height: 60px;
                background: #ffffff;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 25px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }

              .toolbar h3 {
                margin: 0;
                color: #1e293b;
              }

              .download-btn {
                background: #2563eb;
                color: white;
                padding: 11px 20px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
              }

              iframe {
                width: 100%;
                height: calc(100vh - 60px);
                border: none;
              }
            </style>
          </head>

          <body>
            <div class="toolbar">
              <h3>Candidate PDF Report</h3>

              <a
                class="download-btn"
                href="${pdfUrl}"
                download="Candidate_Report.pdf"
              >
                Download PDF
              </a>
            </div>

            <iframe src="${pdfUrl}"></iframe>
          </body>
        </html>
      `);

      pdfWindow.document.close();

    } catch (error) {
      console.error("PDF generation failed:", error);
      pdfWindow.document.body.innerHTML =
        "<h3>Unable to generate PDF. Please try again.</h3>";
    }
  };

  return (
    <>
      <CandidateDetails onDownloadReport={handleDownloadReport} />

      <div className="pdf-render-area">
        <div ref={reportRef}>
          <CandidatePDFReport />
        </div>
      </div>
    </>
  );
}

export default App;
