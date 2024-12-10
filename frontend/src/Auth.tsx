import { useState } from 'react';
import { auth, db } from '../../backend/src/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), { email });
        alert('Registrierung erfolgreich!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Login erfolgreich!');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isRegistering ? 'Registrieren' : 'Einloggen'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="email"
        placeholder="E-Mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Passwort"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleAuth}>{isRegistering ? 'Registrieren' : 'Einloggen'}</button>
      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Zum Login wechseln' : 'Zur Registrierung wechseln'}
      </button>
    </div>
  );
}

export default Auth;

