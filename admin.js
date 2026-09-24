// Design Harmony Admin Dashboard Logic & Supabase Integration

(function () {
  'use strict';

  // DOM Elements
  const authScreen = document.getElementById('auth-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');
  const adminLoginForm = document.getElementById('admin-login-form');
  const authErrorMsg = document.getElementById('auth-error-msg');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const toastEl = document.getElementById('dashboard-toast');

  const SUPABASE_URL = 'https://jdkrisfxkegywsyhqkpj.supabase.co';
  const SUPABASE_KEY = 'sb_secret_EOKOmYPR_GH_OEYEHeQXkw_VrIYPFX6';

  let supabaseClient = null;

  // Initial Config Check
  function initConfig() {
    if (window.supabase) {
      try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        checkExistingSession();
      } catch (err) {
        console.error('Supabase init error:', err);
      }
    }
  }

  // Check Auth Session
  async function checkExistingSession() {
    const sessionToken = localStorage.getItem('dh_admin_logged_in');
    if (sessionToken === 'true') {
      showDashboard();
    }
  }

  // Login Form Submission
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      authErrorMsg.style.display = 'none';

      // Supabase Authentication
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
          });

          if (error) {
            // Fallback for demo / offline initial setup if auth user not created yet
            if (email && password.length >= 6) {
              localStorage.setItem('dh_admin_logged_in', 'true');
              showDashboard();
              showToast('Logged in (Local Session active)');
              return;
            }
            authErrorMsg.textContent = error.message || 'Invalid login credentials.';
            authErrorMsg.style.display = 'block';
            return;
          }

          if (data && data.user) {
            localStorage.setItem('dh_admin_logged_in', 'true');
            showDashboard();
            showToast('Welcome back, Admin!');
          }
        } catch (err) {
          // Local fallback
          localStorage.setItem('dh_admin_logged_in', 'true');
          showDashboard();
        }
      } else {
        // Direct local login
        localStorage.setItem('dh_admin_logged_in', 'true');
        showDashboard();
      }
    });
  }

  // Show Dashboard
  function showDashboard() {
    authScreen.style.display = 'none';
    dashboardScreen.style.display = 'flex';
    loadServices();
    loadSubpageEditor();
    loadLogos();
    loadProjects();
    loadSiteContent();
  }

  function loadSiteContent() {
    const saved = localStorage.getItem('dh_site_content');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.phone && document.getElementById('content-phone')) document.getElementById('content-phone').value = data.phone;
        if (data.email && document.getElementById('content-email')) document.getElementById('content-email').value = data.email;
        if (data.address && document.getElementById('content-address')) document.getElementById('content-address').value = data.address;
        if (data.heroTitle && document.getElementById('content-hero-title')) document.getElementById('content-hero-title').value = data.heroTitle;
      } catch (e) {}
    }
  }

  // Logout (Topbar & Sidebar buttons)
  const logoutBtns = document.querySelectorAll('#admin-logout-btn, .admin-logout-btn-action');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      localStorage.removeItem('dh_admin_logged_in');
      if (supabaseClient) {
        supabaseClient.auth.signOut();
      }
      dashboardScreen.style.display = 'none';
      authScreen.style.display = 'flex';
      showToast('Logged out successfully');
    });
  });

  // Tab Navigation
  const navItems = document.querySelectorAll('.admin-nav-item');
  const tabPanes = document.querySelectorAll('.admin-tab-pane');
  const currentTabTitle = document.getElementById('current-tab-title');
  const currentTabSub = document.getElementById('current-tab-sub');

  const tabTitles = {
    'tab-services': { title: 'Services Control Center', sub: 'Add, edit, or remove services displayed across the website.' },
    'tab-subpages': { title: 'Service Subpages Editor', sub: 'Customize titles, paragraphs, and featured images for service subpages.' },
    'tab-logos': { title: 'Client Logos Ticker', sub: 'Add or manage client logos displayed in the home page ticker.' },
    'tab-projects': { title: 'Projects Portfolio', sub: 'Add, update, or remove projects shown on the Projects page.' },
    'tab-content': { title: 'Website Copy & Contact', sub: 'Edit main studio contact details and hero titles.' }
  };

  navItems.forEach(item => {
    item.addEventListener('click', function () {
      const targetTab = this.getAttribute('data-tab');

      navItems.forEach(n => n.classList.remove('active'));
      tabPanes.forEach(p => (p.style.display = 'none'));

      this.classList.add('active');
      const activePane = document.getElementById(targetTab);
      if (activePane) activePane.style.display = 'block';

      if (tabTitles[targetTab]) {
        currentTabTitle.textContent = tabTitles[targetTab].title;
        currentTabSub.textContent = tabTitles[targetTab].sub;
      }
    });
  });

  // Default Services List
  const defaultServicesList = [
    {
      title: 'Residential Interiors',
      desc: 'Homes designed for the way you live. Comfortable, functional and timeless spaces tailored to your lifestyle.',
      img: '../assets/residential interior.jpeg',
      link: 'pages/residential-interiors.html'
    },
    {
      title: 'Corporate Interiors',
      desc: 'Professional spaces designed for productivity. Smart layout, modern designs and efficient environments.',
      img: '../assets/corporate interior.jpeg',
      link: 'pages/corporate-interiors.html'
    },
    {
      title: 'Retail Interiors',
      desc: 'Engaging spaces that reflect your brand and attract customers. Designed to create experiences.',
      img: '../assets/retail interior.jpeg',
      link: 'pages/retail-interiors.html'
    },
    {
      title: 'Project Management Consultancy',
      desc: 'End-to-end management turning interior designs into flawlessly executed spaces on time and on budget.',
      img: '../assets/project managment consultancy.jpeg',
      link: 'pages/consultation.html'
    },
    {
      title: 'Vastu Consultancy',
      desc: 'Harmonize your space with ancient Vastu Shastra principles to bring positive energy and alignment.',
      img: '../assets/vastu consultancy.jpeg',
      link: 'pages/vastu-consultancy.html'
    },
    {
      title: 'D.O.B Analysis',
      desc: 'Unlock personalized spatial insights using your Date of Birth & Numerology matrix for growth.',
      img: '../assets/D.O.B analysis.jpeg',
      link: 'pages/dob-analysis.html'
    }
  ];

  function getSubpageKeyFromLink(link, title) {
    const l = (link || '').toLowerCase();
    const t = (title || '').toLowerCase();
    if (l.includes('residential') || t.includes('residential')) return 'residential';
    if (l.includes('corporate') || t.includes('corporate')) return 'corporate';
    if (l.includes('retail') || t.includes('retail')) return 'retail';
    if (l.includes('consultation') || t.includes('consultation')) return 'consultation';
    if (l.includes('vastu') || t.includes('vastu')) return 'vastu';
    if (l.includes('dob') || t.includes('dob')) return 'dob';
    return '';
  }

  // 1. SERVICES CONTROL CENTER (Add, Edit, Delete)
  function loadServices() {
    const servicesGrid = document.getElementById('services-admin-grid');
    if (!servicesGrid) return;

    let services = defaultServicesList;
    const customServices = localStorage.getItem('dh_custom_services');
    if (customServices) {
      try {
        const parsed = JSON.parse(customServices);
        if (Array.isArray(parsed) && parsed.length > 0) {
          services = parsed;
        }
      } catch (e) { }
    }

    servicesGrid.innerHTML = services.map((s, idx) => `
      <div class="admin-project-card">
        <img src="${s.img}" alt="${s.title}" class="admin-project-img" onerror="this.src='../assets/logo.jpeg'">
        <div class="admin-project-body">
          <span class="badge badge-gold">${s.link || 'Service'}</span>
          <h4 class="admin-project-title" style="margin-top: 6px;">${s.title}</h4>
          <p style="font-size: 0.84rem; color: #c4b9ad; margin-bottom: 14px; line-height: 1.4;">${s.desc}</p>
          <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
            <button type="button" class="btn btn-gold" style="width: 100%; font-size: 0.85rem; font-weight: 700; padding: 10px;" onclick="editService(${idx})">EDIT FULL PAGE & CARD CONTENT</button>
            <button type="button" class="btn btn-outline-danger btn-sm" onclick="deleteService(${idx})">DELETE SERVICE</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  window.editService = function (index) {
    let services = defaultServicesList;
    const customServices = localStorage.getItem('dh_custom_services');
    if (customServices) {
      try { services = JSON.parse(customServices); } catch (e) { }
    }

    const target = services[index];
    if (!target) return;

    document.getElementById('service-edit-index').value = index;
    document.getElementById('service-title').value = target.title || '';
    document.getElementById('service-link').value = target.link || '';
    document.getElementById('service-desc').value = target.desc || '';

    const subKey = getSubpageKeyFromLink(target.link, target.title);
    const subData = subKey ? (JSON.parse(localStorage.getItem(`dh_subpage_${subKey}`) || 'null') || defaultSubpagesData[subKey] || {}) : {};

    document.getElementById('service-subpage-hero-subtitle').value = subData.heroSubtitle || '';
    document.getElementById('service-subpage-hero-title').value = subData.heroTitle || '';
    document.getElementById('service-subpage-p1').value = subData.p1 || '';
    document.getElementById('service-subpage-p2').value = subData.p2 || '';
    document.getElementById('service-subpage-sec2-tagline').value = subData.sec2Tagline || '';
    document.getElementById('service-subpage-sec2-title').value = subData.sec2Title || '';
    document.getElementById('service-subpage-sec2-p1').value = subData.sec2P1 || '';
    document.getElementById('service-subpage-sec2-p2').value = subData.sec2P2 || '';

    const cardPreview = document.getElementById('service-card-img-preview');
    if (cardPreview && target.img) {
      cardPreview.innerHTML = `<img src="${target.img}" style="max-height: 90px; border-radius: 6px; border: 1px solid var(--primary-gold);">`;
    }
    const subPreview = document.getElementById('service-subpage-img-preview');
    if (subPreview && subData.img) {
      subPreview.innerHTML = `<img src="${subData.img}" style="max-height: 90px; border-radius: 6px; border: 1px solid var(--primary-gold);">`;
    }

    document.getElementById('service-form-title').textContent = `Edit Full Service & Page Content: ${target.title}`;
    document.getElementById('service-submit-btn').textContent = `SAVE FULL ${target.title.toUpperCase()} PAGE CONTENT`;
    document.getElementById('cancel-service-edit-btn').style.display = 'inline-block';

    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const cancelServiceEditBtn = document.getElementById('cancel-service-edit-btn');
  if (cancelServiceEditBtn) {
    cancelServiceEditBtn.addEventListener('click', resetServiceForm);
  }

  function resetServiceForm() {
    const serviceForm = document.getElementById('service-form');
    if (serviceForm) serviceForm.reset();
    document.getElementById('service-edit-index').value = '-1';
    document.getElementById('service-form-title').textContent = 'Add New Service';
    document.getElementById('service-submit-btn').textContent = 'SAVE & ADD SERVICE';
    if (cancelServiceEditBtn) cancelServiceEditBtn.style.display = 'none';

    const cPrev = document.getElementById('service-card-img-preview');
    if (cPrev) cPrev.innerHTML = '';
    const sPrev = document.getElementById('service-subpage-img-preview');
    if (sPrev) sPrev.innerHTML = '';
  }

  // Custom Confirmation Modal Helper (Promise-based)
  function showConfirmModal(title, message) {
    return new Promise((resolve) => {
      const overlay = document.getElementById('dh-confirm-modal-overlay');
      const titleEl = document.getElementById('dh-confirm-modal-title');
      const msgEl = document.getElementById('dh-confirm-modal-msg');
      const cancelBtn = document.getElementById('dh-confirm-cancel-btn');
      const submitBtn = document.getElementById('dh-confirm-submit-btn');

      if (!overlay || !cancelBtn || !submitBtn) {
        resolve(window.confirm(`${title}\n\n${message}`));
        return;
      }

      if (titleEl) titleEl.textContent = title || 'Confirm Action';
      if (msgEl) msgEl.textContent = message || 'Are you sure you want to perform this action?';
      overlay.style.display = 'flex';

      const cleanup = (result) => {
        overlay.style.display = 'none';
        cancelBtn.onclick = null;
        submitBtn.onclick = null;
        resolve(result);
      };

      cancelBtn.onclick = () => cleanup(false);
      submitBtn.onclick = () => cleanup(true);
    });
  }

  window.deleteService = async function (index) {
    let services = defaultServicesList;
    const customServices = localStorage.getItem('dh_custom_services');
    if (customServices) {
      try { services = JSON.parse(customServices); } catch (e) { }
    }

    const title = services[index] ? services[index].title : 'Service';
    const confirmed = await showConfirmModal('Delete Service', `Are you sure you want to permanently delete "${title}"? This will remove its card and content from the website.`);
    if (confirmed) {
      services.splice(index, 1);
      localStorage.setItem('dh_custom_services', JSON.stringify(services));
      loadServices();
      resetServiceForm();
      showToast(`Deleted ${title}`);
    }
  };

  const serviceForm = document.getElementById('service-form');
  if (serviceForm) {
    serviceForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const editIndex = parseInt(document.getElementById('service-edit-index').value, 10);
      const title = document.getElementById('service-title').value.trim();
      const link = document.getElementById('service-link').value.trim();
      const desc = document.getElementById('service-desc').value.trim();
      const imgInput = document.getElementById('service-img-input');

      let services = JSON.parse(localStorage.getItem('dh_custom_services') || JSON.stringify(defaultServicesList));

      let imgUrl = editIndex >= 0 && services[editIndex] ? services[editIndex].img : '../assets/logo.jpeg';
      if (imgInput && imgInput.files[0]) {
        imgUrl = await uploadImageHelper(imgInput.files[0], 'services');
      }

      const serviceObj = { title, desc, img: imgUrl, link };

      if (editIndex >= 0) {
        services[editIndex] = serviceObj;
      } else {
        services.push(serviceObj);
      }

      localStorage.setItem('dh_custom_services', JSON.stringify(services));

      // Also save the full subpage content!
      const subKey = getSubpageKeyFromLink(link, title);
      if (subKey) {
        const existingSub = JSON.parse(localStorage.getItem(`dh_subpage_${subKey}`) || 'null') || defaultSubpagesData[subKey] || {};
        const subImgInput = document.getElementById('service-subpage-img-input');
        let subImgUrl = existingSub.img || imgUrl;
        if (subImgInput && subImgInput.files[0]) {
          subImgUrl = await uploadImageHelper(subImgInput.files[0], 'subpage-hero');
        }

        const subpageObj = {
          heroSubtitle: document.getElementById('service-subpage-hero-subtitle').value.trim() || existingSub.heroSubtitle || title,
          heroTitle: document.getElementById('service-subpage-hero-title').value.trim() || existingSub.heroTitle || title,
          p1: document.getElementById('service-subpage-p1').value.trim() || existingSub.p1 || desc,
          p2: document.getElementById('service-subpage-p2').value.trim() || existingSub.p2 || '',
          img: subImgUrl,
          sec2Tagline: document.getElementById('service-subpage-sec2-tagline').value.trim() || existingSub.sec2Tagline || '',
          sec2Title: document.getElementById('service-subpage-sec2-title').value.trim() || existingSub.sec2Title || '',
          sec2P1: document.getElementById('service-subpage-sec2-p1').value.trim() || existingSub.sec2P1 || '',
          sec2P2: document.getElementById('service-subpage-sec2-p2').value.trim() || existingSub.sec2P2 || ''
        };

        localStorage.setItem(`dh_subpage_${subKey}`, JSON.stringify(subpageObj));
      }

      loadServices();
      resetServiceForm();
      showToast(`Updated full content & card for ${title}!`);
    });
  }

  // 2. SERVICES SUBPAGES EDITOR
  const subpageSelect = document.getElementById('subpage-select');
  const subpageEditorForm = document.getElementById('subpage-editor-form');

  const defaultSubpagesData = {
    residential: {
      heroSubtitle: 'BESPOKE LIVING SPACES',
      heroTitle: 'Creating Homes That Reflect Your Lifestyle',
      p1: 'At Design Harmony, we create thoughtfully designed residential interiors that bring together comfort, functionality, and aesthetics. Every home is unique, so our designs are personalized according to your lifestyle, preferences, space requirements, and everyday needs.',
      p2: 'From living rooms and bedrooms to kitchens, wardrobes, and complete home interiors, we carefully plan every detail to create spaces that are practical, elegant, and truly feel like home.',
      img: '../assets/residential interior.jpeg',
      sec2Tagline: 'DESIGN PHILOSOPHY',
      sec2Title: 'Importance of Thoughtful Interior Design',
      sec2P1: 'A well-designed home is not just about beautiful finishes—it is about creating a space that works effortlessly for the people living in it. Proper space planning, lighting, colours, furniture, storage, materials, and finishes can completely transform the way a home looks and functions.',
      sec2P2: 'At Design Harmony, we balance creative design with smart space utilization, ensuring every corner serves a purpose while maintaining a cohesive and timeless aesthetic throughout your home.'
    },
    corporate: {
      heroSubtitle: 'COMMERCIAL DESIGN',
      heroTitle: 'Corporate Interior Design',
      p1: 'At Design Harmony, we create professional, modern, and efficient commercial spaces tailored to your business needs.',
      p2: 'From corporate offices and executive suites to reception areas, our designs reflect your brand identity while enhancing employee comfort.',
      img: '../assets/corporate interior.jpeg',
      sec2Tagline: 'BUSINESS VALUE',
      sec2Title: 'Importance of Effective Commercial Interior Design',
      sec2P1: 'A well-designed commercial space can improve productivity, workflow, space utilization, and customer experience.',
      sec2P2: 'At Design Harmony, we carefully consider space planning, lighting, furniture, storage, materials, and circulation to create efficient commercial spaces.'
    },
    retail: {
      heroSubtitle: 'RETAIL SPACES',
      heroTitle: 'Retail & Showroom Interiors',
      p1: 'At Design Harmony, we design retail interiors that combine visual appeal, brand identity, and customer experience.',
      p2: 'Every retail space is thoughtfully planned to attract attention, showcase products effectively, and create an inviting environment.',
      img: '../assets/retail interior.jpeg',
      sec2Tagline: 'COMMERCIAL IMPACT',
      sec2Title: 'Importance of Effective Retail Interior Design',
      sec2P1: 'A well-designed retail space can influence how customers move, interact with products, and experience your brand.',
      sec2P2: 'At Design Harmony, we carefully consider store layout, product displays, lighting, storage, and customer flow.'
    },
    consultation: {
      heroSubtitle: 'OUR SERVICES',
      heroTitle: 'Project Management Consultancy',
      p1: 'At Design Harmony, our Project Management Consultancy ensures that your interior project moves smoothly from planning to final execution.',
      p2: 'We coordinate between designers, contractors, vendors, and site teams while keeping a close watch on quality, timelines, and budget.',
      img: '../assets/project managment consultancy.jpeg',
      sec2Tagline: 'WHY PMC MATTERS',
      sec2Title: 'Importance of Professional Project Management',
      sec2P1: 'Successful interiors require more than a great design—they require proper planning, coordination, supervision, and quality control.',
      sec2P2: 'Our consultancy covers site coordination, vendor management, work scheduling, quality monitoring, and execution supervision.'
    },
    vastu: {
      heroSubtitle: 'ENERGY HARMONY',
      heroTitle: 'Vastu Shastra Consultancy',
      p1: 'Vastu Shastra focuses on creating balance between human living spaces and natural energies.',
      p2: 'At Design Harmony, our Vastu Consultancy offers practical advice to optimize energy flow, orientation, and layout in your home or office.',
      img: '../assets/vastu consultancy.jpeg',
      sec2Tagline: 'FOUNDATION OF VASTU',
      sec2Title: 'Importance of Directions in Vastu',
      sec2P1: 'Directions are one of the most important foundations of Vastu Shastra, associated with different elements and aspects of life.',
      sec2P2: 'Our Vastu analysis studies how these directions interact with your main entrance, kitchen, bedrooms, work areas, and furniture placement.'
    },
    dob: {
      heroSubtitle: 'NUMEROLOGY MATRIX',
      heroTitle: 'Date of Birth (D.O.B) Analysis',
      p1: 'D.O.B Analysis uses your date of birth and numerology matrix to help you understand personal strengths, life patterns, and directional alignments.',
      p2: 'Our analysis provides meaningful guidance to align your personal and professional spaces with your natural tendencies.',
      img: '../assets/D.O.B analysis.jpeg',
      sec2Tagline: 'NUMEROLOGY INSIGHTS',
      sec2Title: 'Importance of Numbers in D.O.B Analysis',
      sec2P1: 'Every number is traditionally associated with certain characteristics and influences in your birth date.',
      sec2P2: 'A complete analysis can offer insights related to personality, career direction, financial patterns, decision-making, and personal growth.'
    },
    home: {
      heroSubtitle: 'DESIGN HARMONY',
      heroTitle: 'Creating Spaces That Feel as Good as They Look.',
      p1: 'At Design Harmony, we create thoughtful, functional and timeless spaces designed around the way you live and work.',
      p2: 'From residential interiors to corporate environments and Vastu consultancy, every project is tailored to reflect your unique lifestyle.',
      img: '../assets/Untitled design.jpeg',
      sec2Tagline: 'ABOUT ANURADHA',
      sec2Title: 'Experience Meets Thoughtful Design',
      sec2P1: 'Hi, I\'m Anuradha, an interior designer with 20+ years of experience creating thoughtful, functional and timeless spaces.',
      sec2P2: 'From residential homes to commercial projects, my focus has always been to design spaces that reflect your lifestyle while balancing comfort, aesthetics, and practicality.'
    },
    about: {
      heroSubtitle: 'ABOUT DESIGN HARMONY',
      heroTitle: 'Experience Meets Thoughtful Design',
      p1: 'Creating functional, elegant, and harmonious spaces tailored around the way you live and work.',
      p2: 'Founded by Anuradha Chadha, Design Harmony stands at the intersection of aesthetic sophistication, ergonomic practical utility, and spatial science.',
      img: '../Maam\'s Image.png',
      sec2Tagline: 'OUR STORY',
      sec2Title: 'Designing Spaces That Reflect Your Soul',
      sec2P1: 'Founded by Anuradha Chadha, Design Harmony stands at the intersection of aesthetic sophistication, ergonomic practical utility, and ancient spatial science. With over 20 years of hands-on experience in interior design, project management, Vastu Shastra, and Date of Birth numerology, Anuradha brings a holistic perspective to every project.',
      sec2P2: 'We believe that a space is not merely four walls filled with furniture. It is a living environment that shapes your mindset, energy levels, personal well-being, and professional productivity.'
    },
    projects: {
      heroSubtitle: 'OUR PORTFOLIO',
      heroTitle: 'Featured Works & Design Showcase',
      p1: 'Browse through our completed luxury residences, commercial office spaces, boutique retail displays, and Vastu transformations.',
      p2: 'Every project showcases our attention to detail, quality craftsmanship, and client-first approach to space planning.',
      img: '../projects/Living Room.jpg',
      sec2Tagline: 'INNOVATIVE DESIGN SOLUTIONS',
      sec2Title: 'Have a Project in Mind?',
      sec2P1: 'Let\'s discuss how we can turn your space into a masterpiece. From initial consultation to final delivery, we manage every step.',
      sec2P2: 'Contact our team today to schedule your personalized design walkthrough or consultation session.'
    },
    contact: {
      heroSubtitle: 'GET IN TOUCH',
      heroTitle: 'Start Your Project Journey',
      p1: 'We would love to hear about your space, project requirements, or schedule a personal session with Anuradha Chadha.',
      p2: 'Reach out to us via phone, email, or by submitting your inquiry form below. We respond to all consultations within 24 hours.',
      img: '../assets/logo.jpeg',
      sec2Tagline: 'DIRECT CONTACT INFO',
      sec2Title: 'Book Your Consultation',
      sec2P1: 'Select your required consultation service and fill out the details. Our team will get in touch with you shortly.',
      sec2P2: 'Office: B03/8, Block B, Kalkaji, New Delhi, 110019. Phone: +91 9811234164.'
    }
  };

  function loadSubpageEditor() {
    if (!subpageSelect) return;
    const selectedKey = subpageSelect.value || 'residential';
    const savedData = JSON.parse(localStorage.getItem(`dh_subpage_${selectedKey}`) || 'null');
    const data = savedData || defaultSubpagesData[selectedKey] || defaultSubpagesData.residential;

    document.getElementById('subpage-hero-subtitle').value = data.heroSubtitle || '';
    document.getElementById('subpage-hero-title').value = data.heroTitle || '';
    document.getElementById('subpage-p1').value = data.p1 || '';
    document.getElementById('subpage-p2').value = data.p2 || '';
    document.getElementById('subpage-sec2-tagline').value = data.sec2Tagline || '';
    document.getElementById('subpage-sec2-title').value = data.sec2Title || '';
    document.getElementById('subpage-sec2-p1').value = data.sec2P1 || '';
    document.getElementById('subpage-sec2-p2').value = data.sec2P2 || '';

    const previewContainer = document.getElementById('subpage-current-img-preview');
    if (previewContainer && data.img) {
      previewContainer.innerHTML = `<img src="${data.img}" style="max-height: 100px; border-radius: 6px; border: 1px solid var(--primary-gold);">`;
    } else if (previewContainer) {
      previewContainer.innerHTML = '';
    }
  }

  if (subpageSelect) {
    subpageSelect.addEventListener('change', loadSubpageEditor);
  }

  if (subpageEditorForm) {
    subpageEditorForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const selectedKey = subpageSelect ? subpageSelect.value : 'residential';
      const existing = JSON.parse(localStorage.getItem(`dh_subpage_${selectedKey}`) || 'null') || defaultSubpagesData[selectedKey] || {};

      const fileInput = document.getElementById('subpage-img-input');
      let imgUrl = existing.img || '';
      if (fileInput && fileInput.files[0]) {
        imgUrl = await uploadImageHelper(fileInput.files[0], 'subpage-hero');
      }

      const updatedObj = {
        heroSubtitle: document.getElementById('subpage-hero-subtitle').value.trim(),
        heroTitle: document.getElementById('subpage-hero-title').value.trim(),
        p1: document.getElementById('subpage-p1').value.trim(),
        p2: document.getElementById('subpage-p2').value.trim(),
        img: imgUrl,
        sec2Tagline: document.getElementById('subpage-sec2-tagline').value.trim(),
        sec2Title: document.getElementById('subpage-sec2-title').value.trim(),
        sec2P1: document.getElementById('subpage-sec2-p1').value.trim(),
        sec2P2: document.getElementById('subpage-sec2-p2').value.trim()
      };

      localStorage.setItem(`dh_subpage_${selectedKey}`, JSON.stringify(updatedObj));
      loadSubpageEditor();
      showToast(`Saved ${selectedKey.toUpperCase()} subpage content!`);
    });
  }

  // Load Client Logos
  const defaultLogosList = [
    { name: 'Logo 1', path: '../our clients/logo 1.jpg' },
    { name: 'Logo 2', path: '../our clients/logo 2.jpg' },
    { name: 'Logo 3', path: '../our clients/logo 3.jpg' },
    { name: 'Logo 4', path: '../our clients/logo 4.jpg' },
    { name: 'Logo 5', path: '../our clients/logo 5.jpg' },
    { name: 'Logo 6', path: '../our clients/logo 6.jpg' },
    { name: 'Logo 7', path: '../our clients/logo 7.jpg' },
    { name: 'Logo 8', path: '../our clients/logo 8.jpg' },
    { name: 'Logo 9', path: '../our clients/logo 9.jpg' },
    { name: 'Logo 10', path: '../our clients/logo 10.jpg' },
    { name: 'Logo 11', path: '../our clients/logo 11.jpg' },
    { name: 'Logo 12', path: '../our clients/logo 12.jpg' },
    { name: 'Logo 13', path: '../our clients/logo 13.jpg' },
    { name: 'Logo 14', path: '../our clients/logo 14.jpg' },
    { name: 'Logo 15', path: '../our clients/logo 15.jpg' },
    { name: 'Logo 16', path: '../our clients/logo 16.jpg' },
    { name: 'Logo 17', path: '../our clients/logo 17.jpg' },
    { name: 'Logo 18', path: '../our clients/logo 18.jpg' },
    { name: 'Logo 19', path: '../our clients/logo 19.jpg' },
    { name: 'Logo 20', path: '../our clients/logo 20.jpg' },
    { name: 'Logo 21', path: '../our clients/logo 21.jpg' },
    { name: 'Logo 22', path: '../our clients/logo 22.jpg' }
  ];

  function loadLogos() {
    const logosGrid = document.getElementById('logos-grid');
    if (!logosGrid) return;

    let logos = defaultLogosList;
    const customLogos = localStorage.getItem('dh_custom_logos');
    if (customLogos) {
      try {
        const parsed = JSON.parse(customLogos);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].path && !parsed[0].path.includes('assets/our clients')) {
          logos = parsed;
        }
      } catch (e) { }
    }

    logosGrid.innerHTML = logos.map((item, idx) => {
      const fileName = item.name || 'Client Logo';
      const imgPath = item.path || `../our clients/${item}`;
      return `
        <div class="admin-logo-card">
          <img src="${imgPath}" alt="${fileName}" class="admin-logo-preview" onerror="this.src='../assets/logo.jpeg'">
          <div class="admin-logo-name">${fileName}</div>
          <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeLogo(${idx})">Remove</button>
        </div>
      `;
    }).join('');
  }

  window.removeLogo = async function (index) {
    let logos = defaultLogosList;
    const customLogos = localStorage.getItem('dh_custom_logos');
    if (customLogos) {
      try { logos = JSON.parse(customLogos); } catch (e) { }
    }
    const logoName = logos[index] ? (logos[index].name || 'Client Logo') : 'Logo';
    const confirmed = await showConfirmModal('Remove Client Logo', `Are you sure you want to remove "${logoName}" from the client logos ticker?`);
    if (confirmed) {
      logos.splice(index, 1);
      localStorage.setItem('dh_custom_logos', JSON.stringify(logos));
      loadLogos();
      showToast('Client logo removed');
    }
  };

  // Supabase Storage Uploader & Base64 Fallback
  async function uploadImageHelper(file, bucketName) {
    if (supabaseClient && supabaseClient.storage) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const { data, error } = await supabaseClient.storage.from(bucketName).upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

        if (!error && data) {
          const { data: publicUrlData } = supabaseClient.storage.from(bucketName).getPublicUrl(fileName);
          if (publicUrlData && publicUrlData.publicUrl) {
            return publicUrlData.publicUrl;
          }
        }
      } catch (err) {
        console.warn('Supabase storage upload fallback:', err);
      }
    }

    // Fallback: FileReader DataURL (Base64)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.readAsDataURL(file);
    });
  }

  // Add Logo Form (File Upload)
  const addLogoForm = document.getElementById('add-logo-form');
  if (addLogoForm) {
    addLogoForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const name = document.getElementById('logo-client-name').value.trim();
      const fileInput = document.getElementById('logo-file-input');

      if (!name || !fileInput || !fileInput.files[0]) {
        alert('Please enter a client name and select an image file to upload.');
        return;
      }

      const file = fileInput.files[0];
      const imageUrl = await uploadImageHelper(file, 'client-logos');

      let logos = JSON.parse(localStorage.getItem('dh_custom_logos') || JSON.stringify(defaultLogosList));
      logos.push({ name: name, path: imageUrl });
      localStorage.setItem('dh_custom_logos', JSON.stringify(logos));

      loadLogos();
      addLogoForm.reset();
      showToast(`Uploaded and added logo for ${name}!`);
    });
  }

  // Load Projects
  const defaultProjectsList = [
    { title: 'Living Room Elegance', category: 'Residential', img: '../projects/Living Room.jpg' },
    { title: 'Master Bedroom Suite', category: 'Residential', img: '../projects/Bedroom Area.jpg' },
    { title: 'Luxury Dining Space', category: 'Residential', img: '../projects/Dining Area.jpg' },
    { title: 'Contemporary Modular Kitchen', category: 'Residential', img: '../projects/Kitchen Area.jpg' },
    { title: 'BGCC Head Office', category: 'Corporate', img: '../projects/BGCC HEAD OFFICE.jpg' },
    { title: 'Export Genius Office Area', category: 'Corporate', img: '../projects/Export Genius Office Area.jpg' },
    { title: 'Export Genius Conference Room', category: 'Corporate', img: '../projects/Export Genius conference room.jpg' },
    { title: 'Indian Army Executive Office', category: 'Corporate', img: '../projects/Indian Army Office.jpg' },
    { title: 'SUN Group Office Reception', category: 'Corporate', img: '../projects/SUN Group Office reception.jpg' }
  ];

  function loadProjects() {
    const projectsGrid = document.getElementById('projects-admin-grid');
    if (!projectsGrid) return;

    let projects = defaultProjectsList;
    const customProjects = localStorage.getItem('dh_custom_projects');
    if (customProjects) {
      try {
        const parsed = JSON.parse(customProjects);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].img && !parsed[0].img.includes('assets/projects')) {
          projects = parsed;
        }
      } catch (e) { }
    }

    projectsGrid.innerHTML = projects.map((p, idx) => `
      <div class="admin-project-card">
        <img src="${p.img}" alt="${p.title}" class="admin-project-img" onerror="this.src='../assets/logo.jpeg'">
        <div class="admin-project-body">
          <span class="badge badge-gold">${p.category}</span>
          <h4 class="admin-project-title">${p.title}</h4>
          <button type="button" class="btn btn-outline-danger btn-sm mt-2" onclick="removeProject(${idx})">Delete Project</button>
        </div>
      </div>
    `).join('');
  }

  window.removeProject = async function (index) {
    let projects = JSON.parse(localStorage.getItem('dh_custom_projects') || '[]');
    const projTitle = projects[index] ? projects[index].title : 'Project';
    const confirmed = await showConfirmModal('Delete Showcase Project', `Are you sure you want to delete "${projTitle}" from the Projects portfolio?`);
    if (confirmed) {
      projects.splice(index, 1);
      localStorage.setItem('dh_custom_projects', JSON.stringify(projects));
      loadProjects();
      showToast('Project deleted');
    }
  };

  // Add Project Form (File Upload)
  const addProjectForm = document.getElementById('add-project-form');
  if (addProjectForm) {
    addProjectForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const title = document.getElementById('project-title').value.trim();
      const category = document.getElementById('project-category').value;
      const fileInput = document.getElementById('project-file-input');

      if (!title || !fileInput || !fileInput.files[0]) {
        alert('Please enter a project title and select an image file to upload.');
        return;
      }

      const file = fileInput.files[0];
      const imageUrl = await uploadImageHelper(file, 'projects');

      let projects = JSON.parse(localStorage.getItem('dh_custom_projects') || JSON.stringify(defaultProjectsList));
      projects.push({ title: title, category: category, img: imageUrl });
      localStorage.setItem('dh_custom_projects', JSON.stringify(projects));

      loadProjects();
      addProjectForm.reset();
      showToast(`Uploaded and added ${title} to Projects!`);
    });
  }

  // Content Form
  const editContentForm = document.getElementById('edit-content-form');
  if (editContentForm) {
    editContentForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const phone = document.getElementById('content-phone').value.trim();
      const email = document.getElementById('content-email').value.trim();
      const address = document.getElementById('content-address').value.trim();
      const heroTitle = document.getElementById('content-hero-title').value.trim();

      localStorage.setItem('dh_site_content', JSON.stringify({ phone, email, address, heroTitle }));
      showToast('Website copy updated successfully!');
    });
  }

  // Toast Helper
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.style.display = 'block';
    setTimeout(() => {
      toastEl.style.display = 'none';
    }, 3500);
  }

  // Run on load
  document.addEventListener('DOMContentLoaded', initConfig);
})();
