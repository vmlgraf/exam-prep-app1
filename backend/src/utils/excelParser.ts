import ExcelJS from 'exceljs';
import { v4 as uuidv4 } from 'uuid';
import { bucket } from '../adminConfig'; 
import { error } from 'console';

interface ParsedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  imageBase64?: string;
}

export const parseExcelFileWithImages = async (fileBuffer: Buffer): Promise<ParsedQuestion[]> => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);

    const worksheet = workbook.worksheets[0];
    const parsedQuestions: ParsedQuestion[] = [];

    const imageMap = new Map<number, {range: { tl: {row: number; col: number}; br: {row: number; col: number}}; base64: string }> ();
    worksheet.getImages().forEach((image) => {
      const { range } = image;
      const imageId = parseInt(image.imageId, 10);
      if (isNaN(imageId)) {
       console.error('Invalid image ID: ${image.imageId}');
       return;
      }
      const media = workbook.model.media[imageId];
      if (media) {
        const base64Image = `data:image/${media.extension};base64,${Buffer.from(media.buffer).toString('base64')}`;
        console.log(`Image ID: ${imageId}, Row: ${range.tl.row}, Col: ${range.tl.col}`);
        imageMap.set(imageId, {range, base64: base64Image});
      }
    });
    

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      let questionText = row.getCell(1).value?.toString().trim() || '';
  
      let imageBase64 = '';
      
      for (const [imageId, { range, base64 }] of imageMap.entries()) {
        const roudedRow = Math.round(range.tl.row) + 1;
        if (roudedRow === i) {
          console.log(`Assigning image at row ${i}`);
          imageBase64 = base64;
        
          
        
      const multilineBreaksRegex = /(\n\s*\n)/g;
      if (multilineBreaksRegex.test(questionText)) {
        questionText = questionText.replace(multilineBreaksRegex, `<img-placeholder>\n`);
      } else {
        
        questionText += '\n<img-placeholder>';
      }

      imageMap.delete(imageId); 
      break;
    }
  }

      const options = [
        row.getCell(2).value?.toString().trim() || '',
        row.getCell(3).value?.toString().trim() || '',
        row.getCell(4).value?.toString().trim() || '',
        row.getCell(5).value?.toString().trim() || '',
      ].filter((opt) => opt.length > 0);
      const correctAnswer = row.getCell(6).value?.toString().trim() || '';
      

      if (!questionText || options.length !== 4 || !['A', 'B', 'C', 'D'].includes(correctAnswer)) {
        
        continue;
      }
    
if (imageBase64) {
  console.log(`Image assigned to question at row ${i}: ${imageBase64.substring(0, 30)}...`);
}


      parsedQuestions.push({
        question: questionText + (imageBase64 ? '<img-placeholder>' : ''),
        options,
        correctAnswer,
        imageBase64,
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