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
  image?: string;
}

function AdminCourseManagement() {
  const { courseId } = useParams<{ courseId: string }>();
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [courseDescription, setCourseDescription] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newOptions, setNewOptions] = useState<string[]>(['', '', '', '']);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState<string>('');

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
        const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
        console.error('Fehler beim Abrufen der Kursdetails:', errorMessage);
        setUploadStatus('Fehler beim Abrufen der Kursdetails.');
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  const handleUploadFile = async () => {
    if (!file || !courseId) {
      setUploadStatus('Bitte wählen Sie eine Datei und einen Kurs aus.');
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
        const errorData = await response.json();
        setUploadStatus(`Fehler beim Hochladen: ${errorData.message}`);
        return;
      }

      const result = await response.json();
      setUploadStatus('Fragen erfolgreich hochgeladen!');
      setQuestions((prev) => [...prev, ...result.questions]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      console.error('Fehler beim Hochladen der Datei:', errorMessage);
      setUploadStatus('Fehler beim Hochladen. Bitte versuchen Sie es erneut.');
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.trim() || newOptions.some((opt) => !opt.trim()) || !newCorrectAnswer.trim()) {
      alert('Bitte geben Sie eine gültige Frage, Optionen und eine richtige Antwort ein.');
      return;
    }

    try {
      const questionData = {
        question: newQuestion.trim(),
        options: newOptions.map((opt) => opt.trim()),
        correctAnswer: newCorrectAnswer.trim(),
      };

      const questionRef = await addDoc(collection(db, `courses/${courseId}/questions`), questionData);
      setQuestions((prev) => [...prev, { id: questionRef.id, ...questionData }]);
      setNewQuestion('');
      setNewOptions(['', '', '', '']);
      setNewCorrectAnswer('');
      alert('Frage erfolgreich hinzugefügt!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      console.error('Fehler beim Hinzufügen der Frage:', errorMessage);
      alert('Fehler beim Hinzufügen der Frage.');
    }
  };

  return (
    <div className="admin-course-container">
      <header>
        <h1>Kursmanagement</h1>
        <p><strong>Kurs:</strong> {courseTitle}</p>
        <p><strong>Beschreibung:</strong> {courseDescription}</p>
      </header>

      <section className="upload-section">
        <h2>Fragen hochladen</h2>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={handleUploadFile}>Hochladen</button>
        {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
      </section>

      <section className="manual-add-section">
        <h2>Neue Frage hinzufügen</h2>
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
        <button onClick={handleAddQuestion}>Frage hinzufügen</button>
      </section>

      <section className="questions-section">
        <h2>Vorhandene Fragen</h2>
        <ul>
          {questions.map((question) => (
            <li key={question.id}>
              <p>{question.question}</p>
              {question.image && (
                <img src={`data:image/png;base64,${question.image}`} alt="Frage-Bild" />
              )}
              <ul>
                {question.options.map((option, index) => (
                  <li key={index}>{option}</li>
                ))}
              </ul>
              <p><strong>Richtige Antwort:</strong> {question.correctAnswer}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default AdminCourseManagement;
