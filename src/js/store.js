export const AppState = {
  user: JSON.parse(localStorage.getItem('sahayak_user')) || null,
  schemes: [],
  categories: [],
  selectedScheme: null,
  progress: JSON.parse(localStorage.getItem('sahayak_progress')) || {
    profile: false,
    eligibility: false,
    documents: false,
    application: false,
    completed: false
  },
  progressPercent: 0,
  language: localStorage.getItem('sahayak_lang') || 'en',
  documents: JSON.parse(localStorage.getItem('sahayak_documents')) || [],
  notifications: JSON.parse(localStorage.getItem('sahayak_notifications')) || [
    { id: 1, text: "Welcome to Sahayak AI!", time: "Just now", type: "success", unread: true }
  ],
  eligibleSchemes: [],
  recentActivity: JSON.parse(localStorage.getItem('sahayak_activity')) || []
};

// Listeners for Reactivity
const listeners = [];

export function subscribe(listener) {
  listeners.push(listener);
}

export function notifyListeners() {
  for (const listener of listeners) {
    listener(AppState);
  }
}

// Actions
export function setUser(user) {
  AppState.user = user;
  localStorage.setItem('sahayak_user', JSON.stringify(user));
  updateProgressStep('profile', true);
  notifyListeners();
}

export function updateProgressStep(step, value) {
  AppState.progress[step] = value;
  localStorage.setItem('sahayak_progress', JSON.stringify(AppState.progress));
  notifyListeners();
}

export function setLanguage(lang) {
  AppState.language = lang;
  localStorage.setItem('sahayak_lang', lang);
  notifyListeners();
}

export function saveDocuments(doc) {
  AppState.documents.push(doc);
  localStorage.setItem('sahayak_documents', JSON.stringify(AppState.documents));
  updateProgressStep('documents', true);
  
  AppState.recentActivity.unshift({
    id: Date.now(),
    action: `Uploaded document: ${doc.name}`,
    time: "Just now"
  });
  localStorage.setItem('sahayak_activity', JSON.stringify(AppState.recentActivity));
  
  notifyListeners();
}

export function setSchemes(data) {
  AppState.schemes = data.schemes;
  AppState.categories = data.categories;
  notifyListeners();
}

export function setSelectedScheme(scheme) {
  AppState.selectedScheme = scheme;
  notifyListeners();
}

export function setEligibleSchemes(schemes) {
  AppState.eligibleSchemes = schemes;
  if(schemes.length > 0) {
      updateProgressStep('eligibility', true);
  }
  notifyListeners();
}

export function addNotification(text, type='info') {
    AppState.notifications.unshift({
        id: Date.now(),
        text,
        type,
        time: "Just now",
        unread: true
    });
    localStorage.setItem('sahayak_notifications', JSON.stringify(AppState.notifications));
    notifyListeners();
}
