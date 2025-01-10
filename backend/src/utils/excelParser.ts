import ExcelJS from 'exceljs';
import { v4 as uuidv4 } from 'uuid';
import { bucket } from '../adminConfig'; // Firebase Storage

interface ParsedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  imageUrl?: string;
}

export const parseExcelFileWithImages = async (fileBuffer: Buffer): Promise<ParsedQuestion[]> => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);

    const worksheet = workbook.worksheets[0];
    const parsedQuestions: ParsedQuestion[] = [];

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);

      let questionText = row.getCell(1).value?.toString().trim() || '';
      const options = [
        row.getCell(2).value?.toString().trim() || '',
        row.getCell(3).value?.toString().trim() || '',
        row.getCell(4).value?.toString().trim() || '',
        row.getCell(5).value?.toString().trim() || '',
      ].filter(Boolean);
      const correctAnswer = row.getCell(6).value?.toString().trim() || '';
      const imageCell = row.getCell(7).value; // Assuming column 7 contains the image as base64 or Buffer

      if (!questionText || options.length < 4 || !['A', 'B', 'C', 'D'].includes(correctAnswer)) {
        console.warn(`Skipping invalid row ${i}:`, { questionText, options, correctAnswer });
        continue;
      }

      let imageUrl = '';
      if (imageCell) {
        const imageBuffer = Buffer.isBuffer(imageCell)
          ? imageCell
          : Buffer.from(imageCell.toString(), 'base64'); // Handle base64 or buffer
        const destination = `questions/images/${uuidv4()}.png`;
        imageUrl = await uploadImageToStorage(imageBuffer, destination);
      }

      parsedQuestions.push({
        question: questionText,
        options,
        correctAnswer,
        imageUrl,
      });
    }

    if (parsedQuestions.length === 0) {
      throw new Error('No valid questions found in the Excel file.');
    }

    return parsedQuestions;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw error;
  }
};

// Function to upload images to Firebase Storage
const uploadImageToStorage = async (imageBuffer: Buffer, destination: string): Promise<string> => {
  try {
    const file = bucket.file(destination);
    await file.save(imageBuffer, { contentType: 'image/png' });
    console.log(`File uploaded to ${destination}`);
    return `https://storage.googleapis.com/${bucket.name}/${destination}`;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image to Firebase Storage');
  }
};
