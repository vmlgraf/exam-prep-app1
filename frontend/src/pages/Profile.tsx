import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getProfile } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import { fetchUserCourseStats } from '../services/userStatsService';
import '../styles/Profile.css';

interface UserProfile {
  name?: string;
  email: string;
  birthday?: string;
}

interface CourseStats {
  courseId: string;
  courseTitle: string;
  points: number;
  badges: string[];
  level: number;
}

function Profile() {
  const { isAuthenticated, userId, isLoading, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return; // Warten, bis der Auth-Status geladen ist

    if (!isAuthenticated) {
      navigate('/login'); // Weiterleitung zur Login-Seite, wenn nicht eingeloggt
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        const userProfile = await getProfile(userId);
        const courses = await fetchUserCourseStats(userId);

        setProfile(userProfile);
        setCourseStats(courses);
      } catch (err) {
        console.error('Fehler beim Laden der Profildaten:', err);
        setError('Profil konnte nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [isAuthenticated, userId]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login'); // Weiterleitung zur Login-Seite nach Abmeldung
    } catch (err) {
      console.error('Fehler beim Abmelden:', err);
    }
  };

  if (isLoading || loading) return <p>Lädt...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="profile-container">
      {profile ? (
        <div className="profile-header">
        <img
          src={`https://ui-avatars.com/api/?name=${profile.name || 'Benutzer'}&background=6c1d5f&color=fff&size=128`}
          alt="Avatar"
          className="profile-avatar"
        />
          <h2>Willkommen, {profile.name || 'Benutzer'}</h2>
          <p>E-Mail: {profile.email}</p>
          {profile.birthday && (
            <p>Geburtstag: {new Date(profile.birthday).toLocaleDateString()}</p>
          )}
        </div>
      ) : (
        <p>Keine Profildaten verfügbar.</p>
      )}

      <div className="user-stats">
        <h3>Deine Erfolge:</h3>
        {courseStats.length > 0 ? (
            courseStats.map((course) => (
              <div key={course.courseId} className="course-item">
                <h4>Kurs: {course.courseTitle}</h4>
                <p>Punkte: {course.points}</p>
                <p>Level: {course.level}</p>
                <p>
                  Abzeichen: {course.badges.length > 0 ? course.badges.join(', ') : 'Keine Abzeichen'}
                </p>
              </div>
            ))
          ) : (
            <p>Keine Statistiken verfügbar.</p>
          )}
      </div>

      <div className="logout-container">
        <button onClick={handleLogout} className="signout-button">
          Abmelden
        </button>
      </div>
    </div>
  );
}

export default Profile;
