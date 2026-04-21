// Shared UI Components for Standalone HTML
const UI = {
  injectLayout() {
    const layout = `
      <div class="flex h-screen bg-surface bg-mesh relative overflow-hidden">
        <!-- Sidebar -->
        <aside class="hidden md:flex flex-col w-64 glass h-full border-r border-outline-variant/30 py-4 px-3 overflow-y-auto z-20 shrink-0">
          <div class="text-xl font-bold text-primary mb-8 ml-3 flex items-center gap-2">
            <div class="w-8 h-8 bg-primary text-on-primary rounded-xl flex items-center justify-center">
              <i data-lucide="file-text" size="18"></i>
            </div>
            Notes App
          </div>
          <ul class="space-y-1" id="nav-links"></ul>
          <div class="mb-6 mt-6">
            <h3 class="px-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Spaces</h3>
            <ul class="space-y-1" id="space-links"></ul>
          </div>
          <div class="mt-auto pt-6 border-t border-outline-variant/30">
            <ul class="space-y-1" id="settings-links"></ul>
          </div>
        </aside>

        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <!-- TopBar -->
          <header class="h-16 glass border-b border-outline-variant/30 px-4 sm:px-6 flex items-center justify-between z-10 sticky top-0 shrink-0">
            <div class="flex items-center gap-4 flex-1">
              <div class="md:hidden w-8 h-8 flex items-center justify-center text-primary">
                <i data-lucide="file-text"></i>
              </div>
              <div class="max-w-md w-full relative group">
                <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size="18"></i>
                <input type="text" id="global-search" placeholder="Search notes..." class="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all">
              </div>
            </div>
          </header>

          <main id="main-content" class="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6 relative no-scrollbar">
            <!-- Content Injected Here -->
          </main>
          
          <!-- BottomNav (Mobile) -->
          <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-md border-t border-outline-variant/30 px-4 py-2 z-50 safe-area-bottom">
            <ul class="flex items-center justify-between" id="bottom-nav"></ul>
          </nav>
        </div>
      </div>
    `;
    
    // Inject the layout container
    const appRoot = document.getElementById('app');
    if (appRoot) {
      const content = appRoot.innerHTML;
      appRoot.innerHTML = layout;
      document.getElementById('main-content').innerHTML = content;
    }

    this.renderNav();
    lucide.createIcons();
    this.applyTheme();
  },

  renderNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    const links = [
      { path: 'index.html', label: 'Notes', icon: 'file-text' },
      { path: 'explore.html', label: 'Explore', icon: 'compass' },
      { path: 'recent.html', label: 'Recent', icon: 'clock' },
    ];
    const spaces = [
      { path: 'gallery.html', label: 'Personal', icon: 'inbox' },
      { path: 'labels.html', label: 'Work', icon: 'users' },
      { path: 'archive.html', label: 'Health', icon: 'activity' },
    ];
    const settings = [
      { path: 'settings.html', label: 'Settings', icon: 'settings' },
      { path: 'account.html', label: 'Profile', icon: 'user' },
    ];

    const generateLi = (items) => items.map(item => `
      <li>
        <a href="${item.path}" class="flex items-center gap-3 px-3 py-2 rounded-full font-medium transition-colors ${currentPath === item.path ? 'bg-indigo-500/10 text-indigo-500' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}">
          <i data-lucide="${item.icon}" size="20"></i>
          <span>${item.label}</span>
        </a>
      </li>
    `).join('');

    document.getElementById('nav-links').innerHTML = generateLi(links);
    document.getElementById('space-links').innerHTML = generateLi(spaces);
    document.getElementById('settings-links').innerHTML = generateLi(settings);

    // Bottom Nav
    const bottomLinks = [
      { path: 'index.html', label: 'Notes', icon: 'file-text' },
      { path: 'explore.html', label: 'Search', icon: 'search' },
      { path: 'index.html?new=true', label: 'New', icon: 'plus-circle', isMain: true },
      { path: 'archive.html', label: 'Archive', icon: 'inbox' },
      { path: 'account.html', label: 'Profile', icon: 'user' },
    ];

    document.getElementById('bottom-nav').innerHTML = bottomLinks.map(item => {
      if (item.isMain) return `
        <li class="relative -top-5">
          <a href="${item.path}" class="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all">
            <i data-lucide="${item.icon}" size="30"></i>
          </a>
        </li>
      `;
      return `
        <li>
          <a href="${item.path}" class="flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors ${currentPath === item.path ? 'text-indigo-600 bg-indigo-500/10' : 'text-slate-500'}">
            <i data-lucide="${item.icon}" size="24"></i>
            <span class="text-[10px] mt-1 font-medium">${item.label}</span>
          </a>
        </li>
      `;
    }).join('');
  },

  applyTheme() {
    const settings = KimStore.getSettings();
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  toast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-3.5 rounded-full shadow-2xl animate-bounce-in';
    toast.innerHTML = `<span class="font-semibold text-sm tracking-wide">${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

window.UI = UI;
