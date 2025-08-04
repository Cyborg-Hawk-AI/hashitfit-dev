
import { useState, useEffect } from 'react';
import { mockDataService } from '@/lib/mockData';
import type { MockUser, MockWorkoutPlan, MockWorkoutSchedule, MockNutritionLog, MockProgressMetric, MockChatMessage } from '@/lib/mockData';

export function useMockUser() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay
    setTimeout(() => {
      setUser(mockDataService.getMockUser());
      setIsLoading(false);
    }, 500);
  }, []);

  return { user, isLoading };
}

export function useMockWorkoutPlans() {
  const [workoutPlans, setWorkoutPlans] = useState<MockWorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setWorkoutPlans(mockDataService.getWorkoutPlans());
      setIsLoading(false);
    }, 300);
  }, []);

  return { workoutPlans, isLoading };
}

export function useMockWorkoutSchedules() {
  const [workoutSchedules, setWorkoutSchedules] = useState<MockWorkoutSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setWorkoutSchedules(mockDataService.getWorkoutSchedules());
      setIsLoading(false);
    }, 400);
  }, []);

  return { workoutSchedules, isLoading };
}

export function useMockWeeklyWorkouts() {
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setWeeklyWorkouts(mockDataService.getWeeklyWorkouts());
      setIsLoading(false);
    }, 600);
  }, []);

  return { weeklyWorkouts, isLoading };
}

export function useMockSelectedWorkout(selectedDate: string) {
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setSelectedWorkout(mockDataService.getSelectedWorkout(selectedDate));
      setIsLoading(false);
    }, 400);
  }, [selectedDate]);

  return { selectedWorkout, isLoading };
}

export function useMockNutritionData() {
  const [nutritionLogs, setNutritionLogs] = useState<MockNutritionLog[]>([]);
  const [todayNutrition, setTodayNutrition] = useState<MockNutritionLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const logs = mockDataService.getNutritionLogs();
      const today = mockDataService.getTodayNutrition();
      setNutritionLogs(logs);
      setTodayNutrition(today);
      setIsLoading(false);
    }, 350);
  }, []);

  return { nutritionLogs, todayNutrition, isLoading };
}

export function useMockProgressData() {
  const [progressMetrics, setProgressMetrics] = useState<MockProgressMetric[]>([]);
  const [latestProgress, setLatestProgress] = useState<MockProgressMetric | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const metrics = mockDataService.getProgressMetrics();
      const latest = mockDataService.getLatestProgress();
      setProgressMetrics(metrics);
      setLatestProgress(latest);
      setIsLoading(false);
    }, 450);
  }, []);

  return { progressMetrics, latestProgress, isLoading };
}

export function useMockChatMessages() {
  const [chatMessages, setChatMessages] = useState<MockChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setChatMessages(mockDataService.getChatMessages());
      setIsLoading(false);
    }, 300);
  }, []);

  return { chatMessages, isLoading };
}

// Hook to simulate completing an exercise
export function useMockExerciseCompletion() {
  const completeExercise = (scheduleId: string, exerciseId: string, completed: boolean) => {
    mockDataService.completeExercise(scheduleId, exerciseId, completed);
  };

  return { completeExercise };
}
