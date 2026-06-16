import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { Home } from './pages/Home'
import { Workout } from './pages/Workout'
import { Progress } from './pages/Progress'
import { ExerciseLibrary } from './pages/ExerciseLibrary'
import { Settings } from './pages/Settings'
import { WorkoutDetail } from './pages/WorkoutDetail'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Admin } from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="workout/:week/:dayIndex" element={<Workout />} />
            <Route path="progress" element={<Progress />} />
            <Route path="library" element={<ExerciseLibrary />} />
            <Route path="settings" element={<Settings />} />
            <Route path="history/:id" element={<WorkoutDetail />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="admin" element={<AdminLayout />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function AdminLayout() {
  return (
    <div className="min-h-screen bg-surface px-4 py-6">
      <Admin />
    </div>
  )
}
