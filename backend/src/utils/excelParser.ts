import * as XLSX from 'xlsx';

interface ParsedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export const parseExcelFile = (buffer: Buffer): ParsedQuestion[] => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | undefined)[][];

  
  return rows.slice(1).map((row) => ({
    question: typeof row[0] === 'string' ? row[0].trim() : '',
    options: [
      typeof row[1] === 'string' ? row[1].trim() : '',
      typeof row[2] === 'string' ? row[2].trim() : '',
      typeof row[3] === 'string' ? row[3].trim() : '',
      typeof row[4] === 'string' ? row[4].trim() : '',
    ].filter(Boolean), 
    correctAnswer: typeof row[5] === 'string' ? row[5].trim() : '',
  })).filter((q) => q.question && q.options.length >= 2 && q.correctAnswer); 
};
