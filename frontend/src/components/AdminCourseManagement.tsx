import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/AdminCourseManagement.css';
import { collection, doc, getDoc, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  imageUrl?: string; // URL des Bildes
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

    fetchCourseDetails();
  }, [courseId]);

  const handleUploadFile = async () => {
    if (!file || !courseId) {
      setUploadStatus('Bitte wählen Sie eine Datei aus.');
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
        throw new Error('Fehler beim Hochladen der Datei');
      }

      const result = await response.json();
      setQuestions((prev) => [...prev, ...result.questions]);
      setUploadStatus('Datei erfolgreich hochgeladen!');
    } catch (error) {
      console.error('Fehler beim Hochladen:', error);
      setUploadStatus('Fehler beim Hochladen.');
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion || newOptions.some((opt) => !opt) || !newCorrectAnswer) {
      alert('Bitte füllen Sie alle Felder aus.');
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
      alert('Frage erfolgreich hinzugefügt!');
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
    }
  };

  return (
    <div className="admin-course-container">
      <header>
        <h1>Kursmanagement</h1>
        <p>
          <strong>Kurs:</strong> {courseTitle}
        </p>
        <p>
          <strong>Beschreibung:</strong> {courseDescription}
        </p>
      </header>

      {/* Datei-Upload */}
      <section>
        <h2>Excel-Datei hochladen</h2>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={handleUploadFile}>Hochladen</button>
        {uploadStatus && <p>{uploadStatus}</p>}
      </section>

      {/* Manuelles Hinzufügen */}
      <section>
        <h2>Frage hinzufügen</h2>
        <input
          type="text"
          placeholder="Frage"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
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
          />
        ))}
        <input
          type="text"
          placeholder="Richtige Antwort"
          value={newCorrectAnswer}
          onChange={(e) => setNewCorrectAnswer(e.target.value)}
        />
        <button onClick={handleAddQuestion}>Hinzufügen</button>
      </section>

      {/* Fragen anzeigen */}
      <section className="questions-section">
        <h2>Fragen</h2>
        <ul>
          {questions.map((question) => (
            <li key={question.id}>
              <p>{question.question}</p>
              {question.imageUrl && (
                <img
                  src={question.imageUrl}
                  alt="Bild zur Frage"
                  style={{ maxWidth: '100%', maxHeight: '300px' }}
                />
              )}
              <ul>
                {question.options.map((option, index) => (
                  <li key={index}>{option}</li>
                ))}
              </ul>
              <p>
                <strong>Richtige Antwort:</strong> {question.correctAnswer}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default AdminCourseManagement;
