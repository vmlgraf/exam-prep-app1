import express from 'express';
import multer from 'multer';
import { parseExcelFile } from '../utils/excelParser';
import { db } from '../adminConfig';

const router = express.Router();
const upload = multer(); 


router.post('/upload-questions/:courseId', upload.single('file'), async (req, res): Promise<void> => {
  const { courseId } = req.params;

  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded.' });
    return;
  }

  try {
    const questions = parseExcelFile(req.file.buffer);

    if (questions.length === 0) {
      res.status(400).json({
        message: 'Validation failed: No valid questions found in the uploaded file.',
      });
      return;
    }

    // Speichere Fragen in Firestore
    const questionsRef = db.collection(`courses/${courseId}/questions`);
    const addedQuestions = [];

    for (const question of questions) {
      const questionData = {
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
      };
      const docRef = await questionsRef.add(questionData);
      addedQuestions.push({ id: docRef.id, ...questionData });
    }

    res.status(200).json({
      message: 'Questions uploaded successfully!',
      questions: addedQuestions,
    });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
