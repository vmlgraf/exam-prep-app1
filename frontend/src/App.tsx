import { Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import Courses from './components/Courses';
import Profile from './components/Profile';
import Register from './components/Register';
import Login from './components/Login';
import Admin from './components/Admin';
import CourseDetail from './components/CourseDetail';
import LearningMode from './components/LearningMode';
import AdminCourseManagement from './components/AdminCourseManagement';
import './App.css';

function App() {
  return (
    <div className='App'>
      <header className="app-header">
        <nav className="nav-links">
          <div className="nav-logo">
            <h1>Prüfungsvorbereitungs App</h1>
          </div>
          <ul className="nav-links">
            <li>
            <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/courses">Courses</Link>
            </li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <Link to="/admin">Admin</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/courses/:courseId/modes/:mode" element={<LearningMode />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/edit/:courseId" element={<AdminCourseManagement />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
