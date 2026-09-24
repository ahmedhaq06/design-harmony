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

  /* Dynamic Sync for Admin-Managed Services Grid */
  const servicesGrid = document.querySelector('.services-grid');
  const customServicesStr = localStorage.getItem('dh_custom_services');
  if (servicesGrid && customServicesStr) {
    try {
      const customServices = JSON.parse(customServicesStr);
      if (Array.isArray(customServices) && customServices.length > 0) {
        servicesGrid.innerHTML = customServices.map(s => `
          <article class="service-card">
            <div class="card-media">
              <div class="card-img-wrap">
                <img src="${s.img.replace('../', '')}" alt="${s.title}">
              </div>
            </div>
            <div class="card-content">
              <h3 class="card-title">${s.title}</h3>
              <p class="card-text">${s.desc}</p>
              <a href="${s.link.replace('pages/', 'pages/')}" class="card-link">EXPLORE SERVICE <span class="arrow">→</span></a>
            </div>
          </article>
        `).join('');
      }
    } catch (e) {
      console.error('Error syncing custom services:', e);
    }
  }

  /* Dynamic Sync for Admin-Edited Page Content across all 10 Pages */
  const currentPath = window.location.pathname.toLowerCase();
  let subpageKey = '';
  if (currentPath.includes('residential-interiors')) subpageKey = 'residential';
  else if (currentPath.includes('corporate-interiors')) subpageKey = 'corporate';
  else if (currentPath.includes('retail-interiors')) subpageKey = 'retail';
  else if (currentPath.includes('consultation')) subpageKey = 'consultation';
  else if (currentPath.includes('vastu-consultancy')) subpageKey = 'vastu';
  else if (currentPath.includes('dob-analysis')) subpageKey = 'dob';
  else if (currentPath.includes('about')) subpageKey = 'about';
  else if (currentPath.includes('projects')) subpageKey = 'projects';
  else if (currentPath.includes('contact')) subpageKey = 'contact';
  else if (currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === '' || currentPath.includes('index')) subpageKey = 'home';

  if (subpageKey) {
    const subpageDataStr = localStorage.getItem(`dh_subpage_${subpageKey}`);
    if (subpageDataStr) {
      try {
        const d = JSON.parse(subpageDataStr);

        // Helper to adjust relative paths for root vs subpages
        const isSubDir = currentPath.includes('/pages/');
        const fixImgPath = (url) => {
          if (!url) return '';
          if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
          if (isSubDir) {
            return url.startsWith('../') ? url : '../' + url.replace(/^\//, '');
          } else {
            return url.replace(/^\.\.\//, '');
          }
        };

        // 1. Hero Elements
        const heroSub = document.querySelector('.page-hero-subtitle') || document.querySelector('.hero-badge');
        const heroTitle = document.querySelector('.page-hero-title') || document.querySelector('.hero-title');
        const heroDesc = document.querySelector('.page-hero-desc') || document.querySelector('.hero-description');
        const heroBg = document.querySelector('.hero-bg');

        if (heroSub && d.heroSubtitle) heroSub.textContent = d.heroSubtitle;
        if (heroTitle && d.heroTitle) {
          if (heroTitle.classList.contains('hero-title') && d.heroTitle.includes('as They')) {
            heroTitle.innerHTML = d.heroTitle;
          } else {
            heroTitle.textContent = d.heroTitle;
          }
        }
        if (heroDesc && d.p1) heroDesc.textContent = d.p1;
        if (heroBg && d.img) heroBg.style.backgroundImage = `url('${fixImgPath(d.img)}')`;

        // 2. Section 1 (Story / Main Content)
        const sec1Tagline = document.querySelector('.subpage-section:nth-of-type(1) .section-tagline') || document.querySelector('.about-section .section-tagline');
        const sec1Title = document.querySelector('.subpage-section:nth-of-type(1) .about-title') || document.querySelector('.about-section .about-title');
        const sec1Ps = document.querySelectorAll('.subpage-section:nth-of-type(1) .subpage-text-body p, .about-section .about-text-body p');
        const sec1Img = document.querySelector('.subpage-hero-img') || document.querySelector('.about-portrait-img');

        if (sec1Tagline && d.heroSubtitle) sec1Tagline.textContent = d.heroSubtitle;
        if (sec1Title && d.heroTitle) sec1Title.textContent = d.heroTitle;
        if (sec1Ps.length > 0 && d.p1) sec1Ps[0].textContent = d.p1;
        if (sec1Ps.length > 1 && d.p2) sec1Ps[1].textContent = d.p2;
        if (sec1Img && d.img) sec1Img.src = fixImgPath(d.img);

        // 3. Section 2 (Philosophy / Details / CTA / Form Headers)
        const sec2Tagline = document.querySelector('.subpage-section:nth-of-type(2) .section-tagline') || document.querySelector('.cta-text-content .cta-tagline');
        const sec2Title = document.querySelector('.subpage-section:nth-of-type(2) .about-title') || document.querySelector('.subpage-section:nth-of-type(2) .section-title') || document.querySelector('.cta-text-content .cta-title');
        const sec2Ps = document.querySelectorAll('.subpage-section:nth-of-type(2) .subpage-text-body p');
        const ctaDesc = document.querySelector('.cta-text-content .cta-description');

        if (sec2Tagline && d.sec2Tagline) sec2Tagline.textContent = d.sec2Tagline;
        if (sec2Title && d.sec2Title) sec2Title.textContent = d.sec2Title;
        if (sec2Ps.length > 0 && d.sec2P1) sec2Ps[0].textContent = d.sec2P1;
        if (sec2Ps.length > 1 && d.sec2P2) sec2Ps[1].textContent = d.sec2P2;
        if (ctaDesc && d.sec2P1 && !sec2Ps.length) ctaDesc.textContent = d.sec2P1;

        // Contact Page Form Header Sync
        if (subpageKey === 'contact') {
          const formCardTitle = document.querySelector('.form-card-title');
          const formCardSub = document.querySelector('.form-card-subtitle');
          if (formCardTitle && d.sec2Title) formCardTitle.textContent = d.sec2Title;
          if (formCardSub && d.sec2P1) formCardSub.textContent = d.sec2P1;
        }
      } catch (e) {
        console.error('Error syncing subpage content:', e);
      }
    }
  }

  /* Dynamic Sync for Site-Wide Contact Info Copy */
  const siteContentStr = localStorage.getItem('dh_site_content');
  if (siteContentStr) {
    try {
      const siteContent = JSON.parse(siteContentStr);
      if (siteContent.phone) {
        document.querySelectorAll('a[href^="tel:"]').forEach(el => {
          el.href = `tel:${siteContent.phone.replace(/\s+/g, '')}`;
          el.textContent = siteContent.phone;
        });
      }
      if (siteContent.email) {
        document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
          el.href = `mailto:${siteContent.email}`;
          el.textContent = siteContent.email;
        });
      }
    } catch (e) {}
  }

  /* Dynamic Sync for Admin-Uploaded Client Logos Ticker */
  const marqueeTracks = document.querySelectorAll('.clients-marquee-track');
  const customLogosStr = localStorage.getItem('dh_custom_logos');
  if (marqueeTracks.length > 0 && customLogosStr) {
    try {
      const customLogos = JSON.parse(customLogosStr);
      if (Array.isArray(customLogos) && customLogos.length > 0) {
        const logoHTML = customLogos.map(item => {
          const imgPath = typeof item === 'string' ? `our clients/${item}` : item.path;
          const altName = typeof item === 'string' ? item : item.name;
          return `
            <div class="client-logo-item">
              <img src="${imgPath}" alt="${altName}">
            </div>
          `;
        }).join('');

        marqueeTracks.forEach(track => {
          track.innerHTML = logoHTML;
        });
      }
    } catch (err) {
      console.error('Error syncing custom logos:', err);
    }
  }

  /* Dynamic Sync for Admin-Uploaded Portfolio Projects */
  const projectsGridElem = document.querySelector('.projects-grid');
  const customProjectsStr = localStorage.getItem('dh_custom_projects');
  if (projectsGridElem && customProjectsStr) {
    try {
      const customProjects = JSON.parse(customProjectsStr);
      if (Array.isArray(customProjects) && customProjects.length > 0) {
        const projectsHTML = customProjects.map(p => {
          const categorySlug = (p.category || 'residential').toLowerCase().includes('corporate') ? 'corporate' :
            (p.category || '').toLowerCase().includes('retail') ? 'retail' : 'residential';
          return `
            <div class="project-card" data-category="${categorySlug}">
              <div class="project-img-wrap">
                <img src="${p.img}" alt="${p.title}" class="project-img">
                <div class="project-overlay">
                  <span class="project-category-tag">${p.category || 'Interior'}</span>
                  <h3 class="project-title">${p.title}</h3>
                </div>
              </div>
            </div>
          `;
        }).join('');
        projectsGridElem.innerHTML = projectsHTML;
      }
    } catch (err) {
      console.error('Error syncing custom projects:', err);
    }
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


