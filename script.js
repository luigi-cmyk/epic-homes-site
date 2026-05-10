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

// Contact form — submits to HubSpot Forms API (when data-hubspot-* set) and/or Formspree, with mailto fallback
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');

if (form) {
  // Auto-fill UTM tracking fields from the URL — used by ad campaigns
  const params = new URLSearchParams(window.location.search);
  ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(name => {
    const input = form.querySelector(`input[name="${name}"]`);
    if (input) input.value = params.get(name) || '';
  });

  // POST to HubSpot Forms API — returns true on success
  async function submitToHubSpot(data) {
    const portalId = form.getAttribute('data-hubspot-portal');
    const formId = form.getAttribute('data-hubspot-form');
    if (!portalId || !formId) return false;

    const fullName = (data.get('name') || '').toString().trim();
    const spaceIdx = fullName.indexOf(' ');
    const firstName = spaceIdx === -1 ? fullName : fullName.slice(0, spaceIdx);
    const lastName = spaceIdx === -1 ? '' : fullName.slice(spaceIdx + 1);

    const fields = [
      { name: 'firstname', value: firstName },
      { name: 'lastname', value: lastName },
      { name: 'email', value: (data.get('email') || '').toString() },
      { name: 'phone', value: (data.get('phone') || '').toString() },
      { name: 'state', value: (data.get('state') || '').toString() },
      { name: 'message', value: (data.get('message') || '').toString() }
    ].filter(f => f.value);

    const payload = {
      fields,
      context: {
        pageUri: window.location.href,
        pageName: document.title
      }
    };

    try {
      const response = await fetch(
        `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );
      return response.ok;
    } catch (err) {
      return false;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get('name') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();

    if (!name || !email) {
      status.style.color = '#c0392b';
      status.textContent = 'Please fill in your name and email.';
      return;
    }

    const endpoint = form.getAttribute('data-endpoint');
    const isFormspree = endpoint && endpoint.indexOf('YOUR_FORM_ID') === -1 && endpoint.indexOf('formspree.io') !== -1;
    const hasHubSpot = !!(form.getAttribute('data-hubspot-portal') && form.getAttribute('data-hubspot-form'));

    if (isFormspree || hasHubSpot) {
      status.style.color = '';
      status.textContent = 'Sending...';
      try {
        // Submit to HubSpot and Formspree in parallel — succeed if either accepts the lead
        const [hubspotOk, formspreeResponse] = await Promise.all([
          hasHubSpot ? submitToHubSpot(data) : Promise.resolve(false),
          isFormspree ? fetch(endpoint, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: data
          }) : Promise.resolve(null)
        ]);

        const formspreeOk = formspreeResponse ? formspreeResponse.ok : false;

        if (hubspotOk || formspreeOk) {
          // Redirect to thank-you page if form specifies one (via _next hidden field)
          const nextInput = form.querySelector('input[name="_next"]');
          const nextUrl = nextInput && nextInput.value;
          if (nextUrl) {
            // Lead conversion fires on the thanks page itself — avoids double-counting
            window.location.href = nextUrl;
            return;
          }
          // Fallback: inline confirmation + fire conversion here
          if (typeof window.fbq === 'function') window.fbq('track', 'Lead');
          if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead');
          status.style.color = 'var(--gold)';
          status.textContent = '✓ Got it! We\'ll be in touch within one business day.';
          form.reset();
        } else {
          status.style.color = '#c0392b';
          status.textContent = 'Something went wrong. Please email info@theepichomes.com directly.';
        }
      } catch (err) {
        status.style.color = '#c0392b';
        status.textContent = 'Network error. Please email info@theepichomes.com or call (978) 201-3507.';
      }
      return;
    }

    // Fallback: mailto (works without a backend, used by index.html when neither HubSpot nor Formspree is configured)
    const phone = (data.get('phone') || '').toString().trim();
    const interest = (data.get('interest') || '').toString().trim();
    const state = (data.get('state') || '').toString().trim();
    const message = (data.get('message') || '').toString().trim();
    const newsletter = data.get('newsletter') === 'yes' ? 'YES — add to priority list' : 'No';

    const subject = encodeURIComponent(`Website inquiry — ${name} (${interest})`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nInterest: ${interest}\nState: ${state}\nPriority list: ${newsletter}\n\nMessage:\n${message}`
    );
    window.location.href = `mailto:info@theepichomes.com?subject=${subject}&body=${body}`;

    status.style.color = '';
    status.textContent = 'Opening your email client... Thanks for reaching out!';
    form.reset();
  });
}

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
