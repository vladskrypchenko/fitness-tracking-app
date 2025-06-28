"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-3xl shadow-strong p-8 border border-neutral-100">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-primary-900 mb-2">
            {flow === "signIn" ? "Вхід до системи" : "Реєстрація"}
          </h2>
          <p className="text-neutral-600">
            {flow === "signIn" 
              ? "Ласкаво просимо! Увійдіть до свого акаунту"
              : "Створіть акаунт для початку тренувань"
            }
          </p>
        </div>

      <form
          className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData).catch((error) => {
            let toastTitle = "";
            if (error.message.includes("Invalid password")) {
                toastTitle = "Невірний пароль. Спробуйте ще раз.";
            } else {
              toastTitle =
                flow === "signIn"
                    ? "Не вдалося увійти. Можливо, потрібно зареєструватися?"
                    : "Не вдалося зареєструватися. Можливо, потрібно увійти?";
            }
            toast.error(toastTitle);
            setSubmitting(false);
          });
        }}
      >
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-primary-900">
              Email адреса
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
        <input
                id="email"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 focus:bg-white outline-none transition-all duration-200 text-primary-900 placeholder-neutral-500"
          type="email"
          name="email"
                placeholder="your@email.com"
          required
        />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-primary-900">
              Пароль
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
        <input
                id="password"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 focus:bg-white outline-none transition-all duration-200 text-primary-900 placeholder-neutral-500"
          type="password"
          name="password"
                placeholder="Введіть пароль"
          required
        />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            className="w-full py-3 px-4 bg-gradient-to-r from-accent-600 to-accent-700 text-white font-semibold rounded-xl hover:from-accent-700 hover:to-accent-800 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-medium hover:shadow-strong disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            type="submit" 
            disabled={submitting}
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Зачекайте...</span>
              </div>
            ) : (
              flow === "signIn" ? "Увійти" : "Зареєструватися"
            )}
        </button>
        </form>

        {/* Toggle Flow */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600">
            {flow === "signIn"
              ? "Немає акаунту? "
              : "Вже є акаунт? "}
          <button
            type="button"
              className="text-accent-600 hover:text-accent-700 font-semibold hover:underline transition-colors duration-200"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
              {flow === "signIn" ? "Зареєструватися" : "Увійти"}
          </button>
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-1 border-t border-neutral-200"></div>
          <span className="px-4 text-sm text-neutral-500 bg-white">або</span>
          <div className="flex-1 border-t border-neutral-200"></div>
        </div>

        {/* Anonymous Sign In */}
        <button 
          className="w-full py-3 px-4 bg-neutral-100 text-neutral-700 font-medium rounded-xl hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:ring-offset-2 transition-all duration-200 border border-neutral-200 hover:border-neutral-300"
          onClick={() => void signIn("anonymous")}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            <span>Увійти анонімно</span>
          </div>
        </button>
      </div>
    </div>
  );
}
