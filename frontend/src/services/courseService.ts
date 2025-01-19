import api from './api';

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
  const response = await api.delete(`/courses/${courseId}`);
  return response.data;
};

// Update a course
export const updateCourse = async (courseId: string, data: { title?: string; description?: string }) => {
  const response = await api.patch(`/courses/${courseId}`, data);
  return response.data;
};
