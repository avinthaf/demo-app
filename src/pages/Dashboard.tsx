import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Task {
  id: string
  title: string
  completed: boolean
  due_date: string | null
  created_at: string
}

interface Stats {
  total: number
  completed: number
  pending: number
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, pending: 0 })
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      setUserEmail(session?.user?.email ?? '')

      const { data } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      const all = data ?? []
      setTasks(all)
      setStats({
        total: all.length,
        completed: all.filter(t => t.completed).length,
        pending: all.filter(t => !t.completed).length,
      })
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { label: 'Total Tasks', value: stats.total, color: 'bg-violet-50 text-violet-700' },
    { label: 'Completed', value: stats.completed, color: 'bg-green-50 text-green-700' },
    { label: 'Pending', value: stats.pending, color: 'bg-amber-50 text-amber-700' },
  ]

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back{userEmail ? `, ${userEmail.split('@')[0]}` : ''}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Here's what's on your plate today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-1">{card.label}</p>
            <p className={`text-3xl font-bold ${card.color.split(' ')[1]}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent tasks */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Recent Tasks</h2>
          <Link to="/tasks" className="text-xs text-violet-600 hover:text-violet-700 font-medium">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-sm text-gray-400 text-center">Loading…</div>
        ) : tasks.length === 0 ? (
          <div className="px-6 py-8 text-sm text-gray-400 text-center">
            No tasks yet.{' '}
            <Link to="/tasks" className="text-violet-600 hover:underline">
              Create one →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {tasks.map(task => (
              <li key={task.id} className="flex items-center gap-3 px-6 py-3.5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${task.completed ? 'bg-green-400' : 'bg-amber-400'}`} />
                <span className={`text-sm flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {task.title}
                </span>
                {task.due_date && (
                  <span className="text-xs text-gray-400">{task.due_date}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
