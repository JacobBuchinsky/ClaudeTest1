// Synthesized "annoyingly loud crunchy explosion" via the Web Audio API.
// No audio files needed — it's generated noise + distortion + a low boom.

let ctx

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    ctx = new AC()
  }
  // Browsers start the context suspended until a user gesture; resume it.
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// Call this from inside a click handler so the browser unlocks audio.
export function armAudio() {
  getCtx()
}

// A waveshaper curve — higher amount = nastier, crunchier distortion.
function distortionCurve(amount) {
  const n = 8192
  const curve = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1
    curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x))
  }
  return curve
}

export function playCrunch() {
  const ac = getCtx()
  const now = ac.currentTime

  const master = ac.createGain()
  master.gain.value = 1.0 // full scale — intentionally loud
  master.connect(ac.destination)

  // --- 1) Crunchy distorted noise burst ---
  const dur = 0.55
  const len = Math.floor(ac.sampleRate * dur)
  const buffer = ac.createBuffer(1, len, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) {
    // Decaying white noise, with crackle from occasional hard spikes.
    const decay = Math.pow(1 - i / len, 1.8)
    let s = (Math.random() * 2 - 1) * decay
    if (Math.random() > 0.85) s *= 1.8 // crackle spikes
    data[i] = s
  }
  const noise = ac.createBufferSource()
  noise.buffer = buffer

  const shaper = ac.createWaveShaper()
  shaper.curve = distortionCurve(120)
  shaper.oversample = '4x'

  const band = ac.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.setValueAtTime(2400, now)
  band.frequency.exponentialRampToValueAtTime(500, now + dur)
  band.Q.value = 0.6

  const noiseGain = ac.createGain()
  noiseGain.gain.setValueAtTime(0.0001, now)
  noiseGain.gain.exponentialRampToValueAtTime(1.4, now + 0.004)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + dur)

  noise.connect(shaper)
  shaper.connect(band)
  band.connect(noiseGain)
  noiseGain.connect(master)

  // --- 2) Low boom thump for body ---
  const osc = ac.createOscillator()
  osc.type = 'square'
  osc.frequency.setValueAtTime(180, now)
  osc.frequency.exponentialRampToValueAtTime(38, now + 0.3)
  const boomGain = ac.createGain()
  boomGain.gain.setValueAtTime(0.9, now)
  boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
  osc.connect(boomGain)
  boomGain.connect(master)

  noise.start(now)
  noise.stop(now + dur)
  osc.start(now)
  osc.stop(now + 0.4)
}

// A horrifying robotic screech for the jumpscare: a dissonant cluster of
// detuned descending sawtooths + harsh noise, hard-distorted and tremolo'd.
export function playScreech() {
  const ac = getCtx()
  const now = ac.currentTime
  const dur = 1.2

  const master = ac.createGain()
  master.gain.value = 1.0 // full scale — this is meant to hurt
  master.connect(ac.destination)

  const shaper = ac.createWaveShaper()
  shaper.curve = distortionCurve(220)
  shaper.oversample = '4x'
  shaper.connect(master)

  // Fast amplitude wobble => robotic "scream" texture.
  const tremolo = ac.createGain()
  tremolo.gain.value = 0.6
  tremolo.connect(shaper)
  const lfo = ac.createOscillator()
  lfo.type = 'square'
  lfo.frequency.value = 30
  const lfoGain = ac.createGain()
  lfoGain.gain.value = 0.4
  lfo.connect(lfoGain)
  lfoGain.connect(tremolo.gain)

  // Envelope: instant attack, hold, quick release.
  const env = ac.createGain()
  env.gain.setValueAtTime(0.0001, now)
  env.gain.exponentialRampToValueAtTime(1.0, now + 0.015)
  env.gain.setValueAtTime(1.0, now + dur - 0.18)
  env.gain.exponentialRampToValueAtTime(0.001, now + dur)
  env.connect(tremolo)

  // Dissonant detuned sawtooth cluster, wailing downward.
  const freqs = [110, 117, 220, 233, 330, 467]
  const oscs = freqs.map((f) => {
    const o = ac.createOscillator()
    o.type = 'sawtooth'
    o.frequency.setValueAtTime(f * 2.2, now)
    o.frequency.exponentialRampToValueAtTime(f, now + dur)
    o.connect(env)
    return o
  })

  // Harsh white-noise layer on top.
  const len = Math.floor(ac.sampleRate * dur)
  const buf = ac.createBuffer(1, len, ac.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  const noise = ac.createBufferSource()
  noise.buffer = buf
  const noiseGain = ac.createGain()
  noiseGain.gain.value = 0.45
  noise.connect(noiseGain)
  noiseGain.connect(env)

  lfo.start(now)
  noise.start(now)
  oscs.forEach((o) => o.start(now))
  lfo.stop(now + dur)
  noise.stop(now + dur)
  oscs.forEach((o) => o.stop(now + dur))
}
