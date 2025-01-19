import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQuestions, updateQuestionStatus } from '../services/questionService';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  imageUrl?: string;
  lastStatus?: 'correct' | 'incorrect';
}

const useLearningMode = (courseId: string, mode: string) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // Zeit in Sekunden (10 Minuten für den Prüfungsmodus)
  const navigate = useNavigate();

  useEffect(() => {
    const loadQuestions = async () => {
      if (!courseId) return;

      try {
        const allQuestions = await fetchQuestions(courseId);

        if (mode === 'repeat') {
          // Filtere nur die Fragen mit lastStatus === 'incorrect'
          const incorrectQuestions = allQuestions.filter(
            (question: Question) => question.lastStatus === 'incorrect'
          );

          console.log('Modus:', mode);
          console.log('Falsch beantwortete Fragen:', incorrectQuestions);

          setQuestions(incorrectQuestions);
        } else if (mode === 'exam') {
          // Wähle zufällige 10 Fragen für den Prüfungsmodus
          const shuffledQuestions = allQuestions
            .sort(() => 0.5 - Math.random())
            .slice(0, 10);

            console.log('Modus:', mode);
            console.log('Falsch beantwortete Fragen:', shuffledQuestions);

          setQuestions(shuffledQuestions);
        } else {
          // Setze alle Fragen für den Lernmodus
          console.log('Modus:', mode);
          console.log('Falsch beantwortete Fragen:', allQuestions);
          
          setQuestions(allQuestions);
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
      }
    };

    loadQuestions();
  }, [courseId, mode]);

  useEffect(() => {
    if (mode === 'exam' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      if (timeLeft === 0 || currentQuestionIndex >= questions.length) {
        clearInterval(timer); // Timer stoppen
        navigate(`/courses/${courseId}`); // Zur Kursdetailseite zurückkehren
      }

      return () => clearInterval(timer);
    }
  }, [timeLeft, mode, currentQuestionIndex, questions.length, courseId, navigate]);

  const handleAnswer = async (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];

    const correctIndex = currentQuestion.correctAnswer.charCodeAt(0) - 65;
    const correctOption = currentQuestion.options[correctIndex];

    const isCorrect = answer === correctOption;

    try {
      await updateQuestionStatus(courseId, currentQuestion.id, isCorrect ? 'correct' : 'incorrect');
      setFeedback({
        message: isCorrect ? 'Richtig! 🎉' : `Falsch. Die richtige Antwort ist: ${correctOption}`,
        isCorrect,
      });

      if (mode === 'repeat' && isCorrect) {
        // Entferne korrekt beantwortete Fragen im Wiederholungsmodus
        setQuestions((prev) => prev.filter((q) => q.id !== currentQuestion.id));
      }

      setTimeout(() => {
        setFeedback(null);

        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
        } else {
          // Wenn alle Fragen beantwortet wurden
          navigate(`/courses/${courseId}`);
        }
      }, 2000);
    } catch (err) {
      console.error('Error updating question status:', err);
    }
  };

  return { questions, currentQuestionIndex, feedback, handleAnswer, timeLeft };
};

export default useLearningMode;
