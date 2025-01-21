import { useState } from 'react';
import { registerUser } from '../services/userService';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../hooks/useAuth';
import '../styles/Register.css';

function Register() {
  const { loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate(); // Hinzufügen

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !name.trim() || !birthday.trim()) {
      setError('Bitte alle Felder ausfüllen.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Bitte eine gültige E-Mail-Adresse eingeben.');
      return;
    }

    if (password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    try {
      await registerUser(email, password, name, birthday);
      setSuccess(true);
      alert('Registrierung erfolgreich!');
      navigate('/profile'); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unerwarteter Fehler aufgetreten.');
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await loginWithGoogle(); 
      alert('Google-Registrierung erfolgreich!');
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei der Google-Registrierung.');
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">Registrierung erfolgreich!</p>}
      <form autoComplete='on'>
        <input
          type="text"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        <input
          type="date"
          placeholder="Birthday"
          onChange={(e) => setBirthday(e.target.value)}
          value={birthday}
        />
        <button onClick={handleRegister} className="register-button">Register</button>
      </form>
      <button onClick={handleGoogleRegister} className="oauth-button">Mit Google registrieren</button>
    </div>
  );
}

export default Register;
