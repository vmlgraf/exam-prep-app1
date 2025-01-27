import { useState } from 'react';
import { registerUser } from '../services/userService';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../hooks/useAuth';
import { Card ,CardHeader, CardFooter, CardContent, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input';
import { Alert } from '../components/ui/alert';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';
import '../styles/Register.css';

function Register() {
  const { loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate(); // Hinzufügen

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validatePassword = (password: string) => {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[a-zA-Z]).{8,}$/.test(password); // Mindestens 8 Zeichen, ein Großbuchstabe und eine Zahl
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      setError('Bitte alle Felder ausfüllen.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Bitte eine gültige E-Mail-Adresse eingeben.');
      return;
    }

    if (!validatePassword(password)) {
      setError("Das Passwort muss mindestens 8 Zeichen, einen Großbuchstaben und eine Zahl enthalten.");
      return;
    }

    try {
      await registerUser(email, password, name);
      setSuccess(true);
      toast.success("Registrierung erfolgreich!");
      navigate('/profile'); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unerwarteter Fehler aufgetreten.');
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await loginWithGoogle(); 
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei der Google-Registrierung.');
    }
  };

  return (
    <div className="register-container">
      <Toaster position="top-right"/>
      <Card className="register-card">
        <CardHeader>
          <CardTitle>Registrieren</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className='mb-4'>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" className='mb-4'>
              Registrierung erfolgreich!
            </Alert>
          )}
          <div className='mb-4'>
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              />
          </div>
          <div className='mb-4'>
            <Label htmlFor="email">E-Mail</Label>
            <Input 
              type="email"
              id="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => {
                if (!validateEmail(email)) {
                  setError("Bitte eine gültige E-Mail-Adresse eingeben.");
                } else {
                  setError("");
                }
              }}
            />
          </div>
          <div className='mb-4'>
            <Label htmlFor="password">Passwort</Label>
            <Input
              type="password"
              id="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => {
                if (!validatePassword(password)) {
                  setError("Das Passwort muss mindestens 8 Zeichen, einen Großbuchstaben und eine Zahl enthalten.");
                } else {
                  setError("");
                }
              }}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <Button
            className="w-full mb-4"
            onClick={handleRegister}
            variant="default"
          >
            Registrieren
          </Button>
          <Separator />
          <Button
            className="w-full mt-4"
            onClick={handleGoogleRegister}
            variant="secondary"
          >
            Mit Google registrieren
          </Button>
        </CardFooter>
      </Card>
      </div>
  );
}

export default Register;
