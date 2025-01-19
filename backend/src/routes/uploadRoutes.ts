import express from 'express';
import multer from 'multer';
import { parseExcelFileWithImages } from '../utils/excelParser'; // Parser für Excel-Dateien
import { db } from '../adminConfig';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-questions/:courseId', upload.single('file'), async (req, res): Promise<void> => {
  const { courseId } = req.params;

  if (!req.file || !courseId) {
    res.status(400).json({ error: 'Course ID and file are required.' });
    return;
  }

  try {
    const fileBuffer = req.file.buffer;

    // Parse das Excel-File
    const questions = await parseExcelFileWithImages(fileBuffer);

    if (!questions || questions.length === 0) {
      res.status(400).json({ error: 'No valid questions found in the uploaded file.' });
      return;
    }

    const courseRef = db.collection('courses').doc(courseId);
    const questionsRef = courseRef.collection('questions');

    // Jede Frage speichern
    const questionUploadPromises = questions.map(async (question) => {
      // Überprüfung, ob Felder korrekt sind
      const { question: questionText, options, correctAnswer, imageUrl } = question;

      if (!questionText || options.length < 4 || !correctAnswer) {
        throw new Error('Invalid question format in the file.');
      }

      return questionsRef.add({
        question: questionText,
        options,
        correctAnswer,
        imageUrl: imageUrl || null,
      });
    });

    await Promise.all(questionUploadPromises);

    res.status(200).json({
      message: 'Questions and images uploaded successfully!',
      questions,
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: 'Failed to process questions and images.' });
  }
});

export default router;
