import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AppProvider } from './contexts/AppContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import CreateWorksheet from './pages/CreateWorksheet'
import CreateVisualAid from './pages/CreateVisualAid'
import CreateStory from './pages/CreateStory'
import CreateELI5 from './pages/CreateELI5'
import CreateGame from './pages/CreateGame'
import CreateLessonPlan from './pages/CreateLessonPlan'
import CreateFluencyAssessment from './pages/CreateFluencyAssessment'
import Assessment from './pages/Assessment'
import Community from './pages/Community'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-sahayak-gray-50">
            <Routes>
              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/onboarding" element={<Onboarding />} />

              {/* Main App Routes with Layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />

                {/* Content Creation Routes */}
                <Route path="/create/worksheet" element={<CreateWorksheet />} />
                <Route path="/create/visual-aid" element={<CreateVisualAid />} />
                <Route path="/create/story" element={<CreateStory />} />
                <Route path="/create/eli5" element={<CreateELI5 />} />
                <Route path="/create/game" element={<CreateGame />} />
                <Route path="/create/lesson-plan" element={<CreateLessonPlan />} />
                <Route path="/create/fluency-assessment" element={<CreateFluencyAssessment />} />

                {/* Assessment Routes */}
                <Route path="/assess" element={<Assessment />} />

                {/* Community Routes */}
                <Route path="/community" element={<Community />} />

                {/* Profile & Settings */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
