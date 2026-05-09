// === Epic Homes Development ===

// Sticky nav background on scroll
const nav = document.getElementById('nav');
const onScroll = () => {
  if (window.scrollY > 40) nav.classList.add('is-scrolled');
  else nav.classList.remove('is-scrolled');
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('is-open');
  navLinks.classList.toggle('is-open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navToggle.classList.remove('is-open');
    navLinks.classList.remove('is-open');
  });
});

// Reveal-on-scroll
const revealTargets = document.querySelectorAll(
  '.section__head, .grid-2 > div, .service, .project, .process > li, .cta__inner, .hero__inner > *, .testi, .faq-item, .trust-item, .group-card, .group-callout'
);
revealTargets.forEach(el => el.classList.add('reveal'));

const io = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealTargets.forEach(el => io.observe(el));

// Contact form (mailto fallback — no backend)
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const name = (data.get('name') || '').toString().trim();
  const email = (data.get('email') || '').toString().trim();
  const phone = (data.get('phone') || '').toString().trim();
  const interest = (data.get('interest') || '').toString().trim();
  const state = (data.get('state') || '').toString().trim();
  const message = (data.get('message') || '').toString().trim();
  const newsletter = data.get('newsletter') === 'yes' ? 'YES — add to priority list' : 'No';

  if (!name || !email) {
    status.style.color = '#c0392b';
    status.textContent = 'Please fill in your name and email.';
    return;
  }

  const subject = encodeURIComponent(`Website inquiry — ${name} (${interest})`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nInterest: ${interest}\nState: ${state}\nPriority list: ${newsletter}\n\nMessage:\n${message}`
  );
  window.location.href = `mailto:info@theepichomes.com?subject=${subject}&body=${body}`;

  status.style.color = '';
  status.textContent = 'Opening your email client... Thanks for reaching out!';
  form.reset();
});

// Newsletter form (mailto fallback — swap action to Mailchimp/ConvertKit later)
const nlForm = document.getElementById('newsletterForm');
const nlStatus = document.getElementById('newsletterStatus');
if (nlForm) {
  nlForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = nlForm.querySelector('input[name="email"]').value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValid) {
      nlStatus.style.color = '#ff9c8a';
      nlStatus.textContent = 'Please enter a valid email address.';
      return;
    }

    const subject = encodeURIComponent('Newsletter signup — Priority List');
    const body = encodeURIComponent(
      `Please add me to the Epic Homes priority list.\n\nEmail: ${email}`
    );
    window.location.href = `mailto:info@theepichomes.com?subject=${subject}&body=${body}`;

    nlStatus.style.color = 'var(--gold)';
    nlStatus.textContent = '✓ Almost there — confirm in your email client.';
    nlForm.reset();
  });
}

// === Carousel ===
function initCarousel(root, opts = {}) {
  if (!root) return;
  const track = root.querySelector('.carousel__track');
  const slides = root.querySelectorAll('.carousel__slide');
  const dots = root.querySelectorAll('.carousel__dot');
  const prev = root.querySelector('.carousel__btn--prev');
  const next = root.querySelector('.carousel__btn--next');
  const currentEl = opts.currentEl ? document.getElementById(opts.currentEl) : null;
  const totalEl = opts.totalEl ? document.getElementById(opts.totalEl) : null;
  const interval = opts.interval || 5500;

  let current = 0;
  let timer = null;
  const total = slides.length;

  if (totalEl) totalEl.textContent = total;

  function go(i) {
    current = (i + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    slides.forEach((s, idx) => {
      s.classList.remove('is-active');
      // Restart animation by forcing reflow
      if (idx === current) {
        void s.offsetWidth;
        s.classList.add('is-active');
      }
    });
    dots.forEach((d, idx) => d.classList.toggle('is-active', idx === current));
    if (currentEl) currentEl.textContent = current + 1;
  }

  function start() {
    stop();
    timer = setInterval(() => go(current + 1), interval);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }
  function restart() { stop(); start(); }

  prev.addEventListener('click', () => { go(current - 1); restart(); });
  next.addEventListener('click', () => { go(current + 1); restart(); });
  dots.forEach((d, idx) => d.addEventListener('click', () => { go(idx); restart(); }));

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);

  // Touch swipe
  let startX = 0, startY = 0, isSwiping = false;
  root.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isSwiping = true;
    stop();
  }, { passive: true });
  root.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    const dx = Math.abs(e.touches[0].clientX - startX);
    const dy = Math.abs(e.touches[0].clientY - startY);
    if (dx > dy && dx > 10) e.preventDefault?.();
  }, { passive: true });
  root.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      go(current + (dx < 0 ? 1 : -1));
    }
    isSwiping = false;
    start();
  });

  // Keyboard support
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { go(current - 1); restart(); }
    if (e.key === 'ArrowRight') { go(current + 1); restart(); }
  });
  root.setAttribute('tabindex', '0');

  // Pause when out of viewport
  const io2 = new IntersectionObserver((entries) => {
    entries.forEach(entry => entry.isIntersecting ? start() : stop());
  }, { threshold: 0.25 });
  io2.observe(root);

  go(0);
}

initCarousel(document.getElementById('heritageCarousel'), {
  currentEl: 'heritageCurrent',
  totalEl: 'heritageTotal',
  interval: 5500
});

// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();
