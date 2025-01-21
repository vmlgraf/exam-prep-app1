import api from './api';

export const updatePoints = async (userId: string, courseId: string, points: number) => {
  await api.post(`/stats/user/${userId}/courses/${courseId}/points`, { points });
};

export const addBadge = async (userId: string, courseId: string, badge: string) => {
  await api.post(`/stats/user/${userId}/courses/${courseId}/badges`, { badge });
};


  export const fetchUserCourseStats = async (userId: string) => {
    try {
      const response = await api.get(`stats/users/${userId}/courses`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user course stats:', error);
      return [];
    }
  };
  

  
