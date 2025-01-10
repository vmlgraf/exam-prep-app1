import express from 'express';
import multer from 'multer';
import { parseExcelFileWithImages } from '../utils/excelParser'; // Verwende den Parser
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

    // Parse the Excel file
    const questions = await parseExcelFileWithImages(fileBuffer);

    if (questions.length === 0) {
      res.status(400).json({ error: 'No valid questions found in the uploaded file.' });
      return;
    }

    const courseRef = db.collection('courses').doc(courseId);
    const questionsRef = courseRef.collection('questions');

    // Save each question to Firestore
    const questionUploadPromises = questions.map(async (question) => {
      const { question: questionText, options, correctAnswer, imageUrl } = question;
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
