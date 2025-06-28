import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { WorkoutSession } from "./WorkoutSession";

interface WeeklyCalendarProps {
  weekStart: string;
  onWeekChange: (weekStart: string) => void;
}

const DAYS = [
  { key: 'monday', label: 'ПН', name: 'Понеділок' },
  { key: 'tuesday', label: 'ВТ', name: 'Вівторок' },
  { key: 'wednesday', label: 'СР', name: 'Середа' },
  { key: 'thursday', label: 'ЧТ', name: 'Четвер' },
  { key: 'friday', label: 'ПТ', name: 'П\'ятниця' },
  { key: 'saturday', label: 'СБ', name: 'Субота' },
  { key: 'sunday', label: 'НД', name: 'Неділя' },
];

const WORKOUT_TYPES = {
  cardio: { 
    label: 'Кардіо', 
    icon: '🏃', 
    colors: 'bg-accent-50 text-accent-700 border-accent-200 hover:bg-accent-100' 
  },
  strength: { 
    label: 'Силова', 
    icon: '💪', 
    colors: 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100' 
  },
  stretching: { 
    label: 'Розтяжка', 
    icon: '🧘', 
    colors: 'bg-success-50 text-success-700 border-success-200 hover:bg-success-100' 
  },
};

export function WeeklyCalendar({ weekStart, onWeekChange }: WeeklyCalendarProps) {
  const [selectedWorkout, setSelectedWorkout] = useState<{
    date: string;
    type: 'cardio' | 'strength' | 'stretching';
  } | null>(null);

  const workouts = useQuery(api.fitness.getWeekWorkouts, { weekStart });

  const getDateForDay = (dayIndex: number) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayIndex);
    return date.toISOString().split('T')[0];
  };

  const getWorkoutForDay = (dayIndex: number, type: keyof typeof WORKOUT_TYPES) => {
    const date = getDateForDay(dayIndex);
    return workouts?.find(w => w.date === date && w.type === type);
  };

  const handleWorkoutClick = (dayIndex: number, type: keyof typeof WORKOUT_TYPES) => {
    const date = getDateForDay(dayIndex);
    setSelectedWorkout({ date, type });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const currentWeek = new Date(weekStart);
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    onWeekChange(newWeek.toISOString().split('T')[0]);
  };

  const formatWeekRange = () => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    const monthNames = ['січ', 'лют', 'бер', 'кві', 'тра', 'чер', 'лип', 'сер', 'вер', 'жов', 'лис', 'гру'];
    
    return `${start.getDate()} ${monthNames[start.getMonth()]} - ${end.getDate()} ${monthNames[end.getMonth()]}`;
  };

  if (!workouts) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-neutral-200 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-40 bg-neutral-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-semibold text-primary-900 tracking-tight">Календар тренувань</h3>
            <p className="text-neutral-600 mt-2 font-medium">{formatWeekRange()}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-all duration-200 text-neutral-600 hover:text-neutral-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => navigateWeek('next')}
              className="p-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-all duration-200 text-neutral-600 hover:text-neutral-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {DAYS.map((day, dayIndex) => {
            const date = new Date(getDateForDay(dayIndex));
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div key={day.key} className="space-y-4">
                <div className="text-center pb-2 border-b border-neutral-100">
                  <div className={`text-sm font-semibold ${isToday ? 'text-accent-600' : 'text-neutral-600'}`}>
                    {day.label}
                  </div>
                  <div className={`text-2xl font-bold mt-1 ${isToday ? 'text-accent-600' : 'text-primary-900'}`}>
                    {date.getDate()}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {Object.entries(WORKOUT_TYPES).map(([type, config]) => {
                    const workout = getWorkoutForDay(dayIndex, type as keyof typeof WORKOUT_TYPES);
                    const isCompleted = workout?.completed || false;
                    
                    return (
                      <button
                        key={type}
                        onClick={() => handleWorkoutClick(dayIndex, type as keyof typeof WORKOUT_TYPES)}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-sm font-medium hover:scale-105 hover:shadow-soft ${
                          isCompleted 
                            ? 'bg-success-100 border-success-300 text-success-800 shadow-soft' 
                            : `${config.colors} border-2`
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-lg">{config.icon}</span>
                          <span>{config.label}</span>
                          {isCompleted && (
                            <svg className="w-4 h-4 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedWorkout && (
        <WorkoutSession
          date={selectedWorkout.date}
          type={selectedWorkout.type}
          onClose={() => setSelectedWorkout(null)}
        />
      )}
    </>
  );
}
