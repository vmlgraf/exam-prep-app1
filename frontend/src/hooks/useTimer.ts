import { useState, useEffect } from 'react';

const useTimer = (initialTime: number, onTimeout: () => void) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeout();
      return;
    }

    const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onTimeout]);

  return timeLeft;
};

export default useTimer;
