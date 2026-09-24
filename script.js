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

  const isHomePage = document.querySelector('.hero-section') !== null;

  const handleScroll = () => {
    const scrollY = window.scrollY;

    if (scrollY > 50 || !isHomePage) {
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
  };

  handleScroll();
  window.addEventListener('scroll', handleScroll);

  let navBackdrop = document.querySelector('.nav-backdrop');
  if (!navBackdrop) {
    navBackdrop = document.createElement('div');
    navBackdrop.className = 'nav-backdrop';
    document.body.appendChild(navBackdrop);
  }

  const closeMobileMenu = () => {
    document.body.classList.remove('nav-open');
    if (mainNav) mainNav.classList.remove('active');
    if (navToggle) {
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
    if (navBackdrop) navBackdrop.classList.remove('active');
  };

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navToggle.classList.toggle('active');
      mainNav.classList.toggle('active');
      document.body.classList.toggle('nav-open');
      if (navBackdrop) navBackdrop.classList.toggle('active');
    });
  }

  if (navBackdrop) {
    navBackdrop.addEventListener('click', closeMobileMenu);
  }

  /* Robust Navigation & Sidebar Link Handler */
  document.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', function (e) {
      const rawHref = this.getAttribute('href');
      if (!rawHref) return;

      // Handle mobile dropdown accordion toggle (clicking SERVICES in sidebar)
      if (window.innerWidth <= 768 && this.classList.contains('nav-link')) {
        const parentLi = this.parentElement;
        if (parentLi && parentLi.classList.contains('dropdown')) {
          e.preventDefault();
          parentLi.classList.toggle('active');
          return;
        }
      }

      // Ignore external, tel, mailto
      if (this.getAttribute('target') === '_blank' || rawHref.startsWith('tel:') || rawHref.startsWith('mailto:')) {
        closeMobileMenu();
        return;
      }

      // For all actual navigation links, close mobile drawer first
      closeMobileMenu();

      // Handle same-page hash links (e.g. href="#home" or href="#services")
      if (rawHref.startsWith('#')) {
        if (rawHref === '#') return;
        const targetElem = document.querySelector(rawHref);
        if (targetElem) {
          e.preventDefault();
          const headerHeight = header ? header.offsetHeight : 0;
          const targetPos = targetElem.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({ top: targetPos, behavior: 'smooth' });
        }
        return;
      }

      // Determine same-page vs cross-page navigation
      let resolvedUrl;
      try {
        resolvedUrl = new URL(this.href, window.location.href);
      } catch (err) {
        return;
      }

      const currentPath = window.location.pathname.replace(/\/$/, '');
      const targetPath = resolvedUrl.pathname.replace(/\/$/, '');
      const currentFile = currentPath.split('/').pop() || 'index.html';
      const targetFile = targetPath.split('/').pop() || 'index.html';

      // If clicking link to current page with no hash (e.g. HOME when on index.html):
      if (currentFile === targetFile && !resolvedUrl.hash) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // If clicking link to current page with hash (e.g. index.html#services when on index.html):
      if (currentFile === targetFile && resolvedUrl.hash) {
        const targetElem = document.querySelector(resolvedUrl.hash);
        if (targetElem) {
          e.preventDefault();
          const headerHeight = header ? header.offsetHeight : 0;
          const targetPos = targetElem.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({ top: targetPos, behavior: 'smooth' });
          return;
        }
      }

      // Cross-page navigation (e.g. from about.html to index.html or contact.html):
      // Let standard HTML browser navigation execute natively without e.preventDefault()!
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

  /* Portfolio Filtering Logic */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.projects-grid .project-card');

  if (filterBtns.length > 0 && projectCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filterValue === 'all' || category === filterValue) {
            card.style.display = 'block';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }

  /* Consultation Form Switcher & Handling */
  const tabBtns = document.querySelectorAll('.consult-tab-btn');
  const consultationForms = document.querySelectorAll('.consultation-form');

  if (tabBtns.length > 0 && consultationForms.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        consultationForms.forEach(f => {
          if (f.id === targetId) {
            f.style.display = 'block';
            f.classList.add('active');
          } else {
            f.style.display = 'none';
            f.classList.remove('active');
          }
        });
      });
    });

    /* Auto-select form based on URL parameter (?type=vastu, ?type=dob, or ?type=interior) */
    const urlParams = new URLSearchParams(window.location.search);
    const formType = urlParams.get('type') || urlParams.get('form');

    if (formType) {
      let targetTabId = 'tab-btn-interior';
      if (formType === 'dob') {
        targetTabId = 'tab-btn-dob';
      } else if (formType === 'vastu') {
        targetTabId = 'tab-btn-vastu';
      }
      const targetBtn = document.getElementById(targetTabId);
      if (targetBtn) {
        setTimeout(() => {
          targetBtn.click();
          const formCard = document.querySelector('.form-card');
          if (formCard) {
            formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);
      }
    }
  }

  if (consultationForms.length > 0) {
    consultationForms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const feedback = form.querySelector('.form-feedback-msg');
        const submitBtn = form.querySelector('.form-submit-btn');

        // Extract Lead Info
        const formData = new FormData(form);
        const leadObj = {
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          type: form.getAttribute('data-form-type') || form.id || 'Consultation',
          name: formData.get('name') || 'Anonymous',
          contact: formData.get('contact') || 'N/A',
          email: formData.get('email') || 'N/A',
          details: formData.get('project_size') ? `${formData.get('project_size')} (${formData.get('location') || ''})` : (formData.get('challenges') || 'Request Submitted')
        };

        // Save locally for Admin Dashboard
        try {
          let existingLeads = JSON.parse(localStorage.getItem('dh_form_leads') || '[]');
          existingLeads.unshift(leadObj);
          localStorage.setItem('dh_form_leads', JSON.stringify(existingLeads));
        } catch (err) {
          console.error(err);
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'PROCESSING...';
        }

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'REQUEST SUBMITTED!';
          }
          if (feedback) {
            feedback.className = 'form-feedback-msg success';
            feedback.innerHTML = 'Thank you! Your consultation request has been received. Our team will get back to you shortly.';
            feedback.style.display = 'block';
          }
          form.reset();
        }, 800);
      });
    });
  }

  /* Contact Form Interactive Submission Handler */
  const contactForms = document.querySelectorAll('.js-contact-form');
  contactForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const feedback = form.querySelector('.form-feedback-msg');
      const submitBtn = form.querySelector('.form-submit-btn');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Message Sent!';
        }
        if (feedback) {
          feedback.className = 'form-feedback-msg success';
          feedback.innerHTML = 'Thank you for reaching out to Design Harmony! Your message has been received. We will contact you shortly.';
          feedback.style.display = 'block';
        }
        form.reset();
      }, 1000);
    });
  });
});


