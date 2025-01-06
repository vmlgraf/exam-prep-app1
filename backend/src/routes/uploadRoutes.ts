import express from 'express';
import multer from 'multer';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { parseExcelFile } from '../utils/excelParser';
import { db } from '../adminConfig';
import { collection, addDoc } from 'firebase/firestore';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-questions/:courseId', upload.single('file'), async (req, res) => {
  const { courseId } = req.params;

  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded.' });
    return;
  }

  try {
    const questions = await parseExcelFile(req.file.buffer); // Updated to pass buffer directly

    const storage = getStorage();
    const courseQuestionsRef = collection(db, `courses/${courseId}/questions`);
    const uploadedQuestions = [];

    for (const question of questions) {
      let imageUrl = '';
      if (question.imageFile) {
        const imageRef = ref(storage, `courses/${courseId}/images/${question.imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, question.imageFile); // Upload image buffer
        imageUrl = await getDownloadURL(snapshot.ref); // Get download URL
      }

      const questionDoc = {
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        imageUrl,
      };

      const docRef = await addDoc(courseQuestionsRef, questionDoc);
      uploadedQuestions.push({ id: docRef.id, ...questionDoc });
    }

    res.status(200).json({
      message: 'Questions uploaded successfully!',
      questions: uploadedQuestions,
    });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
