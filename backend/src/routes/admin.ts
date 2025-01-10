import { Router, Request, Response } from 'express';
import multer from 'multer';
import { parseExcelFileWithImages } from '../utils/excelParser'; // Importiere die korrekte Funktion
import { db } from '../adminConfig';
import { checkAdmin } from '../middleware/authMiddleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/api/upload-questions/:courseId', checkAdmin, upload.single('file'), async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const file = req.file;

  if (!courseId || !file) {
    res.status(400).json({ error: 'Course ID and file are required' });
    return;
  }

  try {
    // Buffer bleibt Buffer, keine Konvertierung zu ArrayBuffer
    const buffer = file.buffer;

    // Übergib den Buffer direkt an die Funktion
    const questions = await parseExcelFileWithImages(buffer);

    const invalidQuestions = questions.filter(
      (q: { question: string; options: string[]; correctAnswer: string }) =>
        !q.question || q.options.length < 1 || !q.correctAnswer
    );
    if (invalidQuestions.length > 0) {
      res.status(400).json({
        error:
          'Some questions are invalid. Each question must have at least one option and a correct answer.',
      });
      return;
    }

    const courseRef = db.collection('courses').doc(courseId);
    const questionsRef = courseRef.collection('questions');

    for (const question of questions) {
      await questionsRef.add(question);
    }

    res.status(200).json({ message: 'Questions uploaded successfully!' });
  } catch (error) {
    console.error('Error uploading questions:', error);
    res.status(500).json({ error: 'Failed to upload questions' });
  }
});

export default router;
