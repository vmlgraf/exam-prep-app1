import { useEffect, useState } from 'react';
import { fetchCourses, addCourse } from '../services/courseService';
import { useNavigate } from 'react-router-dom';
import '../styles/Admin.css';

interface Course {
  id: string;
  title: string;
  description: string;
}

function Admin() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const courseList = await fetchCourses();
        setCourses(courseList);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };

    loadCourses();
  }, []);

  const handleAddCourse = async () => {
    if (!newCourseTitle.trim() || !newCourseDescription.trim()) {
      alert('Please provide both a valid course title and description.');
      return;
    }
  
    try {
      const newCourse = await addCourse(newCourseTitle, newCourseDescription);
      setCourses([...courses, newCourse]);
      setNewCourseTitle('');
      setNewCourseDescription('');
      alert('Course added successfully!');
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Failed to add course.');
    }
  };  

  const handleEditCourse = (courseId: string) => {
    navigate(`/admin/edit/${courseId}`);
  };

  return (
    <div className="admin-container">
      <h2>Admin Panel</h2>
      <div className="admin-section">
        <h3>Add New Course</h3>
        <input
          type="text"
          placeholder="Course Title"
          value={newCourseTitle}
          onChange={(e) => setNewCourseTitle(e.target.value)}
        />
        <textarea
          placeholder="Course Description"
          value={newCourseDescription}
          onChange={(e) => setNewCourseDescription(e.target.value)}
        />
        <button className="admin-button" onClick={handleAddCourse}>
          Add Course
        </button>
      </div>
      <div className="admin-section">
        <h3>Existing Courses</h3>
        <ul className="course-list">
          {courses.map((course) => (
            <li key={course.id} className="course-item">
              <h4>{course.title}</h4>
              <p>{course.description}</p>
              <button onClick={() => handleEditCourse(course.id)}>Edit</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Admin;
