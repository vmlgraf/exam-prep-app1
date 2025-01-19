import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCourses } from '../services/courseService';
import '../styles/Courses.css';

interface Course {
  id: string;
  title: string;
  description: string;
}

function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const courseList = await fetchCourses();
        setCourses(courseList);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        setError('Failed to fetch courses.');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  if (loading) return <p>Loading courses...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="courses-container">
      <h2 className="courses-title">Available Courses</h2>
      <div className="courses-grid">
        {courses.map((course) => (
          <div
            key={course.id}
            className="course-card"
            onClick={() => handleCourseClick(course.id)}
          >
            <h3>{course.title}</h3>
            <p>{course.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Courses;
