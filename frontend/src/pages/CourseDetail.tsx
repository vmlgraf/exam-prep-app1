import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseDetails } from '../services/courseService';
import '../styles/CourseDetail.css';

function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<{ title: string; description: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!courseId) {
      setError('Course ID is missing.');
      return;
    }

    const loadCourseData = async () => {
      try {
        const courseData = await fetchCourseDetails(courseId);
        setCourse(courseData);
      } catch (err: any) {
        console.error('Failed to load course data:', err.message || err);
        setError(err.message || 'Failed to load course data.');
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [courseId]);

  const handleModeSelection = (mode: 'practice' | 'exam' | 'repeat') => {
    navigate(`/courses/${courseId}/modes`, { state: { mode } });
  };
  

  if (loading) return <p>Loading course details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="course-detail-container">
      {course ? (
        <>
          <h2>{course.title}</h2>
          <p>{course.description}</p>
          <div className="mode-selection">
            <h3>Select a learning mode:</h3>
            <button onClick={() => handleModeSelection('practice')}>Practice Mode</button>
            <button onClick={() => handleModeSelection('exam')}>Exam Mode</button>
            <button onClick={() => handleModeSelection('repeat')}>Repeat Mode</button>
          </div>
        </>
      ) : (
        <p>No course data available.</p>
      )}
    </div>
  );
}

export default CourseDetail;
