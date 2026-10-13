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
