/**
 * AAA Real Estate — Smooth Scroll (Lenis) & 2D Animations
 * High-performance smooth scrolling for Desktop & Mobile + 2D Micro-interactions
 */
(function () {
  'use strict';

  /* ===== 1. LENIS SMOOTH SCROLL ===== */
  let lenisInstance = null;

  function initLenis() {
    if (typeof Lenis === 'undefined') {
      console.warn('Lenis library not loaded');
      return;
    }

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 0.2 : 1.2;

    try {
      lenisInstance = new Lenis({
        duration: duration,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        syncTouch: true, // Smooth touch sync on mobile
        touchMultiplier: 1.5,
        infinite: false
      });

      window.lenis = lenisInstance;

      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      // Scroll event listeners
      const progressBar = document.getElementById('scrollProgressBar');
      const navbar = document.getElementById('navbar');

      lenisInstance.on('scroll', (e) => {
        // 1. Reading progress bar
        if (progressBar) {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const pct = maxScroll > 0 ? (e.scroll / maxScroll) * 100 : 0;
          progressBar.style.width = Math.min(100, Math.max(0, pct)) + '%';
        }

        // 2. Navbar fixed scrolled effect
        if (navbar) {
          if (e.scroll > 40) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }
        }
      });

      // Intercept anchor link clicks for Lenis smooth scroll
      document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (!href || href === '#') return;
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            lenisInstance.scrollTo(target, {
              offset: -72,
              duration: 1.2
            });

            // If mobile menu was open, close it
            const nm = document.getElementById('navMenu');
            const mt = document.getElementById('mobileToggle');
            if (nm) { nm.classList.remove('open'); nm.style.removeProperty('display'); }
            if (mt) mt.classList.remove('active');
          }
        });
      });

      console.log('Lenis Smooth Scroll active (Desktop + Mobile)');
    } catch (err) {
      console.warn('Lenis init error:', err);
    }
  }

  /* ===== 2. FLOATING WHATSAPP 2D QUICK WIDGET ===== */
  function initFloatingWa() {
    let widget = document.getElementById('floatingWaWidget');
    if (widget) return;

    widget = document.createElement('div');
    widget.id = 'floatingWaWidget';
    widget.className = 'floating-wa-widget';
    widget.innerHTML = `
      <div class="wa-popup" id="waPopup" aria-hidden="true" style="display: none;">
        <div class="wa-popup-header">
          <div class="wa-popup-avatar">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/></svg>
          </div>
          <div class="wa-popup-title">
            <strong>AAA Real Estate</strong>
            <span>Online · Quick Enquiry</span>
          </div>
          <button type="button" class="wa-popup-close" id="waPopupClose" aria-label="Close WhatsApp popup">&times;</button>
        </div>
        <div class="wa-popup-body">
          <p>Hi there! 👋 How can we help you find your dream home today?</p>
          <div class="wa-popup-channels">
            <a href="https://wa.me/919967981427?text=Hi%20AAA%20Real%20Estate%2C%20I%20have%20an%20enquiry%20regarding%20properties" target="_blank" rel="noopener" class="wa-channel-btn">
              <div class="wa-ch-text">
                <span class="wa-ch-label">Primary Support</span>
                <span class="wa-ch-num">+91 99679 81427</span>
              </div>
              <span class="wa-ch-action">Chat ›</span>
            </a>
            <a href="https://wa.me/917021650366?text=Hi%20AAA%20Real%20Estate%2C%20I%20would%20like%20to%20schedule%20a%20site%20visit" target="_blank" rel="noopener" class="wa-channel-btn">
              <div class="wa-ch-text">
                <span class="wa-ch-label">Site Visit Advisor</span>
                <span class="wa-ch-num">+91 70216 50366</span>
              </div>
              <span class="wa-ch-action">Chat ›</span>
            </a>
          </div>
        </div>
      </div>
      <button type="button" class="wa-fab-btn" id="waFabBtn" aria-label="Open WhatsApp Quick Chat" title="Chat on WhatsApp">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/></svg>
        <span class="wa-pulse-ring"></span>
      </button>
    `;
    document.body.appendChild(widget);

    const fab = document.getElementById('waFabBtn');
    const popup = document.getElementById('waPopup');
    const closeBtn = document.getElementById('waPopupClose');

    if (fab && popup) {
      fab.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = popup.classList.toggle('open');
        popup.setAttribute('aria-hidden', !isOpen);
        popup.style.display = isOpen ? 'block' : 'none';
      });
    }

    if (closeBtn && popup) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        popup.classList.remove('open');
        popup.setAttribute('aria-hidden', 'true');
        popup.style.display = 'none';
      });
    }

    document.addEventListener('click', (e) => {
      if (popup && popup.classList.contains('open') && !widget.contains(e.target)) {
        popup.classList.remove('open');
        popup.setAttribute('aria-hidden', 'true');
        popup.style.display = 'none';
      }
    });
  }

  /* ===== 3. 2D CARD PERSPECTIVE TILT ===== */
  function init2dTilt() {
    if (window.matchMedia('(hover: hover)').matches) {
      document.addEventListener('pointermove', (e) => {
        const card = e.target.closest('.property-card, .direct-contact-card');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateY(-2px)`;
      });

      document.addEventListener('pointerout', (e) => {
        const card = e.target.closest('.property-card, .direct-contact-card');
        if (card) {
          card.style.transform = '';
        }
      });
    }
  }

  // Hook into DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initLenis();
      initFloatingWa();
      init2dTilt();
    });
  } else {
    initLenis();
    initFloatingWa();
    init2dTilt();
  }
})();
