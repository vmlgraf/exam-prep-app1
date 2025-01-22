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
      <div className='register-card'>
      <h2>Registrieren</h2>
      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">Registrierung erfolgreich!</p>}
      <form onSubmit={handleRegister} autoComplete='on'>
        <div className='form-group'>
          <label htmlFor="name">Name</label>
          <input
          type="text"
          is="name"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        </div>
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
            />
          </div>
          <div className="form-group">
            <label htmlFor="birthday">Geburtsdatum</label>
            <input
              type="date"
              id="birthday"
              placeholder="Geburtsdatum"
              onChange={(e) => setBirthday(e.target.value)}
              value={birthday}
            />
          </div>
          <button type="submit" onClick={handleRegister} className="register-button">Registrieren</button>
      </form>
      <div className="separator">oder</div>
      <button onClick={handleGoogleRegister} className="google-login-button">Mit Google registrieren</button>
    </div>
  </div>
  );
}

export default Register;
