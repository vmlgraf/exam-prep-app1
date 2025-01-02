import { useState } from 'react';
import { db } from '../firebaseConfig';
import { doc, addDoc, collection } from 'firebase/firestore';
import '../styles/QuestionManagement.css'

function QuestionManagement({ courseId }: { courseId: string }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleAddQuestion = async () => {
    if (!question || options.length < 3 || !correctAnswer) {
      alert('Provide a valid question, at least 3 options, and a correct answer');
      return;
    }

    try {
      const courseRef = doc(db, 'courses', courseId);
      await addDoc(collection(courseRef, 'questions'), { question, options, correctAnswer });
      setQuestion('');
      setOptions([]);
      setCorrectAnswer('');
      alert('Question added successfully!');
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Failed to add question');
    }
  };

  const handleUploadFile = async () => {
    if (!file) {
      alert('Select a file');
      return;
    }
  };

  return (
    <div>
      <h3>Manage Questions for Course: {courseId}</h3>

      <div>
        <h4>Add Question</h4>
        <input
          type="text"
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <input
          type="text"
          placeholder="Option 1"
          onChange={(e) => setOptions((opts) => [...opts, e.target.value])}
        />
        <input
          type="text"
          placeholder="Correct Answer"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
        />
        <button onClick={handleAddQuestion}>Add Question</button>
      </div>

      <div>
        <h4>Upload Questions (Excel)</h4>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={handleUploadFile}>Upload</button>
      </div>
    </div>
  );
}

export default QuestionManagement;
