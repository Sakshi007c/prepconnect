import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf.mjs';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { buildQuestionsFromText } from './experienceAnalysis';

GlobalWorkerOptions.workerSrc = pdfWorker;

export const extractTextFromPdf = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const pageTexts = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (pageText) {
      pageTexts.push(pageText);
    }
  }

  return pageTexts.join('\n');
};

export const extractQuestionsFromPdf = async (file) => {
  const text = await extractTextFromPdf(file);
  return {
    text,
    questions: buildQuestionsFromText(text, 'pdf')
  };
};
