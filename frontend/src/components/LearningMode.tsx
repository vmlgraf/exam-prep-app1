import { useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/LearningMode.css';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  isMarked?: boolean;
}

function LearningMode() {
  const { mode } = useParams<{ courseId: string; mode: string }>();
  const { state } = useLocation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [markedQuestions, setMarkedQuestions] = useState<string[]>([]);

  useEffect(() => {
    if (state && state.questions) {
      const allQuestions = state.questions as Question[];
      if (mode === 'practice') {
        setQuestions(allQuestions);
      } else if (mode === 'exam') {
        setQuestions(allQuestions.sort(() => 0.5 - Math.random()).slice(0, 10));
      } else if (mode === 'review') {
        setQuestions(allQuestions.filter((q) => q.isMarked || markedQuestions.includes(q.id)));
      }
    }
  }, [mode, state, markedQuestions]);

  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswer(answer);
    if (answer !== questions[currentQuestionIndex].correctAnswer) {
      setMarkedQuestions((prev) => [...prev, questions[currentQuestionIndex].id]);
    }
  };

  const handleMarkQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion.isMarked) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === currentQuestion.id ? { ...q, isMarked: true } : q
        )
      );
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      alert('You have completed this mode!');
    }
    setSelectedAnswer(null);
  };

  return (
    <div className="learning-mode-container">
      <h2>{mode === 'practice' ? 'Practice Mode' : mode === 'exam' ? 'Exam Mode' : 'Review Mode'}</h2>
      {questions.length > 0 ? (
        <>
          <div className="question-container">
            <p>{questions[currentQuestionIndex]?.question}</p>
            <ul>
              {questions[currentQuestionIndex]?.options.map((option, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleAnswerSelection(option)}
                    disabled={!!selectedAnswer}
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
            {selectedAnswer && (
              <p>{selectedAnswer === questions[currentQuestionIndex]?.correctAnswer ? 'Correct!' : 'Incorrect!'}</p>
            )}
          </div>
          <div className="actions">
            <button onClick={handleMarkQuestion}>Mark Question</button>
            <button onClick={handleNextQuestion}>Next Question</button>
          </div>
        </>
      ) : (
        <p>No questions available.</p>
      )}
    </div>
  );
}

export default LearningMode;
