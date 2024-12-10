import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="header">
        <h1>Willkommen zur ISTQB Prüfungsvorbereitungs-App</h1>
        <p>Effizient lernen, den Fortschritt verfolgen und die ISTQB-Prüfung erfolgreich bestehen.</p>
        <button className="cta-button">Jetzt loslegen</button>
      </header>
      <main className="features">
        <section>
          <h2>Unsere Features</h2>
          <div className="feature-list">
            <div className="feature-item">
              <h3>Interaktive Quiz</h3>
              <p>Teste dein Wissen mit Multiple-Choice-Fragen.</p>
            </div>
            <div className="feature-item">
              <h3>Lernfortschritt verfolgen</h3>
              <p>Bleibe motiviert mit Fortschrittsberichten und Abzeichen.</p>
            </div>
            <div className="feature-item">
              <h3>Lernmodi</h3>
              <p>Übungsmodus, Prüfungsmodus und Wiederholungsmodus zur Auswahl.</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer">
        <p>© 2024 ISTQB Prüfungsvorbereitung. Alle Rechte vorbehalten.</p>
      </footer>
    </div>
  );
}

export default App;
