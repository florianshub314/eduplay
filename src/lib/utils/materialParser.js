import { browser } from "$app/environment";

let pdfjsPromise;

async function loadPdfJs() {
  if (!browser) return null;

  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
      const workerSrc = await import(
        "pdfjs-dist/build/pdf.worker.mjs?url"
      ).then((mod) => mod.default);
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
      return pdfjs;
    })();
  }

  return pdfjsPromise;
}

async function extractTextFromPdf(file) {
  const pdfjs = await loadPdfJs();
  if (!pdfjs) {
    throw new Error("PDF-Verarbeitung ist nur im Browser verfügbar.");
  }

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  let content = "";

  for (let page = 1; page <= pdf.numPages; page += 1) {
    const pageData = await pdf.getPage(page);
    const textContent = await pageData.getTextContent();
    const pageText = textContent.items
      .map((item) => item.str)
      .join(" ")
      .trim();
    if (pageText) {
      content += `${pageText}\n`;
    }
  }

  return content;
}

function isPdfFile(file) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return (
    file.type === "application/pdf" ||
    file.type === "application/x-pdf" ||
    extension === "pdf"
  );
}

async function extractTextFromFile(file) {
  if (!file) throw new Error("Keine Datei gewählt.");

  if (isPdfFile(file)) {
    return extractTextFromPdf(file);
  }

  return file.text();
}

export async function parseMaterialFile(file) {
  const text = await extractTextFromFile(file);
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0);

  return {
    text,
    lines,
    isPdf: isPdfFile(file)
  };
}

export async function readMaterialLines(file) {
  const parsed = await parseMaterialFile(file);
  return parsed.lines;
}

export function buildMaterialSnippet(lines = [], maxChars = 4000) {
  if (!Array.isArray(lines) || lines.length === 0) return "";
  const combined = lines.join("\n");
  if (combined.length <= maxChars) return combined;
  return combined.slice(0, maxChars);
}

export { isPdfFile };
