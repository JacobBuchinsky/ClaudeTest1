import { useEffect, useState } from 'react'
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

  function remove(id) {
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
              onClick={() => remove(t.id)}
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
    </main>
  )
}