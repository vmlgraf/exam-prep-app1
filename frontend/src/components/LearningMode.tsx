import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/LearningMode.css';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  imageUrl?: string; // URL des Bildes
}

const loadFile = async (url: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error loading file:', error);
    throw error;
  }
};

const LearningMode = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [questions] = useState<Question[]>([]);
  const [currentQuestionIndex] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      // Frageabfrage implementieren
    };

    fetchQuestions();
  }, [courseId]);

  const handleDownloadImage = async (imageUrl: string) => {
    try {
      const objectUrl = await loadFile(imageUrl);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = 'question-image.png';
      link.click();
      URL.revokeObjectURL(objectUrl); // Speicher aufräumen
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div className="learning-mode-container">
      {questions.length > 0 ? (
        <div>
          <h2>{questions[currentQuestionIndex].question}</h2>
          {questions[currentQuestionIndex].imageUrl && (
            <div>
              <img
                src={questions[currentQuestionIndex].imageUrl}
                alt="Question"
                style={{ width: '300px', height: 'auto', marginTop: '10px' }}
              />
              <button onClick={() => handleDownloadImage(questions[currentQuestionIndex].imageUrl!)}>
                Download Image
              </button>
            </div>
          )}
        </div>
      ) : (
        <p>Loading questions...</p>
      )}
    </div>
  );
};

export default LearningMode;
