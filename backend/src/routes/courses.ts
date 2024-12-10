import { Router } from 'express';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

const router = Router();

// Get all courses
router.get('/', async (_, res) => {
  try {
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    const courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Add a new course
router.post('/', async (req, res) => {
  const { title, description } = req.body;
  try {
    const newCourse = await addDoc(collection(db, 'courses'), { title, description });
    res.status(201).json({ id: newCourse.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add course' });
  }
});

// Delete a course
router.delete('/:id', async (req, res) => {
  try {
    await deleteDoc(doc(db, 'courses', req.params.id));
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

export default router;
