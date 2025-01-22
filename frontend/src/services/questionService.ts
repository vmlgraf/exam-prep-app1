import api from './api';

export const fetchQuestions = async (courseId: string) => {
  const response = await api.get(`/courses/${courseId}/questions`);
  return response.data;
};

export const updateQuestionStatus = async (
  courseId: string,
  questionId: string,
  status: 'correct' | 'incorrect'
) => {
  await api.patch(`/courses/${courseId}/questions/${questionId}`, { status });
};

export const fetchIncorrectQuestions = async (courseId: string) => {
  const response = await api.get(`/courses/${courseId}/incorrect-questions`);
  return response.data;
};

export const evaluateAnswer = (selectedAnswer: string, correctAnswer: string, options: string[]): boolean => {
  const correctAnswerIndex = correctAnswer.charCodeAt(0) - 65; // 'A' = 0, 'B' = 1, etc.
  return options[correctAnswerIndex] === selectedAnswer;
};

export const deleteQuestion = async (courseId: string, questionId: string) => {
  try {
    await api.delete(`/courses/${courseId}/questions/${questionId}`);
    console.log('Question deleted successfully.');
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};
