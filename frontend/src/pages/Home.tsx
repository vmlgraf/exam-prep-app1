import { Link } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  return (
    <div className="home-container">
      <h1>Welcome to Exam Prep</h1>
      <p>Your journey to exam success starts here.</p>
      <Link to="/courses">
        <button className="cta-button">Explore Courses</button>
      </Link>
    </div>
  );
}

export default Home;