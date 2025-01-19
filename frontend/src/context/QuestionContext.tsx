import { createContext, useState, ReactNode } from 'react';

interface QuestionContextProps {
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  feedback: Feedback | null;
  setFeedback: (feedback: Feedback | null) => void;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  imageUrl?: string;
  lastStatus?: 'correct' | 'incorrect';
}

interface Feedback {
  message: string;
  isCorrect: boolean;
}

const QuestionContext = createContext<QuestionContextProps | undefined>(undefined);

export const QuestionProvider = ({ children }: { children: ReactNode }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  return (
    <QuestionContext.Provider
      value={{
        questions,
        setQuestions,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        feedback,
        setFeedback,
      }}
    >
      {children}
    </QuestionContext.Provider>
  );
};

export default QuestionContext;
