import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth'; // Auth-Hook importieren
import { checkIfAdmin } from '../services/userService'; // Admin-Prüfung
import './styles/Header.css';

function Header() {
  const { isAuthenticated, userId } = useAuth(); // Authentifizierungsstatus und User-ID abrufen
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchAdminStatus = async () => {
      if (userId) {
        const adminStatus = await checkIfAdmin(userId);
        setIsAdmin(adminStatus);
      }
    };

    fetchAdminStatus();
  }, [userId]);

  const shouldShowAuthButton = !isAuthenticated;
  const isLoginPage = location.pathname === '/login';

  return (
    <header className="header">
      <div className="header-title">
        <h1>Exam Prep</h1>
      </div>
      <nav className="header-nav">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/courses">Kurse</Link>
          </li>
          {isAuthenticated && (
            <>
              <li>
                <Link to="/profile">Profil</Link>
              </li>
              {isAdmin && (
                <li>
                  <Link to="/admin">Admin</Link>
                </li>
              )}
            </>
          )}
        </ul>
      </nav>
      {shouldShowAuthButton && (
        <div className="auth-button">
          <Link to={isLoginPage ? '/register' : '/login'}>
            <button className='button-register'>
              {isLoginPage ? 'Registrieren' : 'Anmelden'}
            </button>
          </Link>
        </div>
      )}
    </header>
  );
}

export default Header;
