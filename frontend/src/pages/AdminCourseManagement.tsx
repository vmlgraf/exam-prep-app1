import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import '../styles/AdminCourseManagement.css';
import { deleteQuestion } from '../services/questionService';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  imageUrl?: string; 
}

function AdminCourseManagement() {
  const { courseId } = useParams<{ courseId: string }>();
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [courseDescription, setCourseDescription] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newOptions, setNewOptions] = useState<string[]>(['', '', '', '']);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) return;

      try {
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);

        if (courseSnap.exists()) {
          const courseData = courseSnap.data();
          setCourseTitle(courseData?.title || '');
          setCourseDescription(courseData?.description || '');

          // Fragen abrufen
          const questionsRef = collection(db, `courses/${courseId}/questions`);
          const questionsSnap = await getDocs(questionsRef);
          const questionsData = questionsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Question[];
          setQuestions(questionsData);
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
      }
    };
    window.scrollTo(0, 0);
    fetchCourseDetails();
  }, [courseId]);

  const handleUploadFile = async () => {
    if (!file || !courseId) {
      setUploadStatus('Please select a file.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`http://localhost:5000/api/upload-questions/${courseId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file.');
      }

      const result = await response.json();
      console.log('Uploaded Questions:', result.questions);
      setQuestions((prev) => [...prev, ...result.questions]);
      setUploadStatus('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('Error uploading file.');
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion || newOptions.some((opt) => !opt) || !newCorrectAnswer) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      const questionData = {
        question: newQuestion,
        options: newOptions,
        correctAnswer: newCorrectAnswer,
      };

      const questionRef = await addDoc(collection(db, `courses/${courseId}/questions`), questionData);
      setQuestions((prev) => [...prev, { id: questionRef.id, ...questionData }]);

      setNewQuestion('');
      setNewOptions(['', '', '', '']);
      setNewCorrectAnswer('');
      alert('Question added successfully!');
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm('Möchten Sie diese Frage wirklich löschen?')) return;
  
    try {
      if (courseId) {
        await deleteQuestion(courseId, questionId);
        setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== questionId));
        alert('Frage erfolgreich gelöscht.');
      }
    } catch (error) {
      console.error('Fehler beim Löschen der Frage:', error);
      alert('Fehler beim Löschen der Frage.');
    }
  };

  return (
    <div className="admin-course-container">
      <header>
        <h1>Kurse verwalten</h1>
        <p>
          <strong>Kurs:</strong> {courseTitle}
        </p>
        <p>
          <strong>Beschreibung:</strong> {courseDescription}
        </p>
      </header>

      <section>
        <h2>Excel File hochladen</h2>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={handleUploadFile}>Hochladen</button>
        {uploadStatus && <p>{uploadStatus}</p>}
      </section>

      <section>
        <h2>Frage hinzufügen</h2>
        <input
          type="text"
          placeholder="Frage"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)} maxLength={600}
        />
        {newOptions.map((opt, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Option ${index + 1}`}
            value={opt}
            onChange={(e) => {
              const updatedOptions = [...newOptions];
              updatedOptions[index] = e.target.value;
              setNewOptions(updatedOptions);
            }}
            maxLength={200}
          />
        ))}
        <select
          value={newCorrectAnswer}
          onChange={(e) => setNewCorrectAnswer(e.target.value)}
          className="dropdown"
        >
          <option value="" disabled>
            Wähle die korrekte Antwort
          </option>
          {newOptions.map((_, index) => (
            <option key={index} value={String.fromCharCode(65 + index)}>
              {`Option ${index + 1}`}
            </option>
          ))}
        </select>
        <button onClick={handleAddQuestion}>Frage hinzufügen</button>
      </section>

      <section>
        <h2>Frage Liste</h2>
        {questions.length === 0 ? (
          <p>Es sind keine Fragen in dem Kurs vorhanden.</p>
        ) : (
          <ul>
            {questions.map((question) => (
              <li key={question.id}>
                <p>{question.question}</p>
                {question.imageUrl && (
                  <img
                    src={question.imageUrl}
                    alt="Question"
                    style={{ maxWidth: '100%', maxHeight: '300px' }}
                  />
                )}
                <ul>
                  {question.options.map((option, index) => (
                    <li key={index}>{option}</li>
                  ))}
                </ul>
                <p>
                  <strong>Korrekte Antwort:</strong> {question.correctAnswer}
                </p>
                <button onClick={() => handleDeleteQuestion(question.id)} className="delete-button">
                  Frage löschen
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default AdminCourseManagement;
