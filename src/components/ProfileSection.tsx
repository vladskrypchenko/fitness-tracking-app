import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface ProfileSectionProps {
  profile: any;
}

const GOALS = {
  lose_weight: "Схуднути",
  gain_muscle: "Набрати м'язову масу",
  maintain_fitness: "Підтримувати форму",
  improve_endurance: "Покращити витривалість"
};

export function ProfileSection({ profile }: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(!profile);
  const [name, setName] = useState(profile?.name || "");
  const [goal, setGoal] = useState(profile?.goal || "lose_weight");
  const updateProfile = useMutation(api.fitness.updateProfile);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Введіть ваше ім'я");
      return;
    }

    try {
      await updateProfile({ name: name.trim(), goal });
      setIsEditing(false);
      toast.success("Профіль оновлено!");
    } catch (error) {
      toast.error("Помилка при збереженні профілю");
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-8">
        <h2 className="text-2xl font-semibold text-primary-900 mb-8 tracking-tight">
          {profile ? "Редагувати профіль" : "Створити профіль"}
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Ваше ім'я
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none transition-all duration-200 shadow-soft hover:shadow-medium text-neutral-800 placeholder-neutral-400"
              placeholder="Введіть ваше ім'я"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Ваша мета
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as any)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none transition-all duration-200 shadow-soft hover:shadow-medium text-neutral-800"
            >
              {Object.entries(GOALS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-primary-800 text-white py-3 px-6 rounded-xl font-medium hover:bg-primary-900 transition-all duration-200 shadow-soft hover:shadow-medium"
            >
              Зберегти
            </button>
            {profile && (
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-neutral-100 text-neutral-700 py-3 px-6 rounded-xl font-medium hover:bg-neutral-200 transition-all duration-200"
              >
                Скасувати
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-primary-900 tracking-tight">Особистий кабінет</h2>
          <p className="text-neutral-600 mt-2">Ваш профіль та цілі</p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="text-accent-600 hover:text-accent-700 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-accent-50"
        >
          Редагувати
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-700 to-primary-900 rounded-2xl flex items-center justify-center shadow-medium">
          <span className="text-white font-semibold text-xl">
            {profile.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-primary-900">{profile.name}</h3>
          <p className="text-neutral-600 mt-1">{GOALS[profile.goal as keyof typeof GOALS]}</p>
        </div>
      </div>
    </div>
  );
}
