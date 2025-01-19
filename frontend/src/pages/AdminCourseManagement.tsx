import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import '../styles/AdminCourseManagement.css';

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
        // Kursdetails abrufen
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

  return (
    <div className="admin-course-container">
      <header>
        <h1>Manage Course</h1>
        <p>
          <strong>Course:</strong> {courseTitle}
        </p>
        <p>
          <strong>Description:</strong> {courseDescription}
        </p>
      </header>

      {/* Datei-Upload */}
      <section>
        <h2>Upload Excel File</h2>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={handleUploadFile}>Upload</button>
        {uploadStatus && <p>{uploadStatus}</p>}
      </section>

      {/* Manuelles Hinzufügen */}
      <section>
        <h2>Add Question</h2>
        <input
          type="text"
          placeholder="Question"
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
          placeholder="Correct Answer"
          value={newCorrectAnswer}
          onChange={(e) => setNewCorrectAnswer(e.target.value)}
        />
        <button onClick={handleAddQuestion}>Add Question</button>
      </section>

      {/* Fragen anzeigen */}
      <section>
        <h2>Questions</h2>
        {questions.length === 0 ? (
          <p>No questions available for this course.</p>
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
                  <strong>Correct Answer:</strong> {question.correctAnswer}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default AdminCourseManagement;
