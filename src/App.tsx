import { useState } from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { FitnessApp } from "./components/FitnessApp";

type Tab = 'overview' | 'calendar';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs = [
    {
      id: 'overview' as Tab,
      name: 'Огляд',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'calendar' as Tab,
      name: 'Календар',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <header className="bg-white rounded-2xl shadow-soft border border-neutral-100 p-4 mb-6">
          <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-700 to-primary-900 rounded-lg flex items-center justify-center shadow-soft">
              <span className="text-white font-semibold text-sm">F</span>
            </div>
            <h1 className="text-xl font-semibold text-primary-900 tracking-tight">FitTracker</h1>
          </div>

            {/* Tab Navigation - Centered */}
            <Authenticated>
              <nav className="flex space-x-1 bg-neutral-50 rounded-xl p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-accent-600 to-accent-700 text-white shadow-medium'
                        : 'text-neutral-600 hover:text-primary-900 hover:bg-white'
                    }`}
                  >
                    <span className={`transition-colors duration-200 ${
                      activeTab === tab.id ? 'text-white' : 'text-neutral-500'
                    }`}>
                      {tab.icon}
                    </span>
                    <span className="text-sm">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </Authenticated>

          <Authenticated>
            <SignOutButton />
          </Authenticated>
        </div>
      </header>

        <main>
        <Authenticated>
            <FitnessApp activeTab={activeTab} />
        </Authenticated>
        
        <Unauthenticated>
          <div className="max-w-md mx-auto mt-16">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-700 to-primary-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-medium">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <h2 className="text-3xl font-bold text-primary-900 mb-4 tracking-tight">
                  Ласкаво просимо до FitTracker
              </h2>
              <p className="text-neutral-600 text-lg leading-relaxed">
                  Відстежуйте тренування та досягайте фітнес-цілей з елегантним мінімалізмом
              </p>
            </div>
            <SignInForm />
          </div>
        </Unauthenticated>
      </main>
      </div>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #e5e5e5',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 16px -4px rgba(0, 0, 0, 0.12)',
            fontFamily: 'Inter, sans-serif',
          }
        }}
      />
    </div>
  );
}
