// LocalStorage Data Management
const STORE_KEYS = {
  NOTES: 'kim_notes',
  SETTINGS: 'kim_settings',
  PROFILE: 'kim_profile'
};

const DEFAULT_NOTES = [
  { id: 1, title: 'Grocery List', content: '- Milk\n- Bread\n- Eggs\n- Avocados', color: 'bg-primary/10 border-primary/20 text-on-surface', textColor: 'text-primary', date: '2 hours ago', type: 'list', category: 'Personal' },
  { id: 2, title: 'Project Ideas', content: '1. AI powered note taking app\n2. Real-time collaboration\n3. Markdown support out of the box.', color: 'bg-tertiary/10 border-tertiary/20 text-on-surface', textColor: 'text-tertiary', date: 'Yesterday', type: 'text', category: 'Work' }
];

const DEFAULT_SETTINGS = {
  theme: 'dark',
  fontSize: 'medium',
  view: 'grid',
  autoSave: true,
  markdown: true
};

const DEFAULT_PROFILE = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  bio: 'Keep in Mind enthusiast and daily organizer.',
  avatar: null
};

const KimStore = {
  init() {
    if (!localStorage.getItem(STORE_KEYS.NOTES)) {
      localStorage.setItem(STORE_KEYS.NOTES, JSON.stringify(DEFAULT_NOTES));
    }
    if (!localStorage.getItem(STORE_KEYS.SETTINGS)) {
      localStorage.setItem(STORE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORE_KEYS.PROFILE)) {
      localStorage.setItem(STORE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
    }
  },

  getNotes() {
    return JSON.parse(localStorage.getItem(STORE_KEYS.NOTES));
  },

  saveNote(note) {
    const notes = this.getNotes();
    if (note.id) {
      const idx = notes.findIndex(n => n.id === note.id);
      if (idx !== -1) notes[idx] = { ...notes[idx], ...note };
    } else {
      note.id = Date.now();
      note.date = 'Just now';
      notes.unshift(note);
    }
    localStorage.setItem(STORE_KEYS.NOTES, JSON.stringify(notes));
    return notes;
  },

  deleteNote(id) {
    const notes = this.getNotes().filter(n => n.id !== id);
    localStorage.setItem(STORE_KEYS.NOTES, JSON.stringify(notes));
    return notes;
  },

  getSettings() {
    return JSON.parse(localStorage.getItem(STORE_KEYS.SETTINGS));
  },

  saveSettings(settings) {
    const current = this.getSettings();
    localStorage.setItem(STORE_KEYS.SETTINGS, JSON.stringify({ ...current, ...settings }));
  },

  getProfile() {
    return JSON.parse(localStorage.getItem(STORE_KEYS.PROFILE));
  },

  saveProfile(profile) {
    localStorage.setItem(STORE_KEYS.PROFILE, JSON.stringify(profile));
  }
};

KimStore.init();
window.KimStore = KimStore;
