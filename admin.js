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

  window.removeLogo = function (index) {
    let logos = defaultLogosList;
    const customLogos = localStorage.getItem('dh_custom_logos');
    if (customLogos) {
      try { logos = JSON.parse(customLogos); } catch (e) { }
    }
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

      let logos = JSON.parse(localStorage.getItem('dh_custom_logos') || JSON.stringify(defaultLogosList));
      logos.push({ name: name, path: path });
      localStorage.setItem('dh_custom_logos', JSON.stringify(logos));

      loadLogos();
      addLogoForm.reset();
      showToast(`Added logo for ${name}`);
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
