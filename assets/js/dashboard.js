/**
 * DASHBOARD.JS
 * Client-side scripting for Serverless Architecture Dashboard
 * Manages responsive sidebar menus, metric calculations, and interactive views
 */

document.addEventListener('DOMContentLoaded', () => {
  initDashboardSidebar();
  initDashboardNavigation();
  initLiveLogsSimulator();
  initDashboardMetrics();
});





/* ==========================================================================
   3. Mobile & Tablet Sidebar Menu Toggle
   ========================================================================== */
function initDashboardSidebar() {
  const sidebarToggle = document.getElementById('dashboard-sidebar-toggle');
  const sidebar = document.querySelector('.dashboard-sidebar');
  const mainOverlay = document.createElement('div');
  
  if (!sidebarToggle || !sidebar) return;

  mainOverlay.className = 'sidebar-overlay';
  document.body.appendChild(mainOverlay);

  sidebarToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('active');
    mainOverlay.classList.toggle('active');
    
    // Toggle hamburger icon
    const icon = sidebarToggle.querySelector('i');
    if (icon) {
      icon.className = sidebar.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
    }
  });

  // Close sidebar on overlay click
  mainOverlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    mainOverlay.classList.remove('active');
    const icon = sidebarToggle.querySelector('i');
    if (icon) icon.className = 'fas fa-bars';
  });

  // Close sidebar on link click in mobile views
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1024) {
        sidebar.classList.remove('active');
        mainOverlay.classList.remove('active');
        const icon = sidebarToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      }
    });
  });
}

/* ==========================================================================
   4. Dashboard Tabbed Navigation
   ========================================================================== */
function initDashboardNavigation() {
  const links = document.querySelectorAll('.sidebar-link[data-tab]');
  const panels = document.querySelectorAll('.dashboard-panel');
  const titleDisplay = document.getElementById('dashboard-view-title');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetTab = link.getAttribute('data-tab');
      
      // Update sidebar links active class
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Update dashboard active panel
      panels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `panel-${targetTab}`) {
          panel.classList.add('active');
        }
      });

      // Update header title in Dashboard
      if (titleDisplay) {
        titleDisplay.textContent = link.querySelector('span').textContent.toUpperCase();
      }
    });
  });
}

/* ==========================================================================
   5. Live Serverless Logs Simulator
   ========================================================================== */
function initLiveLogsSimulator() {
  const logStream = document.getElementById('dashboard-log-stream');
  if (!logStream) return;

  const runtimes = ['AWS-Lambda', 'GCP-CloudFunc', 'Azure-Func', 'Cloudflare-Worker'];
  const functions = ['getDesignsList', 'triggerColdStartOptimization', 'calculateInvocationCost', 'downloadSAMTemplate', 'validateAuthToken'];
  const statuses = ['SUCCESS', 'SUCCESS', 'SUCCESS', 'SUCCESS', 'WARNED', 'FAILED'];

  setInterval(() => {
    if (!logStream) return;
    
    const randomRuntime = runtimes[Math.floor(Math.random() * runtimes.length)];
    const randomFunc = functions[Math.floor(Math.random() * functions.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    const duration = Math.floor(Math.random() * 450) + 12;
    const size = (Math.random() * 256).toFixed(1);
    
    let statusClass = 'log-success';
    if (randomStatus === 'WARNED') statusClass = 'log-warning';
    if (randomStatus === 'FAILED') statusClass = 'log-danger';

    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.style.borderLeft = `3px solid var(--border-color)`;
    logEntry.style.padding = '8px 12px';
    logEntry.style.marginBottom = '6px';
    logEntry.style.fontSize = '0.8rem';
    logEntry.style.fontFamily = 'monospace';
    logEntry.style.background = 'rgba(255, 255, 255, 0.02)';
    logEntry.style.borderRadius = '4px';
    logEntry.style.display = 'flex';
    logEntry.style.justifyContent = 'space-between';

    logEntry.innerHTML = `
      <span>[${timestamp}] <strong style="color: var(--accent-color);">${randomRuntime}</strong>: Executing <span style="color: var(--secondary-color);">${randomFunc}</span></span>
      <span>
        <span style="margin-right: 12px; color: var(--text-muted);">${duration}ms | ${size}MB</span>
        <span class="${statusClass}" style="font-weight: 700; font-size: 0.75rem;">${randomStatus}</span>
      </span>
    `;

    logStream.insertBefore(logEntry, logStream.firstChild);

    // Prune logs to keep it light
    if (logStream.children.length > 25) {
      logStream.removeChild(logStream.lastChild);
    }
  }, 3500);
}

/* ==========================================================================
   6. Dashboard Stats Updates
   ========================================================================== */
function initDashboardMetrics() {
  // Let's add simple visual animations to numerical metrics in dashboard
  const statValues = document.querySelectorAll('.stat-number');
  statValues.forEach(elem => {
    const rawVal = elem.textContent.trim();
    if (rawVal.startsWith('$')) {
      // It is currency
      const numericPart = parseFloat(rawVal.replace('$', ''));
      animateValue(elem, 0, numericPart, 2000, '$');
    } else if (rawVal.includes('/')) {
      // Progress like 1/3
      return;
    } else if (!isNaN(parseInt(rawVal))) {
      const numericPart = parseInt(rawVal);
      animateValue(elem, 0, numericPart, 2000, '');
    }
  });
}

function animateValue(obj, start, end, duration, prefix = '') {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const val = progress * (end - start) + start;
    
    if (prefix === '$') {
      obj.textContent = prefix + val.toFixed(2);
    } else {
      obj.textContent = prefix + Math.floor(val);
    }
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}
