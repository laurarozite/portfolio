/* =====================================================
   PHOTO-VIDEO.JS - PAGE-SPECIFIC FEATURES ONLY
   Works alongside portfolio-core.js
===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const isMobile = window.Portfolio?.isMobile || window.matchMedia('(max-width: 900px)').matches;

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
     PHOTO WALL PARALLAX
  =============================== */
  const photos = document.querySelectorAll('.photo-wall img');
  if (!photos.length) return;

  if (isMobile) {
    photos.forEach(img => {
      img.style.opacity = '1';
    });
  } else {
    // Desktop parallax setup
    photos.forEach((img, i) => {
      img.style.setProperty('--x', i % 2 === 0 ? '-28px' : '28px');
    });

    function updatePhotos() {
      const vh = window.innerHeight;
      photos.forEach(img => {
        const rect = img.getBoundingClientRect();
        const start = vh * 1.2;
        const end = vh * 0.5;
        
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
     LIGHTBOX SYSTEM
  =============================== */
  const images = Array.from(document.querySelectorAll('.photo-wall img'));
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = lightbox?.querySelector('img');
  const prevBtn = lightbox?.querySelector('.prev');
  const nextBtn = lightbox?.querySelector('.next');

  if (!lightbox) return;

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
    
    // Prevent ALL scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    
    // Re-enable scrolling
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  // Event listeners
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
    if (e.target === lightbox || e.target === lightboxImg) {
      e.preventDefault();
      e.stopPropagation();
      closeLightbox();
    }
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
});