import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface WeeklyStatsProps {
  weekStart: string;
}

export function WeeklyStats({ weekStart }: WeeklyStatsProps) {
  const stats = useQuery(api.fitness.getWeeklyStats, { weekStart });

  if (!stats) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-8">
        <div className="animate-pulse">
          <div className="h-5 bg-neutral-200 rounded-lg w-1/2 mb-4"></div>
          <div className="h-10 bg-neutral-200 rounded-lg w-2/3"></div>
        </div>
      </div>
    );
  }

  const percentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-success-600 to-success-700 rounded-2xl shadow-medium text-white p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Прогрес тижня</h3>
          <p className="text-success-100 font-medium">Виконані тренування</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold">{stats.completed}</div>
          <div className="text-success-100 font-medium">з {stats.total}</div>
        </div>
      </div>
      
      {stats.total > 0 && (
        <div>
          <div className="flex justify-between text-sm font-medium mb-3">
            <span>Завершено</span>
            <span>{Math.round(percentage)}%</span>
          </div>
          <div className="w-full bg-success-500/30 rounded-full h-3">
            <div 
              className="bg-white rounded-full h-3 transition-all duration-500 shadow-soft"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
