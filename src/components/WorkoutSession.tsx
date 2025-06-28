import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { WorkoutPlan, getWorkoutPlan } from "../data/workoutPlans";
import { Id } from "../../convex/_generated/dataModel";

interface WorkoutSessionProps {
  date: string;
  type: 'cardio' | 'strength' | 'stretching';
  onClose: () => void;
}

export function WorkoutSession({ date, type, onClose }: WorkoutSessionProps) {
  const [workoutPlan] = useState<WorkoutPlan>(() => getWorkoutPlan(type));
  const [currentSessionId, setCurrentSessionId] = useState<Id<"workoutSessions"> | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const sessions = useQuery(api.fitness.getDayWorkoutSessions, { date });
  const startSession = useMutation(api.fitness.startWorkoutSession);
  const completeSession = useMutation(api.fitness.completeWorkoutSession);
  const updateStep = useMutation(api.fitness.updateSessionStep);

  const currentSession = sessions?.find(s => s.type === type);

  useEffect(() => {
    if (currentSession) {
      setCurrentSessionId(currentSession._id);
      setIsStarted(currentSession.status === "in_progress" || currentSession.status === "completed");
      if (currentSession.startTime) {
        setStartTime(currentSession.startTime);
        if (currentSession.status === "in_progress") {
          setElapsedTime(Math.floor((Date.now() - currentSession.startTime) / 1000));
        } else if (currentSession.endTime) {
          setElapsedTime(Math.floor((currentSession.endTime - currentSession.startTime) / 1000));
        }
      }
    }
  }, [currentSession]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && currentSession?.status === "in_progress" && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, currentSession?.status, startTime]);

  const handleStartWorkout = async () => {
    try {
      const sessionId = await startSession({
        date,
        type,
        planId: workoutPlan.id,
      });
      setCurrentSessionId(sessionId);
      setIsStarted(true);
      setStartTime(Date.now());
      toast.success("Тренування розпочато!");
    } catch (error) {
      toast.error("Помилка при початку тренування");
    }
  };

  const handleCompleteWorkout = async () => {
    if (!currentSessionId) return;
    
    try {
      await completeSession({ sessionId: currentSessionId });
      toast.success("Тренування завершено!");
      onClose();
    } catch (error) {
      toast.error("Помилка при завершенні тренування");
    }
  };

  const handleStepToggle = async (stepIndex: number, completed: boolean) => {
    if (!currentSessionId) return;
    
    try {
      await updateStep({
        sessionId: currentSessionId,
        stepIndex,
        completed,
      });
    } catch (error) {
      toast.error("Помилка при оновленні кроку");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getWorkoutIcon = (type: string) => {
    switch (type) {
      case 'cardio': return '🏃';
      case 'strength': return '💪';
      case 'stretching': return '🧘';
      default: return '🏋️';
    }
  };

  const completedSteps = currentSession?.completedSteps || [];
  const progressPercentage = (completedSteps.length / workoutPlan.steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 m-0">
      <div className="bg-white rounded-3xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-700 to-primary-900 text-white p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">{getWorkoutIcon(type)}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{workoutPlan.name}</h2>
                <p className="text-primary-100 mt-1">{workoutPlan.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl font-bold w-10 h-10 rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              ×
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm font-medium">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {workoutPlan.duration}
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {workoutPlan.difficulty}
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                {completedSteps.length}/{workoutPlan.steps.length} кроків
              </span>
            </div>
            {isStarted && (
              <div className="text-right">
                <div className="text-3xl font-bold">{formatTime(elapsedTime)}</div>
                <div className="text-primary-100 text-sm font-medium">Час тренування</div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm font-medium mb-3">
              <span>Прогрес</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-primary-600/30 rounded-full h-3">
              <div 
                className="bg-white rounded-full h-3 transition-all duration-500 shadow-soft"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          {!isStarted ? (
            <div className="text-center py-12">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-primary-900 mb-3">Готові розпочати тренування?</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Переконайтеся, що у вас є необхідне обладнання: <span className="font-medium">{workoutPlan.equipment.join(', ')}</span>
                </p>
              </div>
              <button
                onClick={handleStartWorkout}
                className="bg-success-600 text-white px-10 py-4 rounded-xl font-semibold hover:bg-success-700 transition-all duration-200 shadow-soft hover:shadow-medium"
              >
                Розпочати тренування
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {workoutPlan.steps.map((step, index) => {
                const isCompleted = completedSteps.includes(index);
                
                return (
                  <div
                    key={step.id}
                    className={`border-2 rounded-xl p-6 transition-all duration-200 ${
                      isCompleted 
                        ? 'border-success-300 bg-success-50' 
                        : 'border-neutral-200 bg-white hover:border-accent-300 hover:shadow-soft'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => handleStepToggle(index, !isCompleted)}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          isCompleted
                            ? 'bg-success-500 border-success-500 text-white shadow-soft'
                            : 'border-neutral-300 hover:border-accent-500 hover:bg-accent-50'
                        }`}
                        disabled={currentSession?.status === "completed"}
                      >
                        {isCompleted && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className={`text-lg font-semibold ${isCompleted ? 'text-success-800' : 'text-primary-900'}`}>
                            {step.name}
                          </h4>
                          <div className="flex items-center gap-3 text-sm font-medium text-neutral-600">
                            {step.duration && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                {step.duration}
                              </span>
                            )}
                            {step.reps && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                </svg>
                                {step.reps}
                              </span>
                            )}
                            {step.sets && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                                {step.sets} підходів
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-neutral-700 mb-3 leading-relaxed">{step.description}</p>
                        
                        {step.restTime && (
                          <p className="text-sm text-accent-600 mb-3 font-medium">
                            💤 Відпочинок: {step.restTime}
                          </p>
                        )}
                        
                        {step.tips && step.tips.length > 0 && (
                          <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
                            <p className="text-sm font-semibold text-neutral-700 mb-2">💡 Поради:</p>
                            <ul className="text-sm text-neutral-600 space-y-1">
                              {step.tips.map((tip, tipIndex) => (
                                <li key={tipIndex} className="flex items-start gap-2">
                                  <span className="text-accent-500 mt-1 font-bold">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {isStarted && currentSession?.status !== "completed" && (
          <div className="border-t border-neutral-200 bg-neutral-50 p-8">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium text-neutral-600">
                Завершено: <span className="font-semibold text-primary-900">{completedSteps.length}</span> из <span className="font-semibold text-primary-900">{workoutPlan.steps.length}</span> шагов
              </div>
              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-neutral-600 hover:text-neutral-800 font-medium transition-colors rounded-xl hover:bg-neutral-100"
                >
                  Пауза
                </button>
                <button
                  onClick={handleCompleteWorkout}
                  className="bg-success-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-success-700 transition-all duration-200 shadow-soft hover:shadow-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={completedSteps.length === 0}
                >
                  Завершить тренировку
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
