import { Router, Request, Response } from 'express';
import multer from 'multer';
import { parseExcelFileWithImages } from '../utils/excelParser';
import { db } from '../adminConfig';
import { checkAdmin } from '../middleware/authMiddleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Fragen hochladen mit Admin-Prüfung
router.post(
  '/upload-questions/:courseId',
  checkAdmin,
  upload.single('file'),
  async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const file = req.file;

    if (!courseId || !file) {
      res.status(400).json({ error: 'Course ID and file are required.' });
      return;
    }

    try {
      const buffer = file.buffer;

      // Parse Excel-Datei mit Bildern
      const questions = await parseExcelFileWithImages(buffer);

      // Validierung: Jede Frage benötigt mindestens 4 Optionen und eine richtige Antwort
      const invalidQuestions = questions.filter(
        (q) => !q.question || q.options.length < 4 || !q.correctAnswer
      );

      if (invalidQuestions.length > 0) {
        res.status(400).json({
          error: 'Some questions are invalid. Each question must have at least four options and a correct answer.',
        });
        return;
      }

      // Firestore-Verweise
      const courseRef = db.collection('courses').doc(courseId);
      const questionsRef = courseRef.collection('questions');

      // Fragen speichern
      const batch = db.batch();
      questions.forEach((question) => {
        const questionRef = questionsRef.doc();
        batch.set(questionRef, {
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          imageUrl: question.imageBase64 || null,
        });
      });

      await batch.commit();

      res.status(200).json({ message: 'Questions uploaded successfully!', questions });
    } catch (error) {
      console.error('Error uploading questions:', error);
      res.status(500).json({ error: 'Failed to upload questions.' });
    }
  }
);

// Admin-Status eines Benutzers überprüfen
router.get('/isAdmin/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    res.status(400).json({ error: 'User ID is required.' });
    return;
  }

  try {
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const userData = userDoc.data();
    if (userData?.role === 'admin') {
      res.status(200).json({ isAdmin: true });
    } else {
      res.status(200).json({ isAdmin: false });
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ error: 'Failed to check admin status.' });
  }
});

export default router;
