import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCourseStats } from '../services/courseService';
import '../styles/AdminCourseStats.css';

interface QuestionStat {
  correctCount: number;
  totalCount: number;
}

interface DifficultQuestion {
  questionId: string;
  correctRate: string;
}

interface CourseStats {
  totalQuestions: number;
  totalCompletedModules: number;
  averageSuccessRate: string;
  questionStats: Record<string, QuestionStat>;
  difficultQuestions: DifficultQuestion[];
}

function AdminCourseStats() {
  const { courseId } = useParams<{ courseId: string }>();
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const courseStats = await fetchCourseStats(courseId!);
        setStats(courseStats);
      } catch (err) {
        setError('Fehler beim Laden der Statistiken.');
        console.error(err);
      }
    };

    loadStats();
  }, [courseId]);

  if (error) return <p className="error-text">{error}</p>;
  if (!stats) return <p>Statistiken werden geladen...</p>;

  return (
    <div className="course-stats-container">
      <h2>Statistiken für Kurs</h2>
      <p>
        <strong>Gesamtanzahl der Fragen:</strong> {stats.totalQuestions}
      </p>
      <p>
        <strong>Abgeschlossene Module:</strong> {stats.totalCompletedModules}
      </p>
      <p>
        <strong>Durchschnittliche Erfolgsquote:</strong> {stats.averageSuccessRate}
      </p>
      <h3>Fragenstatistiken:</h3>
      <ul>
      {Object.entries(stats.questionStats).map(([questionId, stat]) => (
          <li key={questionId}>
            Frage ID: {questionId} - Erfolgsquote: {(stat.correctCount / stat.totalCount) * 100 || 0}%
          </li>
        ))}
      </ul>
      <h3>Fragen mit den meisten Problemen:</h3>
      <ul>
        {stats.difficultQuestions.map((question) => (
          <li key={question.questionId}>
            Frage ID: {question.questionId} - Erfolgsquote: {question.correctRate}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminCourseStats;
