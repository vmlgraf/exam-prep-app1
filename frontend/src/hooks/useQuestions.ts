import { useContext } from 'react';
import QuestionContext from '../context/QuestionContext';

export const useQuestions = () => {
  const context = useContext(QuestionContext);
  if (!context) {
    throw new Error('useQuestions must be used within a QuestionProvider');
  }
  return context;
};
