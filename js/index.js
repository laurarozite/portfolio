/* =====================================================
   INDEX.HTML - PAGE-SPECIFIC LOGIC ONLY
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const isMobile = window.Portfolio?.isMobile || window.matchMedia('(max-width: 900px)').matches;

  /* =====================================================
     PAGE LOAD ANIMATION
  ===================================================== */
  // Ensure body is hidden initially
  document.body.style.visibility = 'hidden';
  
  window.addEventListener("load", () => {
    // Small delay to ensure everything is loaded
    setTimeout(() => {
      requestAnimationFrame(() => {
        document.body.style.visibility = 'visible';
        document.body.classList.remove("is-loading");
        document.body.classList.add("is-loaded");

        if (isMobile) {
          document.body.classList.add("mobile-ready");
        }
      });
    }, 50); // 50ms delay to prevent flash
  });

  /* =====================================================
     SHOW NAV WHEN FEATURED SECTION IS VISIBLE (Desktop only)
     NOTE: This is REMOVED - top nav should never show on desktop homepage
  ===================================================== */

if (isMobile) {
  document.querySelectorAll("section, .section-header, .practice-group, .campaign-card").forEach(el => {
    el.classList.add("is-visible");
  });
} else {
    const sections = document.querySelectorAll("section");
    const sectionHeaders = document.querySelectorAll(".section-header");
    const campaignIntro = document.querySelector(".campaign-intro");
    const practiceGroups = document.querySelectorAll(".practice-group");
    const aboutSection = document.querySelector(".home-about");

    if (!("IntersectionObserver" in window)) {
      sections.forEach(s => s.classList.add("is-visible"));
      sectionHeaders.forEach(h => h.classList.add("is-visible"));
      return;
    }

    const sectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -100px 0px"
      }
    );

    sections.forEach(section => sectionObserver.observe(section));

    const headerObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -100px 0px"
      }
    );

    sectionHeaders.forEach(header => headerObserver.observe(header));

    if (campaignIntro) {
      headerObserver.observe(campaignIntro);
    }

    let ticking = false;
    function checkVisibility() {
      const vh = window.innerHeight;
      
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.bottom < -50 || rect.top > vh + 50) {
          section.classList.remove("is-visible");
        }
      });
      
      sectionHeaders.forEach(header => {
        const rect = header.getBoundingClientRect();
        if (rect.bottom < -50 || rect.top > vh + 50) {
          header.classList.remove("is-visible");
        }
      });
      
      if (campaignIntro) {
        const rect = campaignIntro.getBoundingClientRect();
        if (rect.bottom < -50 || rect.top > vh + 50) {
          campaignIntro.classList.remove("is-visible");
        }
      }
      
      ticking = false;
    }

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(checkVisibility);
        ticking = true;
      }
    }, { passive: true });

    if (aboutSection && practiceGroups.length) {
      let practiceAnimated = false;
      
      const practiceObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !practiceAnimated) {
            practiceGroups.forEach((group, i) => {
              setTimeout(() => group.classList.add("is-visible"), i * 150);
            });
            practiceAnimated = true;
          }
        },
        { threshold: 0.2 }
      );
      
      practiceObserver.observe(aboutSection);
      
      window.addEventListener("scroll", () => {
        const rect = aboutSection.getBoundingClientRect();
        const vh = window.innerHeight;
        if (rect.bottom < -50 || rect.top > vh + 50) {
          practiceGroups.forEach(group => group.classList.remove("is-visible"));
          practiceAnimated = false;
        }
      }, { passive: true });
    }
  }

  /* =====================================================
     FEATURED SECTION REVEAL
  ===================================================== */
  const featuredSection = document.querySelector(".home-featured");
  const heroSection = document.querySelector(".home-hero");
  
  if (featuredSection && !isMobile) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          featuredSection.classList.add("is-visible");
          // SYNC: Show campaign nav at the same time
          document.body.classList.add("show-campaign-nav");
        }
      },
      { 
        threshold: 0.2,
        rootMargin: "0px 0px -100px 0px"
      }
    );

    observer.observe(featuredSection);
    
    // Featured section disappear logic (doesn't affect campaign nav)
    window.addEventListener("scroll", () => {
      const rect = featuredSection.getBoundingClientRect();
      const vh = window.innerHeight;
      const heroInView = heroSection && heroSection.getBoundingClientRect().top > -100;
      
      if (rect.bottom < 100 || rect.top > vh + 50 || heroInView) {
        featuredSection.classList.remove("is-visible");
      }
      
      // Campaign nav only hides when hero is visible
      if (heroInView) {
        document.body.classList.remove("show-campaign-nav");
      }
    }, { passive: true });
  }

  /* =====================================================
     CAMPAIGN CARDS STAGGER
  ===================================================== */
  const campaignSection = document.querySelector(".home-campaigns");
  const campaignCards = document.querySelectorAll(".campaign-card");

  if (campaignSection && !isMobile) {
    let cardsAnimated = false;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !cardsAnimated) {
          campaignCards.forEach((card, i) => {
            setTimeout(() => card.classList.add("is-visible"), i * 150);
          });
          cardsAnimated = true;
        }
      },
      { 
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    observer.observe(campaignSection);
    
    window.addEventListener("scroll", () => {
      const rect = campaignSection.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < -50 || rect.top > vh + 50) {
        campaignCards.forEach(card => card.classList.remove("is-visible"));
        cardsAnimated = false;
      }
    }, { passive: true });
  }

  /* =====================================================
     CAMPAIGN NAV SHOW/HIDE + ACTIVE STATE
  ===================================================== */
  const navLinks = [...document.querySelectorAll(".campaign-link")];
  const trackedSections = [...document.querySelectorAll("#featured, #campaigns, #photo, #about")];

  function setActive(section) {
    navLinks.forEach(l => l.classList.remove("active"));
    const link = document.querySelector(`.campaign-link[href="#${section.id}"]`);
    link?.classList.add("active");
  }

  function handleScroll() {
    // Active section tracking only
    let current = trackedSections[0];
    trackedSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.5) {
        current = section;
      }
    });

    setActive(current);
  }

  // Smooth scroll to section top when clicking nav links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 100;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  window.addEventListener("scroll", handleScroll);
  window.addEventListener("load", handleScroll);

  /* =====================================================
     PARALLAX LOOP (Desktop only)
  ===================================================== */
  if (!isMobile) {
    const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
    const pageBg = document.querySelector(".page-parallax");

    function loop() {
      const y = window.scrollY;

      if (pageBg) {
        pageBg.style.transform = `translate3d(0, ${y * 0.12}px, 0)`;
      }

      parallaxEls.forEach(el => {
        if (el.closest(".campaign-card") || el.closest(".home-featured")) return;
        
        const speed = parseFloat(el.dataset.parallax);
        const target = el.querySelector(".featured-media-parallax") || el;
        target.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      });

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }
});
