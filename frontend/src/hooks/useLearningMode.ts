import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQuestions, updateQuestionStatus } from '../services/questionService';
import { updatePoints, addBadge } from '../services/userStatsService';
import { saveQuestion, fetchSavedQuestions } from '../services/questionService';
import { removeSavedQuestion } from '../services/questionService';
import { toast } from 'sonner';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  imageBase64?: string;
  lastStatus?: 'correct' | 'incorrect';
  toRemove?: boolean; 
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

  const saveCurrentQuestion = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    try {
      await saveQuestion(courseId, currentQuestion.id);
      toast('Frage wurde gespeichert!', {
        description: 'Diese Frage wird im Wiederholungsmodus verfügbar sein.',
      });
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Fehler beim Speichern der Frage.');
    }
  };

  useEffect(() => {
    const loadQuestions = async () => {
      if (!courseId) return;

      try {
        const allQuestions = await fetchQuestions(courseId);

        if (mode === 'repeat') {
          const incorrectQuestions = allQuestions.filter(
            (question: Question) => question.lastStatus === 'incorrect'
          );
          const savedQuestions = await fetchSavedQuestions(courseId);
          const uniqueQuestions = [
            ...incorrectQuestions,
            ...savedQuestions.filter(
              (savedQuestion: Question) =>
                !incorrectQuestions.some((q: Question) => q.id === savedQuestion.id)
            ),
          ];

          setQuestions(uniqueQuestions);

          if (uniqueQuestions.length === 0) {
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

  const getFormattedQuestion = (): string => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return '';
  
    let formattedQuestion = currentQuestion.question;

  // Falls ein Bild existiert, ersetze den Platzhalter durch das Base64-Bild
  if (currentQuestion.imageBase64) {
    formattedQuestion = formattedQuestion.replace(
      '<img-placeholder>',
      `<img src="${currentQuestion.imageBase64}" alt="Question Image" />`
    );
  }

  return formattedQuestion;
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
        toast("Neues Abzeichen!", {
          description: `Du hast das Abzeichen "${newBadge}" erhalten! 🎉`,
        });
      }

      if (mode === 'repeat') {
        setQuestions((prevQuestions) =>
          prevQuestions.map((q, index) =>
            index === currentQuestionIndex ? { ...q, lastStatus:  isCorrect ? 'correct':'incorrect'} : q )
        );
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
    setIsFeedbackVisible(false); 
    
      if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
        handleModeCompletion(mode);
      }
    };

    const handleRemoveSavedQuestion = async () => {
      const currentQuestion = questions[currentQuestionIndex];
      try {
        await removeSavedQuestion(courseId, currentQuestion.id);
        console.log("Toast wird ausgelöst!");
        toast("Frage wurde entfernt!", {
          description: "Diese Frage wird im Wiederholungsmodus nicht mehr angezeigt.",
        });
    
        // Entferne die Frage lokal aus der Liste
        setQuestions((prevQuestions) =>
          prevQuestions.filter((q) => q.id !== currentQuestion.id)
        );
    
        // Wenn keine Fragen mehr übrig sind, den Modus beenden
        if (questions.length === 1) {
          handleModeCompletion('repeat');
        } else if (currentQuestionIndex >= questions.length - 1) {
          setCurrentQuestionIndex(0); // Zurück zur ersten Frage, wenn die aktuelle entfernt wird
        }
      } catch (error) {
        console.error('Error removing saved question:', error);
        toast.error('Fehler beim Entfernen der Frage.');
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

    toast('Modus abgeschlossen',{
      description: message,
    });

    // Abzeichenprüfung
    const updatedPoints = points + bonusPoints;
    const newBadge = await checkAndAssignBadge(userId, courseId, updatedPoints);
    if (newBadge) {
      setBadges((prev) => [...prev, newBadge]);
      toast("Neues Abzeichen!", {
        description: `Du hast das Abzeichen "${newBadge}" erhalten! 🎉`,
      });
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

  return { questions, currentQuestionIndex, feedback, handleAnswer, timeLeft, points, badges, correctAnswersCount, showSummary, loadingQuestions, handleModeCompletion, handleNextQuestion, getFormattedQuestion, saveCurrentQuestion, handleRemoveSavedQuestion};
};


export default useLearningMode;
