import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import * as XLSX from 'xlsx';

function Admin() {
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uid, setUid] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const checkAdminRole = async () => {
      const user = auth.currentUser;
      if (!user) {
        alert('Please log in to access the Admin Panel.');
        navigate('/auth');
        return;
      }

      const tokenResult = await user.getIdTokenResult(true); 
      if (tokenResult.claims.role !== 'admin') {
        alert('Access denied: Admins only.');
        navigate('/'); 
        return;
      }

      
      const coursesCollection = collection(db, 'courses');
      const snapshot = await getDocs(coursesCollection);
      setCourses(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title || 'Untitled',
        }))
      );
    };

    checkAdminRole();
  }, [auth, navigate]);

  const handleAddCourse = async () => {
    if (!courseTitle.trim() || !courseDescription.trim()) {
      alert('Please provide valid title and description.');
      return;
    }
    setLoading(true);
    try {
      const courseRef = await addDoc(collection(db, 'courses'), {
        title: courseTitle,
        description: courseDescription,
      });
      setCourses([...courses, { id: courseRef.id, title: courseTitle }]);
      alert(`Course "${courseTitle}" added successfully!`);
      setCourseTitle('');
      setCourseDescription('');
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Failed to add course');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!file || !selectedCourse) {
      alert('Please select a file and a course.');
      return;
    }
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];

        const courseRef = collection(db, `courses/${selectedCourse}/questions`);
        for (const [question, option1, option2, option3, correctAnswer] of rows.slice(1)) {
          await addDoc(courseRef, { question, options: [option1, option2, option3], correctAnswer });
        }
        alert('Questions uploaded successfully!');
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Error uploading questions:', error);
      alert('Failed to upload questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetRole = async () => {
    if (!uid || !role) {
      setMessage('Please provide a User ID and a Role.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/admin/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, role }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`Role ${role} assigned to user ${uid}`);
        setUid('');
        setRole('');
      } else {
        setMessage(result.error);
      }
    } catch (error) {
      console.error('Error setting role:', error);
      setMessage('Failed to set role.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('You have been logged out.');
      navigate('/auth'); 
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Failed to log out.');
    }
  };

  return (
    <div className="admin-container">
      {loading && <p>Loading...</p>}
      <div className="admin-box">
        <h2>Admin Panel</h2>
        <button onClick={handleLogout} className="logout-button">
          Log Out
        </button>
        <div className="admin-section">
          <h3>Add New Course</h3>
          <input
            type="text"
            placeholder="Course Title"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
          />
          <textarea
            placeholder="Course Description"
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)}
          />
          <button onClick={handleAddCourse}>Add Course</button>
        </div>
        <div className="admin-section">
          <h3>Upload Questions to Course</h3>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
            <option value="">Select a Course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button onClick={handleFileUpload}>Upload Questions</button>
        </div>
        <div className="admin-section">
          <h3>Assign Role</h3>
          <input
            type="text"
            placeholder="User ID"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
          />
          <input
            type="text"
            placeholder="Role (admin/user)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <button onClick={handleSetRole}>Set Role</button>
        </div>
        {message && <p className="status-message">{message}</p>}
      </div>
    </div>
  );
}

export default Admin;
