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
  const isHomePage = location.pathname === '/';

  return (
    <header className="header">
      <div className={`header-container ${isHomePage ? 'large-header' : 'small-header'}`}>
        <div className='logo'>
          <h1 className={`title ${isHomePage ? 'home-title' : 'page-title'}`}>Prüfungsvorbereitungs App</h1>
        </div>
      </div>
      <nav className="navigation">
        <ul>
          <li>
            <Link to="/">Willkommen</Link>
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
            <button className='button-auth'>
              {isLoginPage ? 'Registrieren' : 'Anmelden'}
            </button>
          </Link>
        </div>
      )}
    </header>
  );
}

export default Header;
