const menuToggle = document.querySelector('.menu-toggle')
const mainNav = document.querySelector('#main-nav')

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true'
  menuToggle.setAttribute('aria-expanded', String(!isOpen))
  menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation')
  mainNav?.classList.toggle('is-open', !isOpen)
})

mainNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('is-open')
    menuToggle?.setAttribute('aria-expanded', 'false')
    menuToggle?.setAttribute('aria-label', 'Open navigation')
  })
})

const year = document.querySelector('#year')
if (year) year.textContent = String(new Date().getFullYear())

const counters = document.querySelectorAll('[data-counter]')
const formatCounter = (counter, value) => {
  const isPadded = counter.dataset.pad === 'true'
  const suffix = counter.dataset.suffix || ''
  const displayedValue = isPadded ? String(value).padStart(2, '0') : String(value)
  counter.textContent = `${displayedValue}${suffix}`
}

const animateCounter = (counter) => {
  const target = Number(counter.dataset.counter || 0)
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion || target === 0) {
    formatCounter(counter, target)
    return
  }

  const duration = 900
  const startedAt = performance.now()
  const frame = (now) => {
    const progress = Math.min((now - startedAt) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    formatCounter(counter, Math.round(target * eased))
    if (progress < 1) requestAnimationFrame(frame)
  }
  formatCounter(counter, 0)
  requestAnimationFrame(frame)
}

if ('IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      animateCounter(entry.target)
      observer.unobserve(entry.target)
    })
  }, { threshold: 0.35 })
  counters.forEach((counter) => counterObserver.observe(counter))
} else {
  counters.forEach(animateCounter)
}
