import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function StatsSection() {
  const stats = useQuery(api.fitness.getUserStats);

  if (!stats) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-neutral-200 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-neutral-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (milliseconds: number) => {
    const totalMinutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}г ${minutes}хв`;
    }
    return `${minutes}хв`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayNames = ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
    return `${dayNames[date.getDay()]} ${date.getDate()}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-8">
      <h3 className="text-2xl font-semibold text-primary-900 mb-8 tracking-tight">Статистика</h3>
      
      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="text-center p-6 bg-accent-50 rounded-xl border border-accent-100">
          <div className="text-3xl font-bold text-accent-700 mb-1">{stats.totalWorkouts}</div>
          <div className="text-sm font-medium text-neutral-600">Всього тренувань</div>
        </div>
        
        <div className="text-center p-6 bg-success-50 rounded-xl border border-success-100">
          <div className="text-3xl font-bold text-success-700 mb-1">
            {formatTime(stats.totalWorkoutTime)}
          </div>
          <div className="text-sm font-medium text-neutral-600">Загальний час</div>
        </div>
        
        <div className="text-center p-6 bg-primary-50 rounded-xl border border-primary-100">
          <div className="text-3xl font-bold text-primary-700 mb-1">
            {formatTime(stats.averageWorkoutTime)}
          </div>
          <div className="text-sm font-medium text-neutral-600">Середній час</div>
        </div>
        
        <div className="text-center p-6 bg-neutral-100 rounded-xl border border-neutral-200">
          <div className="text-3xl font-bold text-neutral-700 mb-1">{stats.currentStreak}</div>
          <div className="text-sm font-medium text-neutral-600">Днів поспіль</div>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div>
        <h4 className="text-lg font-semibold text-primary-900 mb-6">Активність за тиждень</h4>
        <div className="grid grid-cols-7 gap-3">
          {stats.last7Days.map((day, index) => {
            const maxWorkouts = Math.max(...stats.last7Days.map(d => d.workouts), 1);
            const height = day.workouts > 0 ? Math.max((day.workouts / maxWorkouts) * 100, 20) : 8;
            
            return (
              <div key={index} className="text-center">
                <div className="mb-3 flex items-end justify-center h-24">
                  <div
                    className={`w-10 rounded-t-lg transition-all duration-300 ${
                      day.workouts > 0 
                        ? 'bg-gradient-to-t from-accent-600 to-accent-500 shadow-soft' 
                        : 'bg-neutral-200'
                    }`}
                    style={{ height: `${height}%` }}
                    title={`${day.workouts} тренувань, ${formatTime(day.totalTime)}`}
                  ></div>
                </div>
                <div className="text-xs font-medium text-neutral-500 mb-1">
                  {formatDate(day.date)}
                </div>
                <div className="text-sm font-semibold text-primary-900">
                  {day.workouts}
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-neutral-500 mt-4 text-center font-medium">
          Кількість тренувань за днями
        </div>
      </div>
    </div>
  );
}
