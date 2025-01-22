import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import useLearningMode from '../hooks/useLearningMode';
import '../styles/LearningMode.css';

const LearningMode = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const { userId } = useAuth();
  const navigate = useNavigate();
  const mode = location.state?.mode || 'learn';

  const { 
    questions, 
    currentQuestionIndex, 
    feedback, 
    handleAnswer, 
    timeLeft, 
    showSummary, 
    correctAnswersCount,
    loadingQuestions ,
    getFormattedQuestion,
    handleModeCompletion, 
    handleNextQuestion 
  } = useLearningMode(courseId!, mode, userId!);

  if (loadingQuestions) {
    return <p>Lade Fragen...</p>;
  }

  if (!questions.length) {
    return mode === 'repeat' ? (
      <p>Keine falsch beantworteten Fragen mehr vorhanden. 🎉</p>
    ) : (
      <p>Keine Fragen verfügbar.</p>
    );
  }

  if (showSummary && mode === 'exam') {
    return (
      <div className="summary-container">
        <h2>Prüfungsmodus abgeschlossen 🎉</h2>
        <p>
          Du hast {correctAnswersCount} von {questions.length} Fragen richtig beantwortet.
        </p>
        <button onClick={() => handleModeCompletion('exam')}>
          Zurück zur Kurs Detail Seite
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const formattedSentences = getFormattedQuestion();

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
      <div className='question-box'>
        <div className='question-text'>
        {formattedSentences.map((sentence, index) => (
            <p key={index} className="sentence-line">
              {sentence}
            </p>
          ))}
        </div>
      {currentQuestion.imageUrl && (<img src={currentQuestion.imageUrl} alt="Question" className='question-image'/>)}
      
      <div className="options-container">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => {
              if (!feedback) handleAnswer(option);
            }}
            disabled={!!feedback} className='otion-button'>
            {option}
          </button>
        ))}
      </div>
      {feedback && mode!== 'exam' && (
        <div className="feedback-container">
          <p className={`feedback ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
            {feedback.message}
          </p>
          {currentQuestionIndex < questions.length - 1 ? (
          <button onClick={handleNextQuestion} className="next-question-button">
          Nächste Frage
          </button>
          ) : (
            <button
        onClick={() => navigate(`/courses/${courseId}`)}
        className="next-question-button"
      >
        Zurück zur Kurs Detail Seite
      </button> 
          )}
        </div>
      )}
    </div>
  </div>
  );
};

export default LearningMode;
