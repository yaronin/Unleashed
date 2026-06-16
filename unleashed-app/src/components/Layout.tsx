import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const tabs = [
  { to: '/', label: 'Today', end: true },
  { to: '/progress', label: 'Progress' },
  { to: '/library', label: 'Library' },
  { to: '/settings', label: 'Settings' },
]

export function Layout() {
  const { isAdmin } = useAuth()

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-surface-overlay px-4 py-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-accent">Unleashed Beginner</h1>
            <p className="text-xs text-slate-400">Vitaliy Fechuk · Calisthenics</p>
          </div>
          {isAdmin && (
            <NavLink to="/admin" className="text-xs text-accent underline">
              Admin
            </NavLink>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-surface-overlay bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg justify-around px-2 py-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-xs font-medium transition ${
                  isActive ? 'bg-accent/20 text-accent' : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
