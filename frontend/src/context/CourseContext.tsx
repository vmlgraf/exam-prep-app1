import { createContext, useState, ReactNode } from 'react';

interface CourseContextProps {
  selectedCourseId: string | null;
  setSelectedCourseId: (courseId: string | null) => void;
}

const CourseContext = createContext<CourseContextProps | undefined>(undefined);

export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  return (
    <CourseContext.Provider value={{ selectedCourseId, setSelectedCourseId }}>
      {children}
    </CourseContext.Provider>
  );
};

export default CourseContext;
