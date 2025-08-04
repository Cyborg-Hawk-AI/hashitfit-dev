
import { useState, useEffect, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";

interface RestTimer {
  duration: number;
  remaining: number;
  isActive: boolean;
  exerciseName?: string;
}

export function useRestTimer() {
  const [timer, setTimer] = useState<RestTimer>({
    duration: 0,
    remaining: 0,
    isActive: false
  });

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const startTimer = useCallback((duration: number, exerciseName?: string) => {
    if (intervalId) {
      clearInterval(intervalId);
    }

    setTimer({
      duration,
      remaining: duration,
      isActive: true,
      exerciseName
    });

    toast({
      title: "Rest Timer Started",
      description: `${duration} seconds rest time for ${exerciseName || 'exercise'}`
    });
  }, [intervalId]);

  const pauseTimer = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setTimer(prev => ({ ...prev, isActive: false }));
  }, [intervalId]);

  const resumeTimer = useCallback(() => {
    if (timer.remaining > 0) {
      setTimer(prev => ({ ...prev, isActive: true }));
    }
  }, [timer.remaining]);

  const stopTimer = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setTimer({
      duration: 0,
      remaining: 0,
      isActive: false
    });
  }, [intervalId]);

  const addTime = useCallback((seconds: number) => {
    setTimer(prev => ({
      ...prev,
      remaining: Math.max(0, prev.remaining + seconds),
      duration: Math.max(prev.duration, prev.remaining + seconds)
    }));
  }, []);

  useEffect(() => {
    if (timer.isActive && timer.remaining > 0) {
      const id = setInterval(() => {
        setTimer(prev => {
          if (prev.remaining <= 1) {
            toast({
              title: "Rest Complete! 💪",
              description: "Time to start your next set",
              duration: 5000
            });
            return {
              ...prev,
              remaining: 0,
              isActive: false
            };
          }
          return {
            ...prev,
            remaining: prev.remaining - 1
          };
        });
      }, 1000);

      setIntervalId(id);

      return () => {
        clearInterval(id);
        setIntervalId(null);
      };
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [timer.isActive, timer.remaining]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    timer,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    addTime,
    formatTime
  };
}
