import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid'; // For generating unique file names

interface ParsedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  imageFile?: File;
}

// export const parseExcelFile = (file: File): Promise<ParsedQuestion[]> => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       try {
//         const workbook = XLSX.read(e.target?.result, { type: 'binary' });
//         const sheet = workbook.Sheets[workbook.SheetNames[0]];
//         const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];

//         const questions: ParsedQuestion[] = rows.slice(1).map((row) => ({
//           question: row[0]?.trim() || '',
//           options: [row[1]?.trim(), row[2]?.trim(), row[3]?.trim(), row[4]?.trim()].filter(Boolean),
//           correctAnswer: row[5]?.trim() || '',
//           imageFile: row[6] ? new File([row[6]], `${uuidv4()}.png`, { type: 'image/png' }) : undefined, // If image exists
//         }));

//         resolve(questions);
//       } catch (error) {
//         reject(error);
//       }
//     };
//     reader.onerror = (error) => reject(error);
//     reader.readAsBinaryString(file);
//   });
// };

export const parseExcelFile = async (file: File): Promise<ParsedQuestion[]> => {
  const workbook = XLSX.read(file, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
  const filteredRows = rows.filter(row => row.length > 0);

  const questions = filteredRows.map(row => {
    // Need to figure out how to get the image out of a cell in xlsx file
    // https://github.com/SheetJS/sheetjs/issues/1492
    let imageFile = '?';

    return {
      question: row[0],
      options: row.slice(1, 5),
      correctAnswer: row[5],
      imageFile: undefined
    }
  });

  return questions;
}