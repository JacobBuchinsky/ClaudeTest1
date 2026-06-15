
import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'claudetest1.todos'

// Load the saved list once, before the first render, so there's no flicker.
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export default function App() {
  const [todos, setTodos] = useState(loadTodos)
  const [text, setText] = useState('')
  const [filter, setFilter] = useState('all') // all | active | done
  const [flying, setFlying] = useState([]) // entries mid delete-animation

  // Persist to the browser whenever the list changes.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  function addTodo(e) {
    e.preventDefault()
    const value = text.trim()
    if (!value) return
    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: value, done: false },
    ])
    setText('')
  }

  function toggle(id) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    )
  }

  function remove(id, e) {
    // Snapshot where the row currently sits on screen, then launch a
    // detached "flyer" that bounces+spins across the viewport and explodes.
    const row = e.currentTarget.closest('.item')
    const item = todos.find((t) => t.id === id)
    if (row && item) {
      const r = row.getBoundingClientRect()
      setFlying((prev) => [
        ...prev,
        {
          key: crypto.randomUUID(),
          text: item.text,
          x: r.left,
          y: r.top,
          width: r.width,
        },
      ])
    }
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  function clearDone() {
    setTodos((prev) => prev.filter((t) => !t.done))
  }

  const visible = todos.filter((t) =>
    filter === 'active' ? !t.done : filter === 'done' ? t.done : true,
  )
  const remaining = todos.filter((t) => !t.done).length

  return (
    <main className="app">
      <h1>To-Do</h1>

      <form className="add" onSubmit={addTodo}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs doing?"
          aria-label="New to-do"
        />
        <button type="submit">Add</button>
      </form>

      <ul className="list">
        {visible.length === 0 && (
          <li className="empty">Nothing here yet.</li>
        )}
        {visible.map((t) => (
          <li key={t.id} className={t.done ? 'item done' : 'item'}>
            <label>
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggle(t.id)}
              />
              <span>{t.text}</span>
            </label>
            <button
              className="remove"
              onClick={(e) => remove(t.id, e)}
              aria-label={`Delete "${t.text}"`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <footer className="bar">
        <span>{remaining} left</span>
        <div className="filters">
          {['all', 'active', 'done'].map((f) => (
            <button
              key={f}
              className={filter === f ? 'active' : ''}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="clear" onClick={clearDone}>
          Clear done
        </button>
      </footer>

      <div className="fly-layer" aria-hidden="true">
        {flying.map((f) => (
          <FlyingItem
            key={f.key}
            anim={f}
            onDone={() =>
              setFlying((prev) => prev.filter((x) => x.key !== f.key))
            }
          />
        ))}
      </div>
    </main>
  )
}

// A single deleted entry's send-off: it bounces and spins across the screen,
// then bursts into a shower of particles before vanishing.
function FlyingItem({ anim, onDone }) {
  const [phase, setPhase] = useState('fly') // fly -> boom

  useEffect(() => {
    const toBoom = setTimeout(() => setPhase('boom'), 1300)
    const cleanup = setTimeout(onDone, 1300 + 650)
    return () => {
      clearTimeout(toBoom)
      clearTimeout(cleanup)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Random spray of particles, generated once.
  const particles = useMemo(
    () =>
      Array.from({ length: 16 }, () => ({
        dx: (Math.random() * 2 - 1) * 180,
        dy: (Math.random() * 2 - 1) * 180,
        rot: Math.random() * 720 - 360,
        delay: Math.random() * 0.06,
        hue: Math.floor(Math.random() * 360),
      })),
    [],
  )

  return (
    <div
      className={phase === 'boom' ? 'flyer fly boom' : 'flyer fly'}
      style={{ left: anim.x, top: anim.y, width: anim.width }}
    >
      <div className="flyer-chip">{anim.text}</div>
      {phase === 'boom' &&
        particles.map((p, i) => (
          <span
            key={i}
            className="particle"
            style={{
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
              '--rot': `${p.rot}deg`,
              animationDelay: `${p.delay}s`,
              background: `hsl(${p.hue} 90% 60%)`,
            }}
          />
        ))}
    </div>
  )
}