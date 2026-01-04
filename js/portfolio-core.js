/* =====================================================
   GENERAL JS - USED ACROSS ALL PAGES
===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const body = document.body;
  const hero = document.querySelector('.hero');
  const sections = document.querySelectorAll('.campaign-section');
  const navLinks = document.querySelectorAll('.campaign-link');
  const scrollTopBtn = document.querySelector('.scroll-top');
  const campaignNav = document.querySelector('.campaign-nav');

  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  const isHomePage = body.classList.contains('home');

  requestAnimationFrame(() => {
    document.body.classList.add('page-ready');
    if (isMobile) {
      document.body.classList.add('mobile-ready');
    }
  });

  /* ===============================
     MOBILE VIDEO TAP-TO-ACTIVATE
  =============================== */
  if (isMobile) {
    document.querySelectorAll('.video-item').forEach(item => {
      const overlay = item.querySelector('.video-overlay');

      overlay?.addEventListener('click', () => {
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

    scrollTopBtn?.classList.toggle('visible', y > 400);

    // Campaign nav show/hide (only for non-home pages)
    if (campaignNav && !isHomePage) {
      const heroThreshold = hero ? hero.offsetHeight * 0.6 : 300;
      body.classList.toggle('show-campaign-nav', y > heroThreshold);
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

  /* ===============================
     LIGHTBOX 
  =============================== */
  const images = Array.from(document.querySelectorAll('.photo-wall img'));
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = lightbox?.querySelector('img');
  const prevBtn = lightbox?.querySelector('.prev');
  const nextBtn = lightbox?.querySelector('.next');

  if (lightbox && images.length > 0) {
    let currentIndex = 0;

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

    nextBtn?.addEventListener('click', e => {
      e.stopPropagation();
      setImage(currentIndex + 1);
    });

    prevBtn?.addEventListener('click', e => {
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

      const deltaX = touchEndX - touchStartX;
      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;

      if (deltaX < 0) {
        setImage(currentIndex + 1);
      } else {
        setImage(currentIndex - 1);
      }
    }, { passive: true });
  }

  /* ===============================
     NAV TOGGLE
  =============================== */
  const navToggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.portfolio-links');
  const pageDim = document.querySelector('.page-dim');
  const portfolioNav = document.querySelector('.portfolio-nav');
  const navLinksAll = document.querySelectorAll('.portfolio-links a');

  let scrollPosition = 0;

  function openNav() {
    scrollPosition = window.scrollY;
    body.style.position = 'fixed';
    body.style.top = `-${scrollPosition}px`;
    body.style.width = '100%';
    body.classList.add('nav-open');
    portfolioNav.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
  }

  function closeNav(skipScrollRestore = false) {
    body.style.position = '';
    body.style.top = '';
    body.style.width = '';

    if (!skipScrollRestore && !isMobile) {
      window.scrollTo(0, scrollPosition);
    }

    body.classList.remove('nav-open');
    portfolioNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  function toggleNav() {
    body.classList.contains('nav-open') ? closeNav() : openNav();
  }

  navToggle?.addEventListener('click', e => {
    e.stopPropagation();
    toggleNav();
  });

  menu?.addEventListener('click', e => {
    if (e.target === menu) closeNav();
  });

  pageDim?.addEventListener('click', () => closeNav());

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && body.classList.contains('nav-open')) {
      closeNav();
    }
  });

  navLinksAll.forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href) return;

      if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        closeNav();

        requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        return;
      }

      e.preventDefault();
      closeNav(true);

      setTimeout(() => {
        window.location.href = href;
      }, 0);
    });
  });

});