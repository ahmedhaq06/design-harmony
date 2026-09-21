document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('site-header');
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  const dropdowns = document.querySelectorAll('.dropdown');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress-bar';
  document.body.appendChild(progressBar);

  const updateScrollProgress = () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    progressBar.style.width = scrolled + '%';
  };

  const heroBg = document.querySelector('.hero-bg');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    updateScrollProgress();

    if (heroBg && scrollY < window.innerHeight) {
      heroBg.style.transform = `translateY(${scrollY * 0.25}px) scale(1.02)`;
    }

    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      mainNav.classList.toggle('active');
    });
  }

  dropdowns.forEach(dropdown => {
    const link = dropdown.querySelector('.nav-link');
    if (link) {
      link.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          dropdown.classList.toggle('active');
        }
      });
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        e.preventDefault();

        if (mainNav.classList.contains('active')) {
          mainNav.classList.remove('active');
          if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
        }

        const headerHeight = header.offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.section-header').forEach(header => {
    header.classList.add('reveal-up');
    revealObserver.observe(header);
  });

  document.querySelectorAll('.services-grid .service-card').forEach((card, i) => {
    card.classList.add('reveal-scale', `reveal-delay-${(i % 3) + 1}`);
    revealObserver.observe(card);
  });

  const aboutContent = document.querySelector('.about-content');
  if (aboutContent) {
    aboutContent.classList.add('reveal-left');
    revealObserver.observe(aboutContent);
  }

  document.querySelectorAll('.projects-grid .project-card').forEach((card, i) => {
    if (i % 2 === 0) {
      card.classList.add('reveal-left', `reveal-delay-${(i % 2) + 1}`);
    } else {
      card.classList.add('reveal-right', `reveal-delay-${(i % 2) + 1}`);
    }
    revealObserver.observe(card);
  });

  const timelineLine = document.querySelector('.timeline-line');
  if (timelineLine) {
    revealObserver.observe(timelineLine);
  }

  document.querySelectorAll('.approach-timeline .approach-step').forEach((step, i) => {
    step.classList.add('reveal-left', `reveal-delay-${i + 1}`);
    revealObserver.observe(step);
  });

  const ctaText = document.querySelector('.cta-text-content');
  const ctaBtns = document.querySelector('.cta-buttons-wrap');
  if (ctaText) {
    ctaText.classList.add('reveal-left');
    revealObserver.observe(ctaText);
  }
  if (ctaBtns) {
    ctaBtns.classList.add('reveal-right');
    revealObserver.observe(ctaBtns);
  }
});
