import { Router, Request, Response } from 'express';
import multer from 'multer';
import { parseExcelFile } from '../utils/excelParser';
import { db } from '../adminConfig';
import { checkAdmin } from '../middleware/authMiddleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/create-course', checkAdmin, async (req: Request, res: Response): Promise<void> => {
  const { title, description } = req.body;

  if (!title || !description) {
    res.status(400).json({ error: 'Title and description are required' });
    return;
  }

  try {
    const courseRef = await db.collection('courses').add({ title, description });
    res.status(201).json({ message: 'Course created successfully!', id: courseRef.id });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});


router.patch('/update-course/:courseId', checkAdmin, async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const { title, description } = req.body;

  if (!title && !description) {
    res.status(400).json({ error: 'At least one field (title or description) is required' });
    return;
  }

  try {
    const courseRef = db.collection('courses').doc(courseId);
    await courseRef.update({ ...(title && { title }), ...(description && { description }) });
    res.status(200).json({ message: 'Course updated successfully!' });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

//Fragen hochladen (Excel)
router.post('api/upload-questions/:courseId', checkAdmin, upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const file = req.file;

  if (!courseId || !file) {
    res.status(400).json({ error: 'Course ID and file are required' });
    return;
  }

  try {
    const questions = parseExcelFile(file.buffer);

    const invalidQuestions = questions.filter(q => !q.question || q.options.length < 1 || !q.correctAnswer);
    if (invalidQuestions.length > 0) {
      res.status(400).json({ error: 'Some questions are invalid. Each question must have at least one option and a correct answer.' });
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

//Frage manuell hinzufügen
router.post('/add-question/:courseId', checkAdmin, async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const { question, options, correctAnswer } = req.body;

  if (!question || !options || !correctAnswer) {
    res.status(400).json({ error: 'Question, options, and correct answer are required' });
    return;
  }

  try {
    const courseRef = db.collection('courses').doc(courseId);
    await courseRef.collection('questions').add({ question, options, correctAnswer });
    res.status(201).json({ message: 'Question added successfully!' });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ error: 'Failed to add question' });
  }
});

export default router;
