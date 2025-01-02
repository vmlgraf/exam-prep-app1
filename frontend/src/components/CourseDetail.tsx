import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import '../styles/CourseDetail.css'

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<{ title: string; description: string } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) return;
      const courseRef = doc(db, 'courses', courseId);
      const courseSnapshot = await getDoc(courseRef);
      if (courseSnapshot.exists()) {
        setCourse(courseSnapshot.data() as { title: string; description: string });
      }

      const questionsRef = collection(db, `courses/${courseId}/questions`);
      const questionsSnapshot = await getDocs(questionsRef);
      const questionsData = questionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Question[];
      setQuestions(questionsData);
    };

    fetchCourseDetails();
  }, [courseId]);

  const handleModeSelection = (mode: 'practice' | 'exam' | 'review') => {
    navigate(`/courses/${courseId}/modes/${mode}`, { state: { questions } });
  };

  return (
    <div className="course-detail-container">
      {course ? (
        <>
          <h2>{course.title}</h2>
          <p>{course.description}</p>
          <div className="mode-selection">
            <h3>Select a Learning Mode:</h3>
            <button onClick={() => handleModeSelection('practice')}>Practice Mode</button>
            <button onClick={() => handleModeSelection('exam')}>Exam Mode</button>
            <button onClick={() => handleModeSelection('review')}>Review Mode</button>
          </div>
        </>
      ) : (
        <p>Loading course details...</p>
      )}
    </div>
  );
}

export default CourseDetail;
