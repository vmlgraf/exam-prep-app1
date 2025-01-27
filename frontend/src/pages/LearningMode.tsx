import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import useLearningMode from '../hooks/useLearningMode';
import { AlertDialog, AlertDialogTitle, AlertDialogDescription } from '../components/ui/alert-dialog';
import '../styles/LearningMode.css';
import { Toaster } from '../components/ui/sonner';

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
    handleNextQuestion,
    saveCurrentQuestion,
    handleRemoveSavedQuestion
  } = useLearningMode(courseId!, mode, userId!);

  if (loadingQuestions) {
    return <p>Lade Fragen...</p>;
  }

  if (!questions.length) {
    return mode === 'repeat' ? (
      <div className='no-questions-container'>
        <AlertDialog>
          <AlertDialogTitle>Keine Fragen übrig!</AlertDialogTitle>
          <AlertDialogDescription>Keine falsch beantworteten Fragen mehr vorhanden. 🎉</AlertDialogDescription>
        </AlertDialog>
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="back-button bg-blue-600 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-700 mt-4"
        >
          Zurück zur Kurs Detail Seite
        </button>
      </div>
    ) : (
      <div className='no-questions-container'>
        <AlertDialog>
          <AlertDialogTitle>Keine Fragen verfügbar!</AlertDialogTitle>
          <AlertDialogDescription>Es sind keine Fragen in diesem Kurs vorhanden. 😢</AlertDialogDescription>
        </AlertDialog>
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="back-button bg-blue-600 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-700 mt-4"
        >
          Zurück zur Kurs Detail Seite
        </button>
      </div>
    );
  }

  if (showSummary && mode === 'exam') {
    return (
      <div className="summary-container">
        <AlertDialog>
          <AlertDialogTitle>Prüfungsmodus abgeschlossen</AlertDialogTitle>
          <AlertDialogDescription>
            Du hast {correctAnswersCount} von {questions.length} Fragen richtig beantwortet.
          </AlertDialogDescription>
        </AlertDialog>
        <button onClick={() => navigate(`/courses/${courseId}`)}>
          Zurück zur Kurs Detail Seite
        </button>
      </div>
    );
  }

  const currentQuestionHTML = getFormattedQuestion();

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
        <div className='question-text'
        dangerouslySetInnerHTML={{ __html: currentQuestionHTML }} >
        </div>

      <div className="options-container">
      {questions[currentQuestionIndex].options.map((option, index) => (
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
          {mode === 'practice' && (
          <button
          onClick={() => saveCurrentQuestion()}
          className="save-question-button bg-green-600 text-white py-2 px-4 rounded-lg shadow hover:bg-green-700"
          >
          Frage speichern
          </button>
        )}
        {mode === 'repeat' && (
  <button
    onClick={() => handleRemoveSavedQuestion()}
    className="remove-saved-question-button bg-red-600 text-white py-2 px-4 rounded-lg shadow hover:bg-red-700"
  >
    Frage nicht mehr speichern
  </button>
)}

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
    <Toaster />
 </div>
  );
};

export default LearningMode;
