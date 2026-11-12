/**
 * AAA Real Estate Interactive Website Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCityDropdown();
  initRecCarousel();
  initTestimonialSlider();
  initPressCarousel();
});

/* ---------------- 1. Navbar Scroll Effect & Mobile Menu ---------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (mobileToggle) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.classList.toggle('active', isOpen);
    });

    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        navMenu.classList.remove('open');
        mobileToggle.classList.remove('active');
        navMenu.style.removeProperty('display');
      }
    });
  }
}

/* ---------------- 2. City Dropdown Selector ---------------- */
function initCityDropdown() {
  const inputWrapper = document.querySelector('.location-input-wrapper');
  const input = document.getElementById('locationInput');
  const dropdown = document.getElementById('cityDropdown');
  const searchBtn = document.getElementById('searchBtn');

  if (!inputWrapper || !dropdown) return;

  inputWrapper.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  document.querySelectorAll('.city-option').forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      const city = option.getAttribute('data-city');
      input.value = city;
      
      document.querySelectorAll('.city-option').forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      dropdown.classList.remove('open');
      showToast(`Selected area: ${city}`);
    });
  });

  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
  });

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      showToast(`Searching available rooms in ${input.value}...`);
      const recSection = document.getElementById('recommendations');
      if (recSection) {
        recSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

/* ---------------- 3. Recommendations Carousel ---------------- */
function initRecCarousel() {
  const grid = document.getElementById('recGrid');
  const prevBtn = document.getElementById('recPrevBtn');
  const nextBtn = document.getElementById('recNextBtn');

  if (!grid || !prevBtn || !nextBtn) return;

  let currentIndex = 0;
  const cardWidth = 350; // approx card width + gap

  nextBtn.addEventListener('click', () => {
    const maxShift = (grid.children.length - 3) * cardWidth;
    currentIndex += cardWidth;
    if (currentIndex > maxShift) {
      currentIndex = 0;
    }
    grid.style.transform = `translateX(-${currentIndex}px)`;
  });

  prevBtn.addEventListener('click', () => {
    currentIndex -= cardWidth;
    if (currentIndex < 0) {
      currentIndex = 0;
    }
    grid.style.transform = `translateX(-${currentIndex}px)`;
  });
}

/* ---------------- 4. Testimonial Slider ---------------- */
function initTestimonialSlider() {
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('#testiDots .dot');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');

  if (slides.length === 0) return;

  let currentSlide = 0;
  let autoplayTimer = null;

  function showSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) {
      dots[currentSlide].classList.add('active');
    }
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 6000);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      showSlide(currentSlide + 1);
      startAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      showSlide(currentSlide - 1);
      startAutoplay();
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      showSlide(idx);
      startAutoplay();
    });
  });

  startAutoplay();
}

/* ---------------- 5. Press Carousel ---------------- */
function initPressCarousel() {
  const nextBtn = document.getElementById('pressNextBtn');
  const pressGrid = document.getElementById('pressGrid');
  if (!nextBtn || !pressGrid) return;

  let toggled = false;
  nextBtn.addEventListener('click', () => {
    toggled = !toggled;
    if (toggled) {
      pressGrid.style.transform = 'translateX(-20px)';
      showToast('Viewing more publications');
    } else {
      pressGrid.style.transform = 'translateX(0)';
    }
  });
}

/* ---------------- 6. Modals & Auth ---------------- */
function openAuthModal(type = 'signin') {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.add('open');
  document.documentElement.classList.add('modal-open');
  document.body.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  if (window.lenis && typeof window.lenis.stop === 'function') {
    window.lenis.stop();
  }
  switchAuthTab(type);
}

function closeAuthModal(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('modal-close-btn')) {
    return;
  }
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.remove('open');
  if (!document.querySelector('.modal-backdrop.open')) {
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    if (window.lenis && typeof window.lenis.start === 'function') {
      window.lenis.start();
    }
  }
}

function switchAuthTab(type) {
  const tabSignIn = document.getElementById('tabSignIn');
  const tabSignUp = document.getElementById('tabSignUp');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');

  if (tabSignIn) tabSignIn.classList.toggle('active', type === 'signin');
  if (tabSignUp) tabSignUp.classList.toggle('active', type === 'signup');

  if (signInForm) signInForm.classList.toggle('hidden', type !== 'signin');
  if (signUpForm) signUpForm.classList.toggle('hidden', type !== 'signup');
}

function handleAuthSubmit(e, type) {
  e.preventDefault();
  closeAuthModal();
  if (type === 'signin') {
    showToast('Signed in (demo).');
  } else {
    showToast('Account created (demo).');
  }
}

/* 7. Property details modal: see features.js */
function bookSiteVisit() {
  const el = document.getElementById('contact');
  const type = document.getElementById('eType');
  if (type) type.value = 'Schedule a site visit';
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function closeRoomModal(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('modal-close-btn')) {
    return;
  }
  const modal = document.getElementById('roomModal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

/* ---------------- 8. Newsletter & Toast ---------------- */
function handleSubscribe(e) {
  e.preventDefault();
  const input = document.getElementById('newsletterEmail');
  if (input && input.value) {
    showToast(`Thank you! ${input.value} has been subscribed to updates.`);
    input.value = '';
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

