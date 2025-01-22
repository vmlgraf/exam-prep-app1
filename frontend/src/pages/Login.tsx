import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth'; 
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

function Login() {
  const { login, loginWithGoogle } = useAuth(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    const autofillListener = (email: Event) => {
      const target = email.target as HTMLInputElement;
      if (target.name === 'email') setEmail(target.value);
      if (target.name === 'password') setPassword(target.value);
    };

    document.addEventListener('input', autofillListener);
    return () => document.removeEventListener('input', autofillListener);
  }, []);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Bitte E-Mail und Passwort eingeben.');
      return;
    }

    try {      
      await login(email, password);
      alert('Anmeldung erfolgreich!');
      navigate('/profile'); 
    } catch (err: any) {
      if (err.code ==='auth/wrong-password'){
        setError('Falsches Passwort. Bitte erneut versuchen.');
      } else if (err.code === 'auth/user-not-found') {
        setError('E-Mail Adresse nicht gefunden. Bitte registrieren Sie sich.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('E-Mail-Adresse oder Passwort ist falsch. Bitte erneut versuchen.');
      } else {
        setError('Unerwarteter Fehler: ' + (err.message || 'Bitte erneut versuchen.'));
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      alert('Anmeldung mit Google erfolgreich!');
      navigate('/profile');
    } catch (err) {
      if (err instanceof Error && err.message.includes('Profil nicht gefunden')) {
        alert('Profil nicht gefunden. Bitte registrieren Sie sich.');
        navigate('/register'); 
      } else {
        setError(err instanceof Error ? err.message : 'Fehler bei Google-Anmeldung.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className='login-card'>
        <h2>Willkommen zurück!</h2>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleLogin} autoComplete='on'>
        <div className="form-group">
            <label htmlFor="email">E-Mail</label>
            <input
              type="email"
              id="email"
              placeholder="E-Mail"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Passwort</label>
            <input
              type="password"
              id="password"
              placeholder="Passwort"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              autoComplete='current-password'
            />
          </div>
          <button onClick={handleLogin} className="login-button">Anmelden</button>
          </form>
          <div className='separator'>oder</div>
          <button onClick={handleGoogleLogin} className="google-login-button">
          Mit Google Anmelden
          </button>
        </div>
    </div>
  );
}

export default Login;
