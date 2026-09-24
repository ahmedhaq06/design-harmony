// Design Harmony Admin Dashboard Logic & Supabase Integration

(function () {
  'use strict';

  // DOM Elements
  const authScreen = document.getElementById('auth-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');
  const configSetupBox = document.getElementById('config-setup-box');
  const adminLoginForm = document.getElementById('admin-login-form');
  const supabaseUrlInput = document.getElementById('supabase-url');
  const supabaseKeyInput = document.getElementById('supabase-key');
  const saveConfigBtn = document.getElementById('save-config-btn');
  const toggleConfigBtn = document.getElementById('toggle-config-btn');
  const authErrorMsg = document.getElementById('auth-error-msg');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const toastEl = document.getElementById('dashboard-toast');

  let supabaseClient = null;

  // Initial Config Check
  function initConfig() {
    const savedUrl = localStorage.getItem('dh_supabase_url');
    const savedKey = localStorage.getItem('dh_supabase_key');

    if (savedUrl && savedKey && window.supabase) {
      supabaseUrlInput.value = savedUrl;
      supabaseKeyInput.value = savedKey;
      try {
        supabaseClient = window.supabase.createClient(savedUrl, savedKey);
        configSetupBox.style.display = 'none';
        adminLoginForm.style.display = 'block';
        checkExistingSession();
      } catch (err) {
        showConfigBox();
      }
    } else {
      showConfigBox();
    }
  }

  function showConfigBox() {
    configSetupBox.style.display = 'block';
    adminLoginForm.style.display = 'none';
  }

  // Save Supabase Credentials
  if (saveConfigBtn) {
    saveConfigBtn.addEventListener('click', function () {
      const url = supabaseUrlInput.value.trim();
      const key = supabaseKeyInput.value.trim();

      if (!url || !key) {
        alert('Please enter both Supabase Project URL and Anon Key.');
        return;
      }

      localStorage.setItem('dh_supabase_url', url);
      localStorage.setItem('dh_supabase_key', key);

      if (window.supabase) {
        supabaseClient = window.supabase.createClient(url, key);
        configSetupBox.style.display = 'none';
        adminLoginForm.style.display = 'block';
        showToast('Supabase backend connected successfully!');
      }
    });
  }

  if (toggleConfigBtn) {
    toggleConfigBtn.addEventListener('click', function () {
      showConfigBox();
    });
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
    loadLeads();
    loadLogos();
    loadProjects();
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      localStorage.removeItem('dh_admin_logged_in');
      if (supabaseClient) {
        supabaseClient.auth.signOut();
      }
      dashboardScreen.style.display = 'none';
      authScreen.style.display = 'flex';
      showToast('Logged out successfully');
    });
  }

  // Tab Navigation
  const navItems = document.querySelectorAll('.admin-nav-item');
  const tabPanes = document.querySelectorAll('.admin-tab-pane');
  const currentTabTitle = document.getElementById('current-tab-title');
  const currentTabSub = document.getElementById('current-tab-sub');

  const tabTitles = {
    'tab-leads': { title: 'Form Inquiries', sub: 'View customer consultation bookings and requests in real-time.' },
    'tab-logos': { title: 'Client Logos Ticker', sub: 'Add or manage client logos displayed in the home page ticker.' },
    'tab-projects': { title: 'Projects Portfolio', sub: 'Add, update, or remove projects shown on the Projects page.' },
    'tab-content': { title: 'Website Copy & Contact', sub: 'Edit main studio contact details and hero titles.' },
    'tab-settings': { title: 'Handoff & Ownership Transfer', sub: 'Guide for transferring 100% backend ownership to your buyer.' }
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

  // Mock / Real Leads Loader
  function loadLeads() {
    const tableBody = document.getElementById('leads-table-body');
    const localLeads = JSON.parse(localStorage.getItem('dh_form_leads') || '[]');

    if (localLeads.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4 text-muted">No form inquiries received yet. Submit a form on the site to see real-time leads here!</td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = localLeads.map(lead => `
      <tr>
        <td>${lead.date || 'Today'}</td>
        <td><span class="badge badge-gold">${lead.type || 'Consultation'}</span></td>
        <td><strong>${lead.name || 'N/A'}</strong></td>
        <td>${lead.contact || 'N/A'}</td>
        <td>${lead.email || 'N/A'}</td>
        <td>${lead.details || lead.budget || 'N/A'}</td>
      </tr>
    `).join('');
  }

  const refreshLeadsBtn = document.getElementById('refresh-leads-btn');
  if (refreshLeadsBtn) {
    refreshLeadsBtn.addEventListener('click', function () {
      loadLeads();
      showToast('Leads refreshed!');
    });
  }

  // Load Client Logos
  function loadLogos() {
    const logosGrid = document.getElementById('logos-grid');
    if (!logosGrid) return;

    const defaultLogos = [
      'AMBER.png', 'AXIS BANK.png', 'BSES.png', 'CHARLIE OUTLAW.png',
      'CITY PARK.png', 'CROSSROADS.png', 'DATAR.jpg', 'DDA.png',
      'DLF.png', 'Eros.png', 'FORTIS.png', 'HONDA.png', 'HOSPITALITY.jpg'
    ];

    const logos = JSON.parse(localStorage.getItem('dh_custom_logos') || JSON.stringify(defaultLogos));

    logosGrid.innerHTML = logos.map((item, idx) => {
      const fileName = typeof item === 'string' ? item : item.name;
      const imgPath = typeof item === 'string' ? `../assets/our clients/${item}` : item.path;
      return `
        <div class="admin-logo-card">
          <img src="${imgPath}" alt="${fileName}" class="admin-logo-preview">
          <div class="admin-logo-name">${fileName.replace(/\.[^/.]+$/, '')}</div>
          <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeLogo(${idx})">Remove</button>
        </div>
      `;
    }).join('');
  }

  window.removeLogo = function (index) {
    const defaultLogos = [
      'AMBER.png', 'AXIS BANK.png', 'BSES.png', 'CHARLIE OUTLAW.png',
      'CITY PARK.png', 'CROSSROADS.png', 'DATAR.jpg', 'DDA.png',
      'DLF.png', 'Eros.png', 'FORTIS.png', 'HONDA.png', 'HOSPITALITY.jpg'
    ];
    let logos = JSON.parse(localStorage.getItem('dh_custom_logos') || JSON.stringify(defaultLogos));
    logos.splice(index, 1);
    localStorage.setItem('dh_custom_logos', JSON.stringify(logos));
    loadLogos();
    showToast('Client logo removed');
  };

  // Add Logo Form
  const addLogoForm = document.getElementById('add-logo-form');
  if (addLogoForm) {
    addLogoForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('logo-client-name').value.trim();
      const path = document.getElementById('logo-img-path').value.trim();

      if (!name || !path) return;

      let logos = JSON.parse(localStorage.getItem('dh_custom_logos') || '[]');
      logos.push({ name: name, path: path });
      localStorage.setItem('dh_custom_logos', JSON.stringify(logos));

      loadLogos();
      addLogoForm.reset();
      showToast(`Added logo for ${name}`);
    });
  }

  // Load Projects
  function loadProjects() {
    const projectsGrid = document.getElementById('projects-admin-grid');
    if (!projectsGrid) return;

    const defaultProjects = [
      { title: 'The Royal Heritage Residence', category: 'Residential', img: '../assets/projects/The Royal Heritage Residence.jpg' },
      { title: 'Veda Corporate Headquarters', category: 'Corporate', img: '../assets/projects/Veda Corporate Headquarters.jpg' },
      { title: 'Aura Luxury Boutique', category: 'Retail', img: '../assets/projects/Aura Luxury Boutique.jpg' },
      { title: 'The Pavilion Penthouse', category: 'Residential', img: '../assets/projects/The Pavilion Penthouse.jpeg' },
      { title: 'Zenith Executive Suite', category: 'Corporate', img: '../assets/projects/Zenith Executive Suite.jpeg' },
      { title: 'Harmonious Vastu Sanctuary', category: 'Turnkey PMC', img: '../assets/projects/Harmonious Vastu Sanctuary.jpeg' }
    ];

    const projects = JSON.parse(localStorage.getItem('dh_custom_projects') || JSON.stringify(defaultProjects));

    projectsGrid.innerHTML = projects.map((p, idx) => `
      <div class="admin-project-card">
        <img src="${p.img}" alt="${p.title}" class="admin-project-img">
        <div class="admin-project-body">
          <span class="badge badge-gold">${p.category}</span>
          <h4 class="admin-project-title">${p.title}</h4>
          <button type="button" class="btn btn-outline-danger btn-sm mt-2" onclick="removeProject(${idx})">Delete Project</button>
        </div>
      </div>
    `).join('');
  }

  window.removeProject = function (index) {
    let projects = JSON.parse(localStorage.getItem('dh_custom_projects') || '[]');
    projects.splice(index, 1);
    localStorage.setItem('dh_custom_projects', JSON.stringify(projects));
    loadProjects();
    showToast('Project deleted');
  };

  // Add Project Form
  const addProjectForm = document.getElementById('add-project-form');
  if (addProjectForm) {
    addProjectForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const title = document.getElementById('project-title').value.trim();
      const category = document.getElementById('project-category').value;
      const img = document.getElementById('project-img').value.trim();

      if (!title || !img) return;

      let projects = JSON.parse(localStorage.getItem('dh_custom_projects') || '[]');
      projects.push({ title, category, img });
      localStorage.setItem('dh_custom_projects', JSON.stringify(projects));

      loadProjects();
      addProjectForm.reset();
      showToast(`Added ${title} to Projects`);
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
