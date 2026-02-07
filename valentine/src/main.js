import './style.css'

// Default name when ?name= is missing (set to '' for generic heading only)
const DEFAULT_NAME = 'lama'

function getValentineName() {
  const params = new URLSearchParams(window.location.search)
  const fromUrl = params.get('name')?.trim()
  return fromUrl || DEFAULT_NAME
}

function getTitleText() {
  const name = getValentineName()
  return name ? `Will you be my valentine, ${name}?` : 'Will you be my valentine?'
}

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const app = document.querySelector('#app')
app.innerHTML = `
  <div class="floating-hearts" aria-hidden="true">
    <span class="heart heart-1">♥</span>
    <span class="heart heart-2">♥</span>
    <span class="heart heart-3">♥</span>
    <span class="heart heart-4">♥</span>
    <span class="heart heart-5">♥</span>
    <span class="heart heart-6">♥</span>
    <span class="heart heart-7">♥</span>
    <span class="heart heart-8">♥</span>
    <span class="heart heart-9">♥</span>
    <span class="heart heart-10">♥</span>
  </div>
  <main class="page">
    <div class="card" id="card">
      <h1 class="card-title" id="card-title">${getTitleText()}</h1>
      <p class="card-subtitle" id="card-subtitle">Choose wisely 😌</p>
      <div class="card-buttons" id="card-buttons">
        <button type="button" class="btn btn-yes" id="btn-yes">Yes</button>
        <span class="btn-no-placeholder" id="btn-no-placeholder" aria-hidden="true"></span>
      </div>
    </div>
    <footer class="page-footer">Made with ❤️</footer>
  </main>
`

const btnYes = document.querySelector('#btn-yes')
const placeholder = document.querySelector('#btn-no-placeholder')

const noButton = document.createElement('button')
noButton.type = 'button'
noButton.className = 'btn btn-no'
noButton.id = 'btn-no'
noButton.textContent = 'No'

if (prefersReducedMotion()) {
  const cardButtons = document.querySelector('#card-buttons')
  const place = document.querySelector('#btn-no-placeholder')
  cardButtons?.insertBefore(noButton, place)
  place?.remove()
} else {
  noButton.classList.add('btn-no-runaway')
  app.appendChild(noButton)
}

const RUNWAY_RADIUS = 120
const VIEWPORT_PADDING = 16
const MOVE_COOLDOWN_MS = 400

let lastMoveTime = 0

function getViewportBounds() {
  const w = app.clientWidth
  const h = app.clientHeight
  const bw = noButton.offsetWidth
  const bh = noButton.offsetHeight
  const padding = VIEWPORT_PADDING
  return {
    minX: padding,
    maxX: Math.max(padding, w - bw - padding),
    minY: padding,
    maxY: Math.max(padding, h - bh - padding),
  }
}

function placeNoButtonAt(x, y) {
  noButton.style.left = `${x}px`
  noButton.style.top = `${y}px`
}

function randomPositionInBounds() {
  const b = getViewportBounds()
  if (b.maxX <= b.minX || b.maxY <= b.minY) return null
  const x = b.minX + Math.random() * (b.maxX - b.minX)
  const y = b.minY + Math.random() * (b.maxY - b.minY)
  return { x, y }
}

function moveNoButton() {
  const pos = randomPositionInBounds()
  if (pos) placeNoButtonAt(pos.x, pos.y)
  lastMoveTime = Date.now()
}

function initNoButtonPosition() {
  const appRect = app.getBoundingClientRect()
  const placeRect = placeholder.getBoundingClientRect()
  const x = placeRect.left - appRect.left - app.clientLeft
  const y = placeRect.top - appRect.top - app.clientTop
  placeNoButtonAt(x, y)
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1)
}

function handleMouseMove(e) {
  if (Date.now() - lastMoveTime < MOVE_COOLDOWN_MS) return
  const btnRect = noButton.getBoundingClientRect()
  const cx = btnRect.left + btnRect.width / 2
  const cy = btnRect.top + btnRect.height / 2
  const d = distance(e.clientX, e.clientY, cx, cy)
  if (d < RUNWAY_RADIUS) moveNoButton()
}

function handleNoTouchStart(e) {
  e.preventDefault()
  moveNoButton()
}

if (!prefersReducedMotion()) {
  initNoButtonPosition()
  window.addEventListener('resize', initNoButtonPosition)
  document.addEventListener('mousemove', handleMouseMove)
  noButton.addEventListener('touchstart', handleNoTouchStart, { passive: false })
}

if (btnYes) {
  btnYes.addEventListener('click', () => {
    const cardTitle = document.querySelector('#card-title')
    const cardSubtitle = document.querySelector('#card-subtitle')
    const cardButtons = document.querySelector('#card-buttons')
    if (cardTitle) cardTitle.textContent = 'Yeyy mee 🎉💖'
    if (cardSubtitle) cardSubtitle.style.display = 'none'
    if (cardButtons) cardButtons.style.display = 'none'
    if (noButton) noButton.style.display = 'none'
    if (prefersReducedMotion()) {
      const msg = document.createElement('p')
      msg.className = 'celebration-message'
      msg.textContent = 'Thank you! 💕'
      document.getElementById('card')?.appendChild(msg)
    } else {
      runFireworks(4000)
    }
  })
}

if (noButton) {
  noButton.addEventListener('click', () => {
    alert('Maybe next time… 💔')
  })
}

// ——— Fireworks (canvas overlay) ———

const GRAVITY = 0.28
const PARTICLE_COUNT = 45
const BURST_SPEED_MIN = 4
const BURST_SPEED_MAX = 11
const PARTICLE_LIFE_DECAY = 0.012
const PARTICLE_SIZE_MIN = 2
const PARTICLE_SIZE_MAX = 4
const BURST_COUNT = 6

function createFireworksCanvas() {
  const canvas = document.createElement('canvas')
  canvas.id = 'fireworks-canvas'
  canvas.className = 'fireworks-canvas'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  return { canvas, ctx }
}

function resizeFireworksCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = window.innerWidth
  const h = window.innerHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
  return dpr
}

function randomValentineColor() {
  const hue = 330 + Math.random() * 50
  const sat = 75 + Math.random() * 25
  const light = 55 + Math.random() * 20
  return `hsl(${hue}, ${sat}%, ${light}%)`
}

function createBurst(cx, cy, viewW, viewH, dpr) {
  const color = randomValentineColor()
  const particles = []
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = BURST_SPEED_MIN + Math.random() * (BURST_SPEED_MAX - BURST_SPEED_MIN)
    const vx = Math.cos(angle) * speed
    const vy = Math.sin(angle) * speed
    particles.push({
      xRatio: cx / viewW,
      yRatio: cy / viewH,
      vx,
      vy,
      life: 1,
      decay: PARTICLE_LIFE_DECAY + Math.random() * 0.008,
      color,
      size: (PARTICLE_SIZE_MIN + Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN)) * dpr,
    })
  }
  return particles
}

function runFireworks(durationMs) {
  const { canvas, ctx } = createFireworksCanvas()
  let dpr = resizeFireworksCanvas(canvas)

  let particles = []
  const startTime = performance.now()
  let rafId = null

  const resizeHandler = () => {
    dpr = resizeFireworksCanvas(canvas)
  }
  window.addEventListener('resize', resizeHandler)

  function tick() {
    const now = performance.now()
    const elapsed = now - startTime
    const viewW = window.innerWidth
    const viewH = window.innerHeight
    const cw = canvas.width
    const ch = canvas.height

    ctx.clearRect(0, 0, cw, ch)

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.xRatio += p.vx / viewW
      p.yRatio += p.vy / viewH
      p.vy += GRAVITY
      p.life -= p.decay
      if (p.life <= 0) {
        particles.splice(i, 1)
        continue
      }
      const x = p.xRatio * cw
      const y = p.yRatio * ch
      ctx.save()
      ctx.globalAlpha = p.life
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(x, y, p.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    if (elapsed < durationMs || particles.length > 0) {
      rafId = requestAnimationFrame(tick)
    } else {
      window.removeEventListener('resize', resizeHandler)
      canvas.remove()
    }
  }

  for (let i = 0; i < BURST_COUNT; i++) {
    const delay = Math.random() * durationMs * 0.85
    setTimeout(() => {
      const viewW = window.innerWidth
      const viewH = window.innerHeight
      const cx = viewW * (0.2 + Math.random() * 0.6)
      const cy = viewH * (0.2 + Math.random() * 0.5)
      particles = particles.concat(createBurst(cx, cy, viewW, viewH, dpr))
    }, delay)
  }

  rafId = requestAnimationFrame(tick)
}
