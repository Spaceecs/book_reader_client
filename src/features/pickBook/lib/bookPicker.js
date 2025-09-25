// Unified picker for epub and pdf (best-effort wrapper over existing pickers)
import { pickEpub } from "./epubPicker";
import { pickPdf } from "./pdfPicker";

/**
 * Try to pick an EPUB first, then PDF.
 * Returns { type: 'epub'|'pdf', data } or null.
 */
export async function pickBook() {
  try {
    if (typeof pickEpub === 'function') {
      const epub = await pickEpub();
      if (epub) return { type: 'epub', data: epub };
    }
  } catch (e) {
    // ignore
  }
  try {
    if (typeof pickPdf === 'function') {
      const pdf = await pickPdf();
      if (pdf) return { type: 'pdf', data: pdf };
    }
  } catch (e) {
    // ignore
  }
  return null;
}
