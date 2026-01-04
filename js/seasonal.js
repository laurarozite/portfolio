
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const hero = document.querySelector('.hero');
  const sections = document.querySelectorAll('.campaign-section');
  const navLinks = document.querySelectorAll('.campaign-link');
  const firstSection = sections[0]; // Photography section

  const { isMobile } = window.portfolioNav;

  /* ===============================
     INITIAL STATE
  =============================== */
  requestAnimationFrame(() => {
    body.classList.add('page-ready');
    if (isMobile) {
      body.classList.add('mobile-ready');
    }
  });

  /* ===============================
     MOBILE VIDEO TAP-TO-ACTIVATE
  =============================== */
  if (isMobile) {
    document.querySelectorAll('.video-item').forEach(item => {
      const overlay = item.querySelector('.video-overlay');

      overlay.addEventListener('click', () => {
        item.classList.add('is-active');
        overlay.style.display = 'none';
      }, { passive: true });
    });
  }

  /* ===============================
     SCROLL / HEADER STATE
  =============================== */
  let lastScrollY = window.scrollY;
  let ticking = false;

  function handleScroll() {
    const y = window.scrollY;
    const delta = y - lastScrollY;

    body.classList.toggle('has-scrolled', y > 80);
    body.classList.toggle('at-top', y < 80);

    if (delta > 12 && y > 180) {
      body.classList.add('nav-hidden');
    } else if (delta < -8) {
      body.classList.remove('nav-hidden');
    }

    // Show campaign nav when first section becomes visible
    if (firstSection) {
      const firstRect = firstSection.getBoundingClientRect();
      body.classList.toggle('show-campaign-nav', firstRect.top < window.innerHeight * 0.8);
    }

    updateActiveSection();

    lastScrollY = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }, { passive: true });

  handleScroll();

  /* ===============================
     ACTIVE SECTION LOGIC
  =============================== */
  function updateActiveSection() {
    if (isMobile) {
      sections.forEach(s => {
        s.classList.add('is-visible');
        s.classList.remove('is-active');
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      });

      return;
    }

    const heroThreshold = hero ? hero.offsetHeight * 0.6 : 200;

    if (window.scrollY < heroThreshold) {
      sections.forEach(s => {
        s.classList.remove('is-active', 'is-visible');
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      });

      return;
    }

    sections.forEach(s => s.classList.add('is-visible'));

    let current = null;
    const target = window.innerHeight * 0.45;

    sections.forEach(section => {
      const r = section.getBoundingClientRect();
      if (r.top <= target && r.bottom >= target) {
        current = section;
      }
    });

    if (!current) return;

    sections.forEach(s => s.classList.remove('is-active'));
    current.classList.add('is-active');

    navLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${current.id}`;
      link.classList.toggle('active', active);
      active
        ? link.setAttribute('aria-current', 'true')
        : link.removeAttribute('aria-current');
    });
  }

  updateActiveSection();

  /* ===============================
     PHOTO WALL
  =============================== */
  const photos = document.querySelectorAll('.photo-wall img');

  if (isMobile) {
    photos.forEach(img => {
      img.style.opacity = '1';
    });
  } else {
    photos.forEach((img, i) => {
      img.style.setProperty('--x', i % 2 === 0 ? '-28px' : '28px');
    });

    function updatePhotos() {
      const vh = window.innerHeight;

      photos.forEach(img => {
        const rect = img.getBoundingClientRect();
        const start = vh * 0.9;
        const end = vh * 0.25;

        let p = (start - rect.top) / (start - end);
        p = Math.min(Math.max(p, 0), 1);
        img.style.setProperty('--p', p);
      });
    }

    window.addEventListener('scroll', updatePhotos, { passive: true });
    window.addEventListener('resize', updatePhotos);
    updatePhotos();
  }

  /* ===============================
     LIGHTBOX 
  =============================== */
  const images = Array.from(document.querySelectorAll('.photo-wall img'));
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = lightbox.querySelector('img');
  const prevBtn = lightbox.querySelector('.prev');
  const nextBtn = lightbox.querySelector('.next');

  let currentIndex = 0;
  let lightboxScrollY = 0;

  function lockScrollForLightbox() {
    lightboxScrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${lightboxScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
  }

  function unlockScrollForLightbox() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    window.scrollTo(0, lightboxScrollY);
  }

  function setImage(index) {
    currentIndex = (index + images.length) % images.length;
    const img = images[currentIndex];
    const src = img.dataset.full || img.src;

    if (!src) {
      setImage(currentIndex + 1);
      return;
    }

    lightboxImg.src = src;
  }

  lightboxImg.onerror = () => {
    setImage(currentIndex + 1);
  };

  function openLightbox(index) {
    setImage(index);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    lockScrollForLightbox();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    unlockScrollForLightbox();
  }

  images.forEach((img, i) => {
    img.addEventListener('click', () => openLightbox(i));
  });

  nextBtn.addEventListener('click', e => {
    e.stopPropagation();
    setImage(currentIndex + 1);
  });

  prevBtn.addEventListener('click', e => {
    e.stopPropagation();
    setImage(currentIndex - 1);
  });

  lightbox.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') setImage(currentIndex + 1);
    if (e.key === 'ArrowLeft') setImage(currentIndex - 1);
  });

  /* ===============================
     LIGHTBOX — MOBILE SWIPE
  =============================== */
  let touchStartX = 0;
  let touchEndX = 0;
  const SWIPE_THRESHOLD = 50;

  lightbox.addEventListener('touchstart', e => {
    if (!lightbox.classList.contains('open')) return;
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', e => {
    if (!lightbox.classList.contains('open')) return;
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const deltaX = touchEndX - touchStartX;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;

    if (deltaX < 0) {
      setImage(currentIndex + 1);
    } else {
      setImage(currentIndex - 1);
    }
  }
});
