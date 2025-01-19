import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getProfile } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

interface UserProfile {
  name?: string;
  email: string;
  birthday?: string;
}

function Profile() {
  const { isAuthenticated, userId, isLoading, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

    const fetchProfile = async () => {
      try {
        const userProfile = await getProfile(userId);
        setProfile(userProfile);
      } catch (err) {
        console.error('Profil konnte nicht geladen werden:', err);
        setError('Profil konnte nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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
        <div>
          <h2>Willkommen, {profile.name || 'Benutzer'}</h2>
          <p>E-Mail: {profile.email}</p>
          {profile.birthday && (
            <p>Geburtstag: {new Date(profile.birthday).toLocaleDateString()}</p>
          )}
        </div>
      ) : (
        <p>Keine Profildaten verfügbar.</p>
      )}

      {/* Abmelde-Button unten */}
      <div className="logout-container">
        <button onClick={handleLogout} className="logout-button">
          Abmelden
        </button>
      </div>
    </div>
  );
}

export default Profile;
