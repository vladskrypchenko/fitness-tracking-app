'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import AuthScreen from '@/components/AuthScreen'
import Header from '@/components/Header'
import Dashboard from '@/components/Overview'
import Workouts from '@/components/Workouts'
import Calendar from '@/components/Calendar'

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  // переконуємося що демо користувач існує
  const ensureDemoUser = useMutation(api.users.ensureDemoUser)
  
  // перевіряємо збережений стан авторизації
  useEffect(() => {
    const savedAuth = localStorage.getItem('isAuthenticated')
    const savedProfile = localStorage.getItem('userProfile')
    
    if (savedAuth === 'true' && savedProfile) {
      setIsAuthenticated(true)
      setUserProfile(JSON.parse(savedProfile))
    }
  }, [])

  // ініціалізуємо демо користувача якщо потрібно
  useEffect(() => {
    const initializeUser = async () => {
      try {
        await ensureDemoUser()
      } catch (error) {
        console.error('Error creating demo user:', error)
      }
    }

    initializeUser()
  }, [ensureDemoUser])

  const handleLogin = (profile: any) => {
    setUserProfile(profile)
    setIsAuthenticated(true)
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('userProfile', JSON.stringify(profile))
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserProfile(null)
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userProfile')
    setActiveTab('overview')
  }

  const handleWorkoutComplete = () => {
    // логіка завершення тренування обробляється окремими компонентами
  }


  // показуємо екран авторизації якщо не авторизований
  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        userProfile={userProfile}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {activeTab === 'overview' && (
          <Dashboard 
            userProfile={userProfile}
            onLogout={handleLogout}
          />
        )}
        
        {activeTab === 'workouts' && (
          <Workouts 
            onWorkoutComplete={handleWorkoutComplete}
          />
        )}
        
        {activeTab === 'calendar' && (
          <Calendar />
        )}
      </main>
    </div>
  )
}