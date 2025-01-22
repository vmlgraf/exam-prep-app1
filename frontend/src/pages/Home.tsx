import { Link } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className='home-content'>
        <h1>Willkommen zur Prüfungsvorbereitungs App</h1>
        <p>Deine Reise zum Prüfungserfolg beginnt hier.</p>
      </div>
      <div className='button-wrapper'>
      <Link to="/courses">
        <button className="explore-button">Kurse Erkundigen</button>
      </Link>
      </div>
    </div>
  );
}

export default Home;