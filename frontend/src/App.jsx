import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { DarkModeProvider } from './context/DarkModeContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Today from './pages/Today'
import Inbox from './pages/Inbox'
import Upcoming from './pages/Upcoming'
import Completed from './pages/Completed'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Tags from './pages/Tags'
import Profile from './pages/Profile'

function App() {
  return (
    <Router>
      <DarkModeProvider>
        <AuthProvider>
        <div className="min-h-screen">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/today" element={<Today />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/upcoming" element={<Upcoming />} />
            <Route path="/completed" element={<Completed />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:projectId" element={<ProjectDetail />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Navigate to="/today" replace />} />
          </Routes>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              className: 'dark:bg-gray-800 dark:text-white',
              style: {
                background: 'var(--toast-bg, #333)',
                color: 'var(--toast-color, #fff)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
                className: 'dark:bg-gray-800',
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
      </DarkModeProvider>
    </Router>
  )
}

export default App
