import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import LearningMode from './pages/LearningMode';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import { QuestionProvider } from './context/QuestionContext';
import AdminCourseManagement from './pages/AdminCourseManagement';
import './styles/GlobalStyles.css';

function App() {
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <QuestionProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />
            <Route path="/courses/:courseId/modes" element={<LearningMode />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/edit/:courseId" element={<AdminCourseManagement />} />
          </Routes>
        </QuestionProvider>
      </main>
      <Footer />
    </div>
  );
}

export default App;
