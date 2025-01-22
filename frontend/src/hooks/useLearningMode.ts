import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQuestions, updateQuestionStatus } from '../services/questionService';
import { updatePoints, addBadge } from '../services/userStatsService';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  imageUrl?: string;
  lastStatus?: 'correct' | 'incorrect';
}

const useLearningMode = (courseId: string, mode: string, userId: string) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); 
  const [points, setPoints] = useState(0); 
  const [badges, setBadges] = useState<string[]>([]);
  const [correctAnswersCount, setCorrectAnswerCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [, setIsFeedbackVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadQuestions = async () => {
      if (!courseId) return;

      try {
        const allQuestions = await fetchQuestions(courseId);

        if (mode === 'repeat') {
          const incorrectQuestions = allQuestions.filter(
            (question: Question) => question.lastStatus === 'incorrect'
          );

          setQuestions(incorrectQuestions);

          if (incorrectQuestions.length === 0) {
            handleModeCompletion('repeat');
            return;
          }
        } else if (mode === 'exam') {
          const shuffledQuestions = allQuestions
            .sort(() => 0.5 - Math.random())
            .slice(0, 10);
          setQuestions(shuffledQuestions);
        } else {
          setQuestions(allQuestions);
        }

        setLoadingQuestions(false);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, [courseId, mode]);

  const getFormattedQuestion = (): string[] => {
    if (!questions[currentQuestionIndex]) return [];
    return parseQuestionText(questions[currentQuestionIndex].question);
  };

  useEffect(() => {
    if (mode === 'exam' && timeLeft > 0 && !showSummary) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowSummary(true); // Timer abgelaufen, Zusammenfassung anzeigen
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, mode, currentQuestionIndex, questions.length, courseId, navigate, showSummary]);

  const handleAnswer = async (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const correctIndex = currentQuestion.correctAnswer.charCodeAt(0) - 65;
    const correctOption = currentQuestion.options[correctIndex];
    const isCorrect = answer === correctOption;

    try {
      await updateQuestionStatus(courseId, currentQuestion.id, isCorrect ? 'correct' : 'incorrect');

      // für richtige Antwort
      if (isCorrect) {
        setPoints((prev) => prev + 10);
        setCorrectAnswerCount((prev) => prev + 1);
        await updatePoints(userId, courseId, 10);
      }

      if (mode === 'exam') {
        // Direkt zur nächsten Frage springen
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
        } else {
          // Letzte Frage erreicht -> Zusammenfassung anzeigen
          setShowSummary(true);
        }
      } else {
        // Feedback für andere Modi anzeigen
        setFeedback({
          message: isCorrect ? 'Richtig! 🎉' : `Falsch. Die richtige Antwort ist: ${correctOption}`,
          isCorrect,
        });
        setIsFeedbackVisible(true);
      }

      // Abzeichenprüfung
      const updatedPoints = points + (isCorrect ? 10 : 0);
      const newBadge = await checkAndAssignBadge(userId, courseId, updatedPoints);
      if (newBadge) {
        setBadges((prev) => [...prev, newBadge]);
        alert(`Neues Abzeichen: ${newBadge}!`);
      }

      if (mode === 'repeat' && isCorrect) {
        const remainingQuestions = questions.map((q, index) => 
          index === currentQuestionIndex ? null : q).filter(Boolean) as Question[];
        setQuestions(remainingQuestions);

        if (remainingQuestions.length === 0) {
          handleModeCompletion('repeat');
          return;
        }
      }

    
         if (currentQuestionIndex < questions.length - 1) {
        } else if (mode === 'exam') {
          setShowSummary(true); 
        } else {
          handleModeCompletion(mode);
        }
      } catch (err) {
      console.error('Error updating question status:', err);
    }
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    setIsFeedbackVisible(false); // Feedback ausblenden
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleModeCompletion(mode);
    }
  };


  const handleModeCompletion = async (completeMode: string) => {
    let bonusPoints = 0;
    let message = '';

    if (completeMode === 'exam'){
      bonusPoints = 100;
      message = 'Der Prüfungsmodus wurde abgeschlossen. 🎉';
    } else if (completeMode === 'practice') {
      bonusPoints = 50;
      message = 'Du hast alle Fragen im Lernmodus durchgearbeitet. 🎉';
    } else if (completeMode === 'repeat') {
      bonusPoints = 75;
      message = 'Alle Fragen wurden korrekt beantwortet. 🎉';
    }

    setPoints((prev) => prev + bonusPoints);
    await updatePoints(userId, courseId, bonusPoints);

    // Abzeichenprüfung
    const updatedPoints = points + bonusPoints;
    const newBadge = await checkAndAssignBadge(userId, courseId, updatedPoints);
    if (newBadge) {
      setBadges((prev) => [...prev, newBadge]);
      alert(`Neues Abzeichen: ${newBadge}!`);
    }
  };

  const checkAndAssignBadge = async (userId: string, courseId: string, points: number) => {
    let newBadge = null;

    if (points >= 100 && !badges.includes('Starter')) {
      newBadge = 'Starter';
    } else if (points >= 500 && !badges.includes('Lernprofi')) {
      newBadge = 'Lernprofi';
    } else if (points >= 1000 && !badges.includes('Quiz-König')) {
      newBadge = 'Quiz-König';
    }

    if (newBadge) {
      await addBadge(userId, courseId, newBadge);
    }

    return newBadge;
  };

  return { questions, currentQuestionIndex, feedback, handleAnswer, timeLeft, points, badges, correctAnswersCount, showSummary, loadingQuestions, handleModeCompletion, handleNextQuestion, getFormattedQuestion};
};

const parseQuestionText = (text: string): string[] => {
  // Trenne den Text nach Satzende (`.`, `?`, `!`) und behalte Aufzählungen zusammen
  const parts = text.split(/(?<=\.)|(?<=\?)|(?<=!)\s+(?=\d+\.|[A-Z]\.)|(?<=\d\.|[A-Z]\.)\s+/g).filter((part) => part.trim() !== '');

  const structuredParts: string[] = [];
  let tempPart = '';

  parts.forEach((part) => {
    if (/^\d+\./.test(part) || /^[A-Z]\./.test(part)) {
      // Wenn es eine nummerierte oder alphabetische Aufzählung ist
      tempPart += ` ${part}`;
    } else {
      // Füge die Aufzählung hinzu, wenn ein Satz kommt
      if (tempPart) {
        structuredParts.push(tempPart.trim());
        tempPart = '';
      }
      structuredParts.push(part.trim());
    }
  });

  // Letzte Aufzählung hinzufügen, falls vorhanden
  if (tempPart) structuredParts.push(tempPart.trim());

  return structuredParts;
};


export default useLearningMode;
