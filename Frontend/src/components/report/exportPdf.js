// Client-side PDF export for P6.
// html-to-image renders the A4 sheet to a PNG (it works with Tailwind v4's
// oklch colours, unlike html2canvas), pdf-lib puts it on A4 pages.
// Both are loaded only when the user clicks Download.

const A4 = [595.28, 841.89]; // points

export async function exportElementToPdf(node, filename, title) {
  const [{ toPng }, { PDFDocument }] = await Promise.all([import("html-to-image"), import("pdf-lib")]);

  const options = { pixelRatio: 2, backgroundColor: "#ffffff", cacheBust: true };
  let dataUrl;
  try {
    dataUrl = await toPng(node, options);
  } catch {
    // web fonts from another origin can block embedding — retry without them
    dataUrl = await toPng(node, { ...options, skipFonts: true });
  }

  const pdf = await PDFDocument.create();
  if (title) pdf.setTitle(title);
  pdf.setCreator("ATS Resume Scorer");
  const png = await pdf.embedPng(dataUrl);

  // scale the image to the page width; long reports continue on more pages
  const imgHeight = (png.height * A4[0]) / png.width;
  const pages = Math.max(1, Math.ceil(imgHeight / A4[1] - 0.02));
  for (let i = 0; i < pages; i++) {
    const page = pdf.addPage(A4);
    page.drawImage(png, { x: 0, y: A4[1] - imgHeight + i * A4[1], width: A4[0], height: imgHeight });
  }

  const bytes = await pdf.save();
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
