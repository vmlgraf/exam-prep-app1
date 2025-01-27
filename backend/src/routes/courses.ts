import { Router, Request, Response } from 'express';
import { db } from '../adminConfig';

const router = Router();

// Alle Kurse abrufen
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection('courses').get();
    const courses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
});

// Neuen Kurs hinzufügen
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { title, description } = req.body;

  if (!title || !description) {
    res.status(400).json({ error: 'Title and description are required.' });
    return;
  }

  try {
    const courseRef = db.collection('courses').doc();
    await courseRef.set({
      title,
      description,
      createdAt: new Date(),
    });

    res.status(201).json({ id: courseRef.id, title, description });
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ error: 'Failed to add course.' });
  }
});

// Bestehender Kursdetails-Endpunkt
router.get('/:courseId', async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;

  try {
    const courseDoc = await db.collection('courses').doc(courseId).get();

    if (!courseDoc.exists) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    res.status(200).json({ id: courseDoc.id, ...courseDoc.data() });
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

// Kurs bearbeiten
router.patch('/:courseId', async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const { title, description } = req.body;

  if (!title && !description) {
    res.status(400).json({ error: 'At least one of title or description is required.' });
    return;
  }

  try {
    const courseRef = db.collection('courses').doc(courseId);
    const updateData: Record<string, any> = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;

    await courseRef.update(updateData);

    res.status(200).json({ message: 'Course updated successfully.' });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Failed to update course.' });
  }
});

// Kurs löschen
router.delete('/:courseId', async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;

  try {
    await db.collection('courses').doc(courseId).delete();
    res.status(200).json({ message: 'Course deleted successfully.' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course.' });
  }
});

export default router;
