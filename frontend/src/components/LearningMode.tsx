import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/LearningMode.css';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  imageUrl?: string;
}

const LearningMode = () => {
  const { mode, courseId } = useParams<{ mode: string; courseId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/courses/${courseId}/questions`);
        if (!response.ok) {
          throw new Error('Error fetching questions');
        }
        const data: Question[] = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    };

    fetchQuestions();
  }, [courseId]);

  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      alert('You have completed this mode!');
      navigate(`/courses/${courseId}`);
    }
  };

  return (
    <div className="learning-mode-container">
      <h2>{mode === 'practice' ? 'Practice Mode' : mode === 'exam' ? 'Exam Mode' : 'Review Mode'}</h2>
      {questions.length > 0 ? (
        <div className="question-container">
          <p>{questions[currentQuestionIndex]?.question}</p>
          {questions[currentQuestionIndex]?.imageUrl && (
            <img src={questions[currentQuestionIndex].imageUrl} alt="Question" className="question-image" />
          )}
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
            <p>
              {selectedAnswer === questions[currentQuestionIndex]?.correctAnswer
                ? 'Correct!'
                : `Incorrect! The correct answer was: ${questions[currentQuestionIndex]?.correctAnswer}`}
            </p>
          )}
          <button onClick={handleNextQuestion}>Next Question</button>
        </div>
      ) : (
        <p>No questions available.</p>
      )}
    </div>
  );
};

export default LearningMode;
