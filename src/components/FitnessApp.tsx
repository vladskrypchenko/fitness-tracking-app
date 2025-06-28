import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ProfileSection } from "./ProfileSection";
import { WeeklyCalendar } from "./WeeklyCalendar";
import { WeeklyStats } from "./WeeklyStats";
import { StatsSection } from "./StatsSection";

type Tab = 'overview' | 'calendar';

interface FitnessAppProps {
  activeTab: Tab;
}

export function FitnessApp({ activeTab }: FitnessAppProps) {
  const profile = useQuery(api.fitness.getUserProfile);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday.toISOString().split('T')[0];
  });

  if (profile === undefined) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-200 border-t-primary-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
      {/* Profile Section */}
      <ProfileSection profile={profile} />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StatsSection />
        </div>
        <div>
          <WeeklyStats weekStart={currentWeekStart} />
        </div>
      </div>
          </div>
        )}
      
        {activeTab === 'calendar' && (
          <div className="animate-in fade-in duration-300">
      <WeeklyCalendar 
        weekStart={currentWeekStart}
        onWeekChange={setCurrentWeekStart}
      />
          </div>
        )}
      </div>
    </div>
  );
}
