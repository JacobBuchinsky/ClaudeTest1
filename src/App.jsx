
import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { armAudio, playCrunch, playScreech } from './crunch'

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
  const [scare, setScare] = useState(false) // jumpscare overlay visible

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
    armAudio() // unlock audio within this click gesture
    // Snapshot where the row currently sits on screen, then launch a
    // detached "flyer" that ricochets+spins around the viewport and explodes.
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
    armAudio() // unlock audio within this click gesture
    setScare(true)
    playScreech()
    setTimeout(() => setScare(false), 1200)
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

      {scare && <JumpScare />}
    </main>
  )
}

// Full-screen FNAF-style jumpscare: an original creepy animatronic face
// (drawn in SVG, no third-party assets) that slams in shaking and flickering.
function JumpScare() {
  const mouthL = 52
  const mouthR = 148
  const count = 7
  const w = (mouthR - mouthL) / count
  const topTeeth = Array.from(
    { length: count },
    (_, i) =>
      `${mouthL + i * w},116 ${mouthL + (i + 1) * w},116 ${mouthL + (i + 0.5) * w},148`,
  )
  const botTeeth = Array.from(
    { length: count },
    (_, i) =>
      `${mouthL + i * w},172 ${mouthL + (i + 1) * w},172 ${mouthL + (i + 0.5) * w},140`,
  )

  return (
    <div className="jumpscare" role="alert" aria-label="Jumpscare!">
      <div className="jumpscare-shake">
        <svg
          className="jumpscare-face"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="js-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ears */}
          <circle cx="42" cy="28" r="24" fill="#16181b" />
          <circle cx="158" cy="28" r="24" fill="#16181b" />
          <circle cx="42" cy="28" r="12" fill="#0a0b0c" />
          <circle cx="158" cy="28" r="12" fill="#0a0b0c" />

          {/* head */}
          <ellipse
            cx="100"
            cy="102"
            rx="80"
            ry="90"
            fill="#1d1f22"
            stroke="#000"
            strokeWidth="3"
          />

          {/* eye sockets + glowing pupils */}
          <ellipse cx="68" cy="80" rx="24" ry="19" fill="#000" />
          <ellipse cx="132" cy="80" rx="24" ry="19" fill="#000" />
          <circle cx="68" cy="80" r="8" fill="#ff2222" filter="url(#js-glow)" />
          <circle cx="132" cy="80" r="8" fill="#ff2222" filter="url(#js-glow)" />
          <circle cx="68" cy="80" r="3.2" fill="#fff" />
          <circle cx="132" cy="80" r="3.2" fill="#fff" />

          {/* nose */}
          <polygon points="92,100 108,100 100,112" fill="#0a0b0c" />

          {/* mouth cavity */}
          <rect x="50" y="116" width="100" height="58" rx="6" fill="#040404" />

          {/* teeth */}
          {topTeeth.map((pts, i) => (
            <polygon
              key={`t${i}`}
              points={pts}
              fill="#e9e7d6"
              stroke="#8f8c79"
              strokeWidth="0.6"
            />
          ))}
          {botTeeth.map((pts, i) => (
            <polygon
              key={`b${i}`}
              points={pts}
              fill="#e9e7d6"
              stroke="#8f8c79"
              strokeWidth="0.6"
            />
          ))}

          {/* rust / blood streaks under the eyes */}
          <path
            d="M66 92 Q63 120 67 150"
            stroke="#5a1010"
            strokeWidth="2.5"
            fill="none"
            opacity="0.75"
          />
          <path
            d="M134 92 Q137 122 133 152"
            stroke="#5a1010"
            strokeWidth="2.5"
            fill="none"
            opacity="0.75"
          />
        </svg>
      </div>
    </div>
  )
}

// A single deleted entry's send-off: it ricochets off the page edges while
// spinning, then bursts into a shower of particles before vanishing.
const FLY_MS = 1800 // how long it bounces before exploding
const BOOM_MS = 650 // particle lifetime after impact

function FlyingItem({ anim, onDone }) {
  const ref = useRef(null)
  const [phase, setPhase] = useState('fly') // fly -> boom

  useEffect(() => {
    const el = ref.current

    // Respect reduced-motion: skip the joyride, just pop in place.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setPhase('boom')
      playCrunch()
      const t = setTimeout(onDone, BOOM_MS)
      return () => clearTimeout(t)
    }

    const w = anim.width
    const h = el ? el.offsetHeight : 44
    const W = window.innerWidth
    const H = window.innerHeight

    // Position (top-left, in viewport px) and velocity (px/sec).
    let x = anim.x
    let y = anim.y
    const dir = Math.random() < 0.5 ? -1 : 1
    let vx = dir * (560 + Math.random() * 320)
    let vy = -(640 + Math.random() * 240)
    let rot = 0
    const spin = dir * (640 + Math.random() * 520) // deg/sec

    const GRAVITY = 1600 // px/sec^2
    const BOUNCE = 0.86 // energy kept per wall hit

    let raf
    let last
    let start

    const step = (t) => {
      if (start === undefined) {
        start = t
        last = t
      }
      const dt = Math.min((t - last) / 1000, 0.05) // clamp to survive tab stalls
      last = t

      vy += GRAVITY * dt
      x += vx * dt
      y += vy * dt

      // Ricochet off the four edges.
      if (x < 0) {
        x = 0
        vx = -vx * BOUNCE
      } else if (x + w > W) {
        x = W - w
        vx = -vx * BOUNCE
      }
      if (y < 0) {
        y = 0
        vy = -vy * BOUNCE
      } else if (y + h > H) {
        y = H - h
        vy = -vy * BOUNCE
        vx *= 0.96 // floor friction
      }
      rot += spin * dt

      if (el) {
        el.style.transform = `translate(${x - anim.x}px, ${y - anim.y}px) rotate(${rot}deg)`
      }

      if (t - start < FLY_MS) {
        raf = requestAnimationFrame(step)
      } else {
        setPhase('boom')
        playCrunch()
      }
    }

    raf = requestAnimationFrame(step)
    const cleanup = setTimeout(onDone, FLY_MS + BOOM_MS)
    return () => {
      cancelAnimationFrame(raf)
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
      ref={ref}
      className={phase === 'boom' ? 'flyer boom' : 'flyer'}
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