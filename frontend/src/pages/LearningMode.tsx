import { useParams, useLocation } from 'react-router-dom';
import useLearningMode from '../hooks/useLearningMode';
import '../styles/LearningMode.css';

const LearningMode = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const mode = location.state?.mode || 'learn';

  const { questions, currentQuestionIndex, feedback, handleAnswer, timeLeft } =
    useLearningMode(courseId!, mode);

    console.log('Modus:', mode);
    console.log('Falsch beantwortete Fragen:', questions);

  if (!questions.length) {
    return mode === 'repeat' ? (
      <p>Keine falsch beantworteten Fragen mehr vorhanden. 🎉</p>
    ) : (
      <p>Keine Fragen verfügbar.</p>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="learning-mode-container">
      {mode === 'exam' && (
        <div className="timer">
          <p>Zeit verbleibend: {formatTime(timeLeft)}</p>
        </div>
      )}
      <h2>{currentQuestion.question}</h2>
      {currentQuestion.imageUrl && <img src={currentQuestion.imageUrl} alt="Question" />}
      <div className="options-container">
        {currentQuestion.options.map((option, index) => (
          <button key={index} onClick={() => handleAnswer(option)}>
            {option}
          </button>
        ))}
      </div>
      {feedback && (
        <p className={`feedback ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
          {feedback.message}
        </p>
      )}
    </div>
  );
};

export default LearningMode;
