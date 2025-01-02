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
        console.error('Error fetching course details:', error);
        setUploadStatus('Failed to fetch course details.');
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  
const handleUploadFile = async () => {
    if (!file || !courseId) {
      setUploadStatus('Please select a file and ensure a course is selected.');
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
        setUploadStatus(`Upload failed: ${errorData.message}`);
        return;
      }
  
      
      const result = await response.json();
      setUploadStatus('Questions uploaded successfully!');
      setQuestions((prev) => [...prev, ...result.questions]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error uploading file:', error.message);
        setUploadStatus('Upload failed. Please try again.');
      } else {
        console.error('Unknown error occurred:', error);
        setUploadStatus('An unexpected error occurred. Please try again.');
      }
    }
  };
  

  const handleAddQuestion = async () => {
    if (!newQuestion.trim() || newOptions.some((opt) => !opt.trim()) || !newCorrectAnswer.trim()) {
      alert('Please provide a valid question, options, and a correct answer.');
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
      alert('Question added successfully!');
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Failed to add question.');
    }
  };

  return (
    <div className="admin-course-container">
      <header>
        <h1>Course Management</h1>
        <p><strong>Course:</strong> {courseTitle}</p>
        <p><strong>Description:</strong> {courseDescription}</p>
      </header>

      <section className="upload-section">
        <h2>Upload Questions</h2>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={handleUploadFile}>Upload</button>
        {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
      </section>

      <section className="manual-add-section">
        <h2>Add New Question</h2>
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

      <section className="questions-section">
        <h2>Existing Questions</h2>
        <ul>
          {questions.map((question) => (
            <li key={question.id}>
              <p>{question.question}</p>
              <ul>
                {question.options.map((option, index) => (
                  <li key={index}>{option}</li>
                ))}
              </ul>
              <p><strong>Correct Answer:</strong> {question.correctAnswer}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default AdminCourseManagement;
