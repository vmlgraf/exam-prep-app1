import api from './api';

export interface CourseStats {
  totalQuestions: number;
  totalCompletedModules: number;
  averageSuccessRate: string;
  questionStats: Record<string, { correctCount: number; totalCount: number }>;
  difficultQuestions: { questionId: string; correctRate: string }[];
}

// Fetch all courses
export const fetchCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

export const fetchCourseDetails = async (courseId: string) => {
  try {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw error;
  }
};

// Add a new course
export const addCourse = async (title: string, description: string) => {
  const response = await api.post('/courses', { title, description });
  return response.data;
};

// Delete a course
export const deleteCourse = async (courseId: string) => {
  try {
    const response = await api.delete(`/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

// Update a course
export const updateCourse = async (courseId: string, data: { title?: string; description?: string }) => {
  const response = await api.patch(`/courses/${courseId}`, data);
  return response.data;
};

export const fetchCourseStats = async (courseId: string): Promise<CourseStats> => {
  try {
    const response = await api.get(`/courses/${courseId}/stats`);
    return {
      totalQuestions: response.data.totalQuestions || 0,
      totalCompletedModules: response.data.totalCompletedModules || 0,
      averageSuccessRate: response.data.averageSuccessRate || '0%',
      questionStats: response.data.questionStats || {},
      difficultQuestions: response.data.difficultQuestions || [],
    };
  } catch (error) {
    console.error('Fehler beim Abrufen der Kursstatistiken:', error);
    throw error;
  }
};


