import { useState } from 'react';
import { useAuth } from '../hooks/useAuth'; // Hook nutzen
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

function Login() {
  const { login } = useAuth(); // Login aus AuthContext nutzen
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Bitte E-Mail und Passwort eingeben.');
      return;
    }

    try {
      await login(email, password);
      alert('Anmeldung erfolgreich!');
      navigate('/profile'); // Zur Profilseite navigieren
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unerwarteter Fehler aufgetreten.');
    }
  };

  return (
    <div className="login-container">
      <h2>Anmelden</h2>
      {error && <p className="error-text">{error}</p>}
      <input
        type="email"
        placeholder="E-Mail"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
      />
      <input
        type="password"
        placeholder="Passwort"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />
      <button onClick={handleLogin} className="login-button">Anmelden</button>
    </div>
  );
}

export default Login;
