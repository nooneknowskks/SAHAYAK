import { t, setLanguage, subscribe, initI18nFromStorage, getLocale } from "./i18n-bridge.js";

const API_BASE = "http://localhost:5000";

/** Single source of truth for progress bar width (sidebar + dashboard card). */
function computeTotalProgress() {
    if (userProgress.completed) return 100;
    if (userProgress.application) return 90;
    if (userProgress.documents) return 75;
    if (userProgress.eligibility) return 50;
    if (userProgress.profile || currentUser) return 25;
    return 0;
}

function progressStatusKey() {
    if (userProgress.completed) return "progress_status_completed";
    if (userProgress.application) return "progress_status_application";
    if (userProgress.documents) return "progress_status_documents";
    if (userProgress.eligibility) return "progress_status_eligibility";
    if (userProgress.profile || currentUser) return "progress_status_profile";
    return "progress_status_start";
}

function displayNameForUser(user) {
    if (!user || !user.name || !String(user.name).trim()) return t("profile_fallback");
    return String(user.name).trim();
}

function initialsForDisplayName(displayName) {
    const fb = t("profile_fallback");
    if (displayName === fb) return "VC";
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// --- Dynamic Data State ---
let schemes = [];
let loadedSchemesPage = 1;
let notifications = JSON.parse(localStorage.getItem('sahayak_notifications')) || [
    { id: 1, text: "Welcome to Sahayak AI. Explore schemes now!", time: "Just now", type: "info", unread: true }
];
let recentActivity = JSON.parse(localStorage.getItem('sahayak_activity')) || [];

// --- User State ---
let currentUser = JSON.parse(localStorage.getItem('sahayak_user')) || null;
const tempUserContext = { ...currentUser };
let userProgress = JSON.parse(localStorage.getItem('sahayak_progress')) || {
    profile: !!currentUser, eligibility: false, documents: false, application: false, completed: false
};
let currentSchemeContext = null;

const categories = [
    { id: 'all', name: 'All Schemes', icon: 'layers' },
    { id: 'edu', name: 'Student', icon: 'graduation-cap' },
    { id: 'agri', name: 'Farmer', icon: 'sprout' },
    { id: 'biz', name: 'Business', icon: 'briefcase' },
    { id: 'women', name: 'Women', icon: 'user' },
    { id: 'health', name: 'Health', icon: 'heart-pulse' }
];

// --- DOM Elements ---
const elements = {
    loginBtn: document.getElementById('loginBtn'), registerBtn: document.getElementById('registerBtn'), logoutBtn: document.getElementById('logoutBtn'),
    authButtons: document.getElementById('authButtons'), userProfile: document.getElementById('userProfile'), userNameDisplay: document.getElementById('userNameDisplay'),
    loginModal: document.getElementById('loginModal'), registerModal: document.getElementById('registerModal'), schemeModal: document.getElementById('schemeModal'),
    closeModals: document.querySelectorAll('.close-modal'), categoryGrid: document.getElementById('categoryGrid'), schemeGrid: document.getElementById('schemeGrid'),
    schemeSearch: document.getElementById('schemeSearch'), voiceBtn: document.getElementById('voiceBtn'), chatAssistant: document.getElementById('chatAssistant'),
    toggleChat: document.getElementById('toggleChat'), chatInput: document.getElementById('chatInput'), sendChat: document.getElementById('sendChat'),
    chatBody: document.getElementById('chatBody'), eligibilityForm: document.getElementById('eligibilityForm'), eligibilitySection: document.getElementById('eligibilitySection'),
    dashboardSidebar: document.getElementById('dashboardSidebar'), userDashboard: document.getElementById('userDashboard'), exploreMode: document.getElementById('exploreMode'),
    navItems: document.querySelectorAll('.nav-item'), mainProgressBar: document.getElementById('mainProgressBar'), mainProgressBarLarge: document.getElementById('mainProgressBarLarge'),
    progressPercent: document.getElementById('progressPercent'),
    progressPercentLarge: document.getElementById('progressPercentLarge'), progressStatus: document.getElementById('progressStatus'), notifList: document.getElementById('notifList'),
    applicationStatusList: document.getElementById('applicationStatusList'), matchingSchemeGrid: document.getElementById('matchingSchemeGrid'), eligibilityResults: document.getElementById('eligibilityResults'),
    notifBadge: document.getElementById('notifBadge'), notifDropdown: document.getElementById('notifDropdown'), notifDropdownList: document.getElementById('notifDropdownList'),
    recentActivityList: document.getElementById('recentActivityList')
};

// --- Routing & UI Helpers ---
window.showPage = function(pageId) {
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(sec => sec.classList.remove('active'));
    
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick')?.includes(pageId)) link.classList.add('active');
    });
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        const tAttr = item.getAttribute('data-target');
        if (tAttr === 'dashboard' && pageId === 'userDashboard') item.classList.add('active');
        if (tAttr === 'eligibility' && pageId === 'eligibilitySection') item.classList.add('active');
        if (tAttr === 'schemes' && pageId === 'exploreMode') item.classList.add('active');
        if (tAttr === 'documents' && pageId === 'documentsPage') item.classList.add('active');
        if (tAttr === 'settings' && pageId === 'settingsPage') item.classList.add('active');
    });

    if (pageId === 'userDashboard') renderDashboard();
};

function showLoading(text = "Processing...") {
    const overlay = document.getElementById('loadingOverlay');
    const loadText = document.getElementById('loadingText');
    if (overlay) { loadText.innerText = text; overlay.classList.remove('hidden'); }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('hidden');
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast animate-fade`;
    toast.innerHTML = `<i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i> <span>${message}</span>`;
    document.body.appendChild(toast);
    if(window.lucide) lucide.createIcons();
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 3000);
}

// --- API Calls ---

async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                ...(options.body instanceof FormData ? {} : {'Content-Type': 'application/json'}),
                ...options.headers
            }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Server error');
        return data;
    } catch (error) {
        console.error("API Error:", error);
        showToast(error.message || "Could not connect to server", "error");
        throw error;
    }
}

async function loadFeaturedSchemes() {
    if (cachedSchemes) {
        renderSchemes(cachedSchemes);
        return;
    }
    showLoading("Loading Schemes...");
    try {
        const data = await apiCall('/api/schemes/featured');
        cachedSchemes = data;
        renderSchemes(cachedSchemes);
    } catch (e) {
        console.log("Failed to load featured schemes");
    } finally {
        hideLoading();
    }
}

async function handleSearch() {
    const query = elements.schemeSearch.value.trim();
    if (!query) {
        loadFeaturedSchemes();
        return;
    }
    
    // Check cache first
    if (cachedSchemes && !query) {
        renderSchemes(cachedSchemes);
        return;
    }

    try {
        const data = await apiCall(`/api/search?q=${encodeURIComponent(query)}`);
        renderSchemes(data.data || []);
    } catch (e) {}
}

window.filterByCategory = async function(catName) {
    if (catName === 'All Schemes') return loadFeaturedSchemes();
    try {
        const data = await apiCall(`/api/search?q=${encodeURIComponent(catName)}`);
        renderSchemes(data.data || []);
        showToast(`Showing ${catName} schemes`);
    } catch (e) {}
    window.showPage('exploreMode');
};

window.handleEligibility = async function(e) {
    e.preventDefault();
    showLoading("Calculating eligibility...");
    
    const age = document.getElementById('userAge').value;
    const income = document.getElementById('userIncome').value;
    const occupation = document.getElementById('userOccupation').value;
    const state = document.getElementById('userState').value;
    
    // update context for chat and progress
    tempUserContext.age = age;
    tempUserContext.income = income;
    tempUserContext.occupation = occupation;
    tempUserContext.state = state;

    try {
        const data = await apiCall('/api/recommend', {
            method: 'POST',
            body: JSON.stringify({ age, income, occupation, state })
        });
        
        hideLoading();
        elements.eligibilityResults.classList.remove('hidden');
        renderSchemes(data.bestMatches || [], elements.matchingSchemeGrid);
        
        userProgress.eligibility = true;
        updateProgressUI();
        await syncProgress();
        addActivity(`Checked eligibility for ${occupation} in ${state}`);
        showToast(`Found ${data.totalFound || data.bestMatches?.length || 0} matching schemes!`);
        elements.eligibilityResults.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        hideLoading();
    }
};

window.startApplication = async function(id) {
    if (!currentUser) {
        elements.loginModal.classList.remove('hidden');
        return;
    }
    const slug = typeof id === 'string' ? id : `scheme-${id}`;
    showLoading("Loading Details...");
    try {
        const schemeData = await apiCall(`/api/explain/${encodeURIComponent(slug)}`);
        hideLoading();
        showSchemeDetailReal(schemeData);
        userProgress.application = true;
        updateProgressUI();
        await syncProgress();
        addActivity(`Viewed application for ${schemeData.name}`);
    } catch (e) {
        hideLoading();
    }
};

// --- Auth flows ---
window.handleLogin = async function(e) {
    e.preventDefault();
    const id = document.getElementById('loginId').value;
    const pass = document.getElementById('loginPass').value;
    if (!id || !pass) return;

    showLoading("Authenticating...");
    try {
        const data = await apiCall('/api/login', {
            method: 'POST', body: JSON.stringify({ email: id, password: pass })
        });
        hideLoading();
        currentUser = data.user;
        localStorage.setItem('sahayak_user', JSON.stringify(currentUser));
        localStorage.setItem('sahayak_token', data.token);
        elements.loginModal.classList.add('hidden');
        
        await fetchProgress(); // get existing
        userProgress.profile = true;
        updateProgressUI();
        
        checkAuth();
        showToast("Welcome back!");
        addActivity("Logged in");
        renderDashboard();
    } catch(err) { hideLoading(); }
};

window.handleRegister = async function(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const id = document.getElementById('regId').value;
    const pass = document.getElementById('regPass').value;
    const cpass = document.getElementById('regPassConfirm').value;
    
    if (pass !== cpass) return showToast("Passwords don't match", "error");

    showLoading("Creating account...");
    try {
        const data = await apiCall('/api/register', {
            method: 'POST', body: JSON.stringify({ name, email: id, password: pass })
        });
        hideLoading();
        currentUser = data.user;
        localStorage.setItem('sahayak_user', JSON.stringify(currentUser));
        localStorage.setItem('sahayak_token', data.token);
        elements.registerModal.classList.add('hidden');
        
        userProgress.profile = true;
        updateProgressUI();
        await syncProgress();
        
        checkAuth();
        showToast("Account created successfully!");
        addActivity("Registered new account");
        renderDashboard();
    } catch(err) { hideLoading(); }
};

// --- Progress sync ---
async function fetchProgress() {
    if (!currentUser) return;
    try {
        const prog = await apiCall(`/api/progress/${currentUser.id}`);
        const { applicationProgress: _ap, ...flags } = prog;
        userProgress = { ...userProgress, ...flags };
        updateProgressUI();
    } catch(e) {}
}

async function syncProgress() {
    if (!currentUser) return;
    try {
        await apiCall(`/api/progress/${currentUser.id}`, { method: 'POST', body: JSON.stringify(userProgress) });
    } catch(e) {}
}

async function syncApplicationStatus(schemeName) {
    if (!currentUser) return;
    try {
        await apiCall(`/api/applications/${currentUser.id}`, { 
            method: 'POST', 
            body: JSON.stringify({ schemeId: schemeName, schemeName, status: "Completed" }) 
        });
    } catch(e) {}
}

// --- Global Helpers ---
window.openApplyLink = function(link) {
    if (link && link.startsWith('http')) {
        window.open(link, '_blank');
    } else {
        alert("No official link available. Visit nearest government office or Common Service Centre (CSC).");
    }
};

let cachedSchemes = null;

// --- Chatbot Flow ---
async function handleChat(e) {
    if (e && e.type === 'keypress' && e.key !== 'Enter') return;
    const text = elements.chatInput.value.trim();
    if (!text) return;

    addChatMessage(text, 'user');
    elements.chatInput.value = '';

    const typingId = 'typing-' + Date.now();
    addChatMessage("Thinking...", 'ai', typingId);

    try {
        const response = await apiCall('/api/chat', {
            method: 'POST',
            body: JSON.stringify({ message: text })
        });
        const typingBubble = document.getElementById(typingId);
        if (typingBubble) typingBubble.innerHTML = window.marked ? window.marked.parse(response.reply || "Sorry!") : (response.reply || "Sorry!").replace(/\n/g, "<br>");
        speakText(response.reply);
    } catch (e) {
        const typingBubble = document.getElementById(typingId);
        if (typingBubble) typingBubble.innerText = "I'm having trouble connecting right now.";
    }
}

function addChatMessage(text, sender, id = null) {
    const msg = document.createElement('div');
    msg.className = `chat-message ${sender} animate-fade`;
    if (id) msg.id = id;
    msg.innerText = text;
    elements.chatBody.appendChild(msg);
    elements.chatBody.scrollTop = elements.chatBody.scrollHeight;
}

// --- Document Upload Flow ---
async function uploadDocument(file, previewEl) {
    if (!file) return;
    const formData = new FormData();
    formData.append('document', file);
    formData.append('userId', currentUser ? currentUser.id : "anonymous");

    showLoading("Scanning Document via AI...");
    try {
        const response = await apiCall('/api/upload', {
            method: 'POST',
            body: formData
        });
        hideLoading();
        
        let extractionHTML = '';
        if (response.document && response.document.extractedFields) {
            const fields = response.document.extractedFields;
            extractionHTML = `<div class="mt-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                <strong>Extracted:</strong><br>
                ${Object.entries(fields).map(([k,v]) => `${k}: ${v}`).join('<br>')}
            </div>`;
        }

        previewEl.innerHTML = `
            <div class="upload-preview">
                <div class="status-info">
                    <i data-lucide="file-check" style="color: #10b981;"></i>
                    <div>
                        <p><strong>${file.name}</strong></p>
                        <small>Verified & Scanned successfully</small>
                    </div>
                </div>
                ${extractionHTML}
            </div>
        `;
        previewEl.classList.remove('hidden');
        if(window.lucide) lucide.createIcons();
        
        userProgress.documents = true;
        updateProgressUI();
        await syncProgress();
        addActivity(`Uploaded document: ${file.name}`);
        showToast("Document verified and data extracted!");
    } catch(e) {
        hideLoading();
    }
}

// --- UI Renderers ---

function renderCategories() {
    if (!elements.categoryGrid) return;
    elements.categoryGrid.innerHTML = categories.map(cat => `
        <div class="category-card animate-fade" onclick="window.filterByCategory('${cat.name}')">
            <i data-lucide="${cat.icon}"></i>
            <h4>${cat.name}</h4>
        </div>
    `).join('');
    if(window.lucide) lucide.createIcons();
}

function renderSchemes(schemeList, targetGrid = elements.schemeGrid) {
    if (!targetGrid) return;
    if (schemeList.length === 0) {
        targetGrid.innerHTML = '<p class="text-muted w-full" style="grid-column: 1/-1; text-align: center;">No schemes found matching your criteria.</p>';
        return;
    }
    targetGrid.innerHTML = schemeList.map((s, i) => `
        <div class="scheme-card animate-fade" style="animation-delay: ${(i%10) * 0.05}s">
            <div class="scheme-tag">${s.tag || 'Scheme'}</div>
            <div class="scheme-info">
                <h4>${s.name}</h4>
                <p>${s.details ? s.details.substring(0, 80) + '...' : ''}</p>
                <div class="scheme-meta">
                    <span class="scheme-cat">${s.category || 'Govt'}</span>
                    <button class="btn-text" onclick="window.startApplication('${s.slug || s.id}')">View Details <i data-lucide="chevron-right" style="width:14px; height:14px; display:inline-block; vertical-align:middle;"></i></button>
                </div>
            </div>
            <div class="scheme-footer">
                <button class="btn-primary full-width" onclick="window.openApplyLink('${s.apply_link}')">Apply Now</button>
            </div>
        </div>
    `).join('');
    if(window.lucide) lucide.createIcons();
}

function showSchemeDetailReal(scheme) {
    currentSchemeContext = scheme;
    const modalBody = document.getElementById('modalBody');
    
    const docs = scheme.documents ? scheme.documents.split(',').map(d => `<li>${d.trim()}</li>`).join('') : '<li>Refer to official guidelines</li>';
    const benefits = scheme.benefits ? scheme.benefits.split(',').map(b => `<li>${b.trim()}</li>`).join('') : '<li>Refer to official guidelines</li>';

    modalBody.innerHTML = `
        <div class="detail-header animate-fade">
            <div class="detail-icon"><i data-lucide="landmark"></i></div>
            <div>
                <h3>${scheme.name}</h3>
                <span class="scheme-tag">${scheme.category || 'Welfare'}</span>
            </div>
        </div>
        <div class="detail-section animate-fade">
            <h5><i data-lucide="info"></i> Overview</h5>
            <p>${scheme.details ? scheme.details.substring(0, 150) + (scheme.details.length > 150 ? '...' : '') : 'Information coming soon.'}</p>
        </div>
        <div class="detail-section animate-fade">
            <h5><i data-lucide="gift"></i> Key Benefits</h5>
            <ul>${benefits}</ul>
        </div>
        <div class="detail-section animate-fade">
            <h5><i data-lucide="check-square"></i> Eligibility</h5>
            <p>${scheme.eligibility || 'Check official portal.'}</p>
        </div>
        <div class="detail-section animate-fade">
            <h5><i data-lucide="file-text"></i> Required Documents</h5>
            <ul>${docs}</ul>
        </div>
        <button class="btn-primary full-width animate-fade" onclick="window.openApplyLink('${scheme.apply_link}')">Apply Now</button>
    `;
    
    elements.schemeModal.classList.remove('hidden');
    if(window.lucide) lucide.createIcons();
}

window.completeApplication = async function(schemeName) {
    showLoading("Submitting application...");
    userProgress.completed = true;
    updateProgressUI();
    await syncProgress();
    await syncApplicationStatus(schemeName);
    
    setTimeout(() => {
        hideLoading();
        showToast("Application submitted successfully!");
        elements.schemeModal.classList.add('hidden');
        addActivity(`Completed application for ${schemeName}`);
        
        notifications.unshift({
            id: Date.now(), text: `Your application for ${schemeName} is under review.`, time: "Just now", type: "success", unread: true
        });
        localStorage.setItem('sahayak_notifications', JSON.stringify(notifications));
        renderDashboard();
    }, 1500);
}

function renderDashboard() {
    if (!currentUser) return;

    const dName = displayNameForUser(currentUser);
    const first = dName === t("profile_fallback") ? dName : dName.split(" ")[0];

    if (elements.userNameDisplay) {
        elements.userNameDisplay.innerText = t("greeting_user", { name: first });
    }

    const profileName = document.getElementById('profileName');
    const profileId = document.getElementById('profileId');
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileName) profileName.innerText = dName;
    if (profileId) profileId.innerText = currentUser.email || currentUser.id;
    if (profileAvatar) {
        profileAvatar.innerText = initialsForDisplayName(dName);
        profileAvatar.style.background = 'var(--primary-light)';
        profileAvatar.style.color = 'var(--primary)';
        profileAvatar.style.display = 'flex';
        profileAvatar.style.alignItems = 'center';
        profileAvatar.style.justifyContent = 'center';
        profileAvatar.style.fontSize = '1.5rem';
        profileAvatar.style.fontWeight = '700';
        profileAvatar.style.borderRadius = '50%';
        profileAvatar.style.width = '60px';
        profileAvatar.style.height = '60px';
    }

    fetch(`${API_BASE}/api/applications/${currentUser.id}`).then(r=>r.json()).then(apps => {
        if(apps && apps.length > 0) {
            elements.applicationStatusList.innerHTML = apps.map(s => `
                <div class="status-item-detailed">
                    <div class="status-header">
                        <h5>${s.schemeName}</h5>
                        <span class="status-chip ${s.status === 'Completed' ? 'completed' : 'in-progress'}">${s.status}</span>
                    </div>
                    <div class="mini-progress-bar">
                        <div class="mini-progress-fill" style="width: ${s.progress}%"></div>
                    </div>
                </div>
            `).join('');
        } else {
            elements.applicationStatusList.innerHTML = `
                <div class="applications-empty-state">
                    <div class="applications-empty-icon"><i data-lucide="inbox"></i></div>
                    <h5 class="applications-empty-title">${t("apps_empty_title")}</h5>
                    <p class="applications-empty-hint">${t("apps_empty_hint")}</p>
                    <button type="button" class="btn-primary applications-empty-cta" onclick="window.showPage('exploreMode')">${t("btn_search_schemes")}</button>
                </div>`;
            if (window.lucide) lucide.createIcons();
        }
    }).catch(()=>{
        elements.applicationStatusList.innerHTML = `
            <div class="applications-empty-state">
                <div class="applications-empty-icon"><i data-lucide="inbox"></i></div>
                <h5 class="applications-empty-title">${t("apps_empty_title")}</h5>
                <p class="applications-empty-hint">${t("apps_empty_hint")}</p>
                <button type="button" class="btn-primary applications-empty-cta" onclick="window.showPage('exploreMode')">${t("btn_search_schemes")}</button>
            </div>`;
        if (window.lucide) lucide.createIcons();
    });

    elements.notifList.innerHTML = notifications.map(n => `
        <div class="notif-item ${n.unread ? 'unread' : ''}">
            <div class="status-info">
                <i data-lucide="bell" style="color: var(--primary);"></i>
                <div>
                    <p>${n.text}</p>
                    <small>${n.time}</small>
                </div>
            </div>
        </div>
    `).join('');

    if (elements.recentActivityList) {
        elements.recentActivityList.innerHTML = recentActivity.length ? recentActivity.map(a => `
            <div class="status-item">
                <div class="status-info">
                    <i data-lucide="activity" style="width:16px; color: var(--text-muted);"></i>
                    <span>${a.action}</span>
                </div>
                <small>${a.time}</small>
            </div>
        `).join('') : `<p class="text-muted">${t("activity_empty")}</p>`;
    }
    
    if(window.lucide) lucide.createIcons();
}

function updateProgressUI() {
    const totalProgress = computeTotalProgress();
    const status = t(progressStatusKey());
    let activeSteps = 0;
    if (userProgress.profile || currentUser) activeSteps = 1;
    if (userProgress.eligibility) activeSteps = 2;
    if (userProgress.documents) activeSteps = 3;
    if (userProgress.application || userProgress.completed) activeSteps = 4;

    if (elements.mainProgressBar) elements.mainProgressBar.style.width = `${totalProgress}%`;
    if (elements.progressPercent) elements.progressPercent.innerText = `${totalProgress}%`;
    if (elements.progressStatus) elements.progressStatus.innerText = status;
    if (elements.mainProgressBarLarge) elements.mainProgressBarLarge.style.width = `${totalProgress}%`;
    if (elements.progressPercentLarge) elements.progressPercentLarge.innerText = `${totalProgress}%`;

    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`step${i}`);
        if (step) {
            if (i <= activeSteps) step.classList.add('active');
            else step.classList.remove('active');
        }
    }
    localStorage.setItem('sahayak_progress', JSON.stringify(userProgress));
}

function checkAuth() {
    if (currentUser) {
        elements.authButtons.classList.add('hidden');
        elements.userProfile.classList.remove('hidden');
        elements.dashboardSidebar.classList.remove('hidden');
        window.showPage('userDashboard');
    } else {
        elements.authButtons.classList.remove('hidden');
        elements.userProfile.classList.add('hidden');
        elements.dashboardSidebar.classList.add('hidden');
        window.showPage('heroSection');
    }
}

function addActivity(action) {
    recentActivity.unshift({ id: Date.now(), action, time: "Just now" });
    if (recentActivity.length > 5) recentActivity.pop();
    localStorage.setItem('sahayak_activity', JSON.stringify(recentActivity));
    if (currentUser) renderDashboard();
}

// Speech functionality
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let isListening = false;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
}

function startListening(inputEl, callback) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Mic not supported");

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.start();

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        inputEl.value = text;
        if(callback) callback(text);
    };

    recognition.onerror = () => {
        alert("Mic error");
    };
}

function speakText(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    // remove markdown
    const cleanText = text.replace(/[*#_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const loc = getLocale();
    utterance.lang = loc === 'hi' ? 'hi-IN' : (loc === 'mr' ? 'mr-IN' : 'en-IN');
    window.speechSynthesis.speak(utterance);
}

// Setup Event Listeners
function setupEventListeners() {
    if (elements.loginBtn) elements.loginBtn.onclick = () => elements.loginModal?.classList.remove('hidden');
    if (elements.registerBtn) elements.registerBtn.onclick = () => elements.registerModal?.classList.remove('hidden');
    if (elements.logoutBtn) {
        elements.logoutBtn.onclick = () => {
            currentUser = null;
            localStorage.removeItem('sahayak_user');
            localStorage.removeItem('sahayak_token');
            checkAuth();
            showToast("Logged out safely.");
        };
    }
    elements.closeModals.forEach(btn => btn.onclick = () => {
        elements.loginModal?.classList.add('hidden');
        elements.registerModal?.classList.add('hidden');
        elements.schemeModal?.classList.add('hidden');
    });

    if (elements.schemeSearch) elements.schemeSearch.oninput = handleSearch;
    if (elements.voiceBtn) elements.voiceBtn.onclick = () => {
        startListening(elements.schemeSearch, handleSearch);
    };

    if (elements.toggleChat) elements.toggleChat.onclick = () => elements.chatAssistant?.classList.toggle('minimized');
    if (elements.sendChat) elements.sendChat.onclick = handleChat;
    if (elements.chatInput) elements.chatInput.onkeypress = handleChat;
    const chatVoiceBtn = document.getElementById('chatVoiceBtn');
    if (chatVoiceBtn) chatVoiceBtn.onclick = () => {
        startListening(elements.chatInput, handleChat);
    };

    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.value = getLocale();
        langSelect.addEventListener('change', (e) => {
            const lang = e.target.value;
            setLanguage(lang);
            showToast(t(`toast_lang_${lang}`) || t("toast_lang_en"));
        });
    }

    const notifBtn = document.getElementById('notifBtn');
    if (notifBtn) notifBtn.onclick = (e) => { e.stopPropagation(); elements.notifDropdown?.classList.toggle('hidden'); };
    const markAllReadBtn = elements.notifDropdown?.querySelector('.btn-text');
    if (markAllReadBtn) markAllReadBtn.onclick = (e) => { 
        e.stopPropagation(); notifications.forEach(n => n.unread = false);
        localStorage.setItem('sahayak_notifications', JSON.stringify(notifications));
        renderDashboard(); showToast("All marked as read");
    };
    document.addEventListener('click', (e) => {
        if (elements.notifDropdown && !elements.notifDropdown.contains(e.target) && e.target !== notifBtn) elements.notifDropdown.classList.add('hidden');
    });

    document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.onclick = () => {
            if (elements.chatInput) { elements.chatInput.value = btn.innerText; handleChat(); }
        }
    });

    // Ensure sidebar nav items are wired to pages
    if (elements.navItems && elements.navItems.length) {
        elements.navItems.forEach(item => {
            item.onclick = () => {
                const target = item.getAttribute('data-target');
                switch (target) {
                    case 'dashboard': return window.showPage('userDashboard');
                    case 'eligibility': return window.showPage('eligibilitySection');
                    case 'schemes': return window.showPage('exploreMode');
                    case 'documents': return window.showPage('documentsPage');
                    case 'settings': return window.showPage('settingsPage');
                    default: return;
                }
            };
        });
    }

    const findSchemesBtn = document.getElementById('findSchemesBtn');
    if (findSchemesBtn) findSchemesBtn.onclick = () => window.showPage('eligibilitySection');
    const askAssistantHero = document.getElementById('askAssistantHero');
    if (askAssistantHero) askAssistantHero.onclick = () => { window.showPage('exploreMode'); };
}

async function init() {
    subscribe(() => {
        updateProgressUI();
        if (currentUser) renderDashboard();
    });
    initI18nFromStorage();
    renderCategories();
    setupEventListeners();
    updateProgressUI();
    checkAuth();
    loadFeaturedSchemes();
}

// Start
init();
