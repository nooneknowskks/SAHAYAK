const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// --- Internationalization (i18n) ---
const translations = {
    en: {
        nav_home: "Home", nav_schemes: "Schemes", nav_eligibility: "Eligibility", nav_help: "Help", login: "Login", register: "Register",
        side_dashboard: "Dashboard", side_eligibility: "Eligibility", side_find_schemes: "Find Schemes", side_documents: "My Documents", side_settings: "Settings",
        dash_title: "Your Dashboard", dash_subtitle: "Track your applications and notifications", dash_profile: "User Profile", verified_user: "Verified User",
        edit_profile: "Edit Profile", dash_progress: "Application Progress", overall_completion: "Overall Completion", step_profile: "Profile", step_eligibility: "Eligibility",
        step_documents: "Documents", step_apply: "Apply", click_details: "Click for detailed view", help_title: "Help & Support", help_subtitle: "Get assistance with using Sahayak AI and applying for schemes",
        user_guide: "User Guide", user_guide_desc: "Learn how to navigate Sahayak AI and discover schemes effectively.", read_guide: "Read Guide",
        faqs: "FAQs", faqs_desc: "Find answers to common questions about eligibility and applications.", view_faqs: "View FAQs", contact_support: "Contact Support",
        contact_support_desc: "Need more help? Talk to our support team for personalized assistance.", contact_us: "Contact Us",
        detailed_progress_title: "Detailed Application Progress", detailed_progress_subtitle: "A complete breakdown of your journey",
        back_to_dash: "Back to Dashboard", stage_profile: "Profile Completion", stage_profile_desc: "Personal details and identity verification.", status_done: "Done",
        stage_eligibility: "Eligibility Verification", stage_eligibility_desc: "Auto-matching with available government schemes.", status_pending: "Pending",
        stage_documents: "Document Upload", stage_documents_desc: "Uploading required certificates and proofs.", stage_apply: "Final Application",
        stage_apply_desc: "Submission to respective government departments.", status_not_started: "Not Started", docs_title: "My Documents",
        docs_subtitle: "Manage your digital certificates and proofs", upload_doc: "Upload New", add_more_docs: "Add more documents", settings_title: "Settings & Preferences",
        settings_subtitle: "Manage your account and app experience", personal_info: "Personal Information", full_name: "Full Name", email_mobile: "Email / Mobile",
        location: "Location", save_changes: "Save Changes", app_preferences: "App Preferences", pref_notifications: "Notifications",
        pref_notifications_desc: "Receive alerts about new schemes", pref_dark_mode: "Dark Mode", pref_dark_mode_desc: "Switch to dark theme",
        pref_language: "Default Language", pref_language_desc: "Choose your preferred language"
    },
    hi: {
        nav_home: "होम", nav_schemes: "योजनाएं", nav_eligibility: "पात्रता", nav_help: "सहायता", login: "लॉगिन", register: "पंजीकरण",
        side_dashboard: "डैशबोर्ड", side_eligibility: "पात्रता", side_find_schemes: "योजनाएं खोजें", side_documents: "मेरे दस्तावेज़", side_settings: "सेटिंग्स",
        dash_title: "आपका डैशबोर्ड", dash_subtitle: "अपने आवेदनों और सूचनाओं को ट्रैक करें", dash_profile: "उपयोगकर्ता प्रोफ़ाइल", verified_user: "सत्यापित उपयोगकर्ता",
        edit_profile: "प्रोफ़ाइल संपादित करें", dash_progress: "आवेदन की प्रगति", overall_completion: "कुल पूर्णता", step_profile: "प्रोफ़ाइल", step_eligibility: "पात्रता",
        step_documents: "दस्तावेज़", step_apply: "आवेदन करें", click_details: "विस्तृत दृश्य के लिए क्लिक करें", help_title: "सहायता और समर्थन", help_subtitle: "सहायक AI का उपयोग करने और योजनाओं के लिए आवेदन करने में सहायता प्राप्त करें",
        user_guide: "उपयोगकर्ता मार्गदर्शिका", user_guide_desc: "सहायक AI को नेविगेट करने और योजनाओं को प्रभावी ढंग से खोजने का तरीका जानें।", read_guide: "मार्गदर्शिका पढ़ें",
        faqs: "सामान्य प्रश्न", faqs_desc: "पात्रता और आवेदनों के बारे में सामान्य प्रश्नों के उत्तर खोजें।", view_faqs: "प्रश्न देखें", contact_support: "समर्थन से संपर्क करें",
        contact_support_desc: "अधिक सहायता चाहिए? व्यक्तिगत सहायता के लिए हमारी सहायता टीम से बात करें।", contact_us: "संपर्क करें",
        detailed_progress_title: "विस्तृत आवेदन प्रगति", detailed_progress_subtitle: "आपकी यात्रा का पूरा विवरण", back_to_dash: "डैशबोर्ड पर वापस जाएं",
        stage_profile: "प्रोफ़ाइल पूर्णता", stage_profile_desc: "व्यक्तिगत विवरण और पहचान सत्यापन।", status_done: "पूर्ण", stage_eligibility: "पात्रता सत्यापन",
        stage_eligibility_desc: "उपलब्ध सरकारी योजनाओं के साथ ऑटो-मैचिंग।", status_pending: "लंबित", stage_documents: "दस्तावेज़ अपलोड",
        stage_documents_desc: "आवश्यक प्रमाण पत्र और प्रमाण अपलोड करना।", stage_apply: "अंतिम आवेदन", stage_apply_desc: "संबंधित सरकारी विभागों को जमा करना।",
        status_not_started: "शुरू नहीं हुआ", docs_title: "मेरे दस्तावेज़", docs_subtitle: "अपने डिजिटल प्रमाणपत्रों और प्रमाणों को प्रबंधित करें",
        upload_doc: "नया अपलोड करें", add_more_docs: "अधिक दस्तावेज़ जोड़ें", settings_title: "सेटिंग्स और प्राथमिकताएं", settings_subtitle: "अपने खाते और ऐप अनुभव को प्रबंधित करें",
        personal_info: "व्यक्तिगत जानकारी", full_name: "पूरा नाम", email_mobile: "ईमेल / मोबाइल", location: "स्थान", save_changes: "परिवर्तन सहेजें",
        app_preferences: "ऐप प्राथमिकताएं", pref_notifications: "सूचनाएं", pref_notifications_desc: "नई योजनाओं के बारे में अलर्ट प्राप्त करें",
        pref_dark_mode: "डार्क मोड", pref_dark_mode_desc: "डार्क थीम पर स्विच करें", pref_language: "डिफ़ॉल्ट भाषा", pref_language_desc: "अपनी पसंदीदा भाषा चुनें"
    },
    mr: {
        nav_home: "होम", nav_schemes: "योजना", nav_eligibility: "पात्रता", nav_help: "मदत", login: "लॉगिन", register: "नोंदणी",
        side_dashboard: "डॅशबोर्ड", side_eligibility: "पात्रता", side_find_schemes: "योजना शोधा", side_documents: "माझी कागदपत्रे", side_settings: "सेटिंग्स",
        dash_title: "तुमचा डॅशबोर्ड", dash_subtitle: "तुमचे अर्ज आणि सूचनांचा मागोवा घ्या", dash_profile: "वापरकर्ता प्रोफाइल", verified_user: "सत्यापित वापरकर्ता",
        edit_profile: "प्रोफाइल संपादित करा", dash_progress: "अर्जाची प्रगती", overall_completion: "एकूण पूर्णता", step_profile: "प्रोफाइल", step_eligibility: "पात्रता",
        step_documents: "कागदपत्रे", step_apply: "अर्ज करा", click_details: "तपशीलवार दृश्यासाठी क्लिक करा", help_title: "मदत आणि समर्थन", help_subtitle: "सहायक AI वापरण्यासाठी आणि योजनांसाठी अर्ज करण्यासाठी मदत मिळवा",
        user_guide: "वापरकर्ता मार्गदर्शक", user_guide_desc: "सहायक AI कसे वापरावे आणि योजना प्रभावीपणे कशा शोधाव्यात ते शिका।", read_guide: "मार्गदर्शक वाचा",
        faqs: "नेहमी विचारले जाणारे प्रश्न", faqs_desc: "पात्रता आणि अर्जांबद्दल सामान्य प्रश्नांची उत्तरे शोधा।", view_faqs: "प्रश्न पहा", contact_support: "समर्थनाशी संपर्क साधा",
        contact_support_desc: "अधिक मदत हवी आहे? वैयक्तिक मदतीसाठी आमच्या समर्थन कार्यसंघाशी बोला।", contact_us: "संपर्क साधा",
        detailed_progress_title: "तपशीलवार अर्ज प्रगती", detailed_progress_subtitle: "तुमच्या प्रवासाचा संपूर्ण तपशील", back_to_dash: "डॅशबोर्डवर परत जा",
        stage_profile: "प्रोफाइल पूर्णता", stage_profile_desc: "वैयक्तिक तपशील आणि ओळख पडताळणी।", status_done: "पूर्ण", stage_eligibility: "पात्रता पडताळणी",
        stage_eligibility_desc: "उपलब्ध सरकारी योजनांशी ऑटो-मॅचिंग।", status_pending: "प्रलंबित", stage_documents: "कागदपत्रे अपलोड",
        stage_documents_desc: "आवश्यक प्रमाणपत्रे आणि पुरावे अपलोड करणे।", stage_apply: "अंतिम अर्ज", stage_apply_desc: "संबंधित सरकारी विभागांकडे सादर करणे।",
        status_not_started: "सुरू झाले नाही", docs_title: "माझी कागदपत्रे", docs_subtitle: "तुमची डिजिटल प्रमाणपत्रे आणि पुरावे व्यवस्थापित करा",
        upload_doc: "नवीन अपलोड करा", add_more_docs: "अधिक कागदपत्रे जोडा", settings_title: "सेटिंग्स आणि प्राधान्ये", settings_subtitle: "तुमचे खाते आणि ॲप अनुभव व्यवस्थापित करा",
        personal_info: "वैयक्तिक माहिती", full_name: "पूर्ण नाव", email_mobile: "ईमेल / मोबाईल", location: "स्थान", save_changes: "बदल जतन करा",
        app_preferences: "ॲप प्राधान्ये", pref_notifications: "सूचना", pref_notifications_desc: "नवीन योजनांबद्दल अलर्ट मिळवा",
        pref_dark_mode: "डार्क मोड", pref_dark_mode_desc: "डार्क थीमवर स्विच करा", pref_language: "डीफॉल्ट भाषा", pref_language_desc: "तुमची पसंतीची भाषा निवडा"
    }
};

let currentLang = localStorage.getItem('sahayak_lang') || 'en';

function translateUI(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[lang][key];
            } else {
                el.innerText = translations[lang][key];
            }
        }
    });
    document.documentElement.lang = lang;
    updateChatbotGreeting(lang);
}

function updateChatbotGreeting(lang) {
    const greetings = {
        en: "Namaste! I am Sahayak AI. How can I help you discover government schemes today?",
        hi: "नमस्ते! मैं सहायक AI हूँ। आज मैं आपको सरकारी योजनाओं को खोजने में कैसे मदद कर सकता हूँ?",
        mr: "नमस्ते! मी सहायक AI आहे। आज मी तुम्हाला सरकारी योजना शोधण्यात कशी मदत करू शकतो?"
    };
    const chatBody = document.getElementById('chatBody');
    if (chatBody && chatBody.firstElementChild && chatBody.firstElementChild.classList.contains('ai')) {
        chatBody.firstElementChild.innerText = greetings[lang];
    }
}

async function translateTextViaAPI(text, targetLang) {
    if (!text || !targetLang) return null;
    try {
        const response = await fetch(`${API_BASE}/api/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, target: targetLang })
        });
        const data = await response.json();
        if (!response.ok || !data.translated) throw new Error(data.error || 'Translation failed');
        return data.translated;
    } catch (error) {
        console.error('Translate API error:', error);
        showToast('Translation API failed', 'error');
        return null;
    }
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
    showLoading("Loading Schemes...");
    try {
        const data = await apiCall('/api/schemes/featured');
        schemes = data;
        renderSchemes(schemes);
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
        userProgress = { ...userProgress, ...prog };
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
            body: JSON.stringify({ message: text, userProfile: currentUser || tempUserContext, language: currentLang })
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
            <div class="scheme-tag">${s.tag || s.level || 'Scheme'}</div>
            <div class="scheme-info">
                <h4>${s.name}</h4>
                <p>${s.desc}</p>
                <div class="scheme-meta">
                    <span class="scheme-cat">${s.category || 'Govt'}</span>
                    <button class="btn-text" onclick="window.startApplication('${s.slug || s.id}')">View Details <i data-lucide="chevron-right" style="width:14px; height:14px; display:inline-block; vertical-align:middle;"></i></button>
                </div>
            </div>
            <div class="scheme-footer">
                <button class="btn-primary full-width" onclick="window.startApplication('${s.slug || s.id}')">Apply Now</button>
            </div>
        </div>
    `).join('');
    if(window.lucide) lucide.createIcons();
}

function showSchemeDetailReal(scheme) {
    currentSchemeContext = scheme;
    const modalBody = document.getElementById('modalBody');
    
    // docs formatting
    let reqDocs = scheme.documents || ["Aadhaar", "Bank passbook"];
    if (typeof reqDocs === 'string') {
        reqDocs = reqDocs.split(',').map(s=>s.trim()).filter(s=>s);
    }
    if(!Array.isArray(reqDocs)) reqDocs = ["Aadhaar Card"];

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
            <p>${scheme.fullDetails || scheme.desc}</p>
        </div>
        <div class="detail-section animate-fade">
            <h5><i data-lucide="gift"></i> Key Benefits</h5>
            <p>${scheme.benefits}</p>
        </div>
        <div class="detail-section animate-fade">
            <h5><i data-lucide="check-square"></i> Eligibility Criteria</h5>
            <p>${scheme.eligibility}</p>
        </div>
        <div class="detail-section animate-fade">
            <h5><i data-lucide="file-text"></i> Required Documents</h5>
            <div class="checklist-grid">
                ${reqDocs.map(doc => `
                    <div class="status-item">
                        <div class="status-info">
                            <i data-lucide="file"></i>
                            <span>${doc}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="detail-section animate-fade">
            <h5><i data-lucide="upload-cloud"></i> Document Upload</h5>
            <div class="upload-area" id="dropZone">
                <i data-lucide="upload-cloud"></i>
                <p>Drag & drop or click to upload required files</p>
                <input type="file" id="fileInput" class="hidden" accept="image/*,application/pdf">
            </div>
            <div id="uploadPreview" class="hidden"></div>
        </div>
        <button class="btn-primary full-width animate-fade" onclick="window.completeApplication('${scheme.name}')">Final Submit</button>
    `;
    
    elements.schemeModal.classList.remove('hidden');
    if(window.lucide) lucide.createIcons();
    
    // Bind upload
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('uploadPreview');
    if (dropZone && fileInput) {
        dropZone.onclick = () => fileInput.click();
        fileInput.onchange = (e) => {
            if (e.target.files.length > 0) uploadDocument(e.target.files[0], preview);
        };
    }
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

    if (elements.userNameDisplay) elements.userNameDisplay.innerText = `Namaste, ${currentUser.name.split(' ')[0]}`;
    
    const profileName = document.getElementById('profileName');
    const profileId = document.getElementById('profileId');
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileName) profileName.innerText = currentUser.name;
    if (profileId) profileId.innerText = currentUser.email || currentUser.id;
    if (profileAvatar) {
        profileAvatar.innerText = currentUser.name.charAt(0).toUpperCase();
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

    // load actual applications if possible
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
            elements.applicationStatusList.innerHTML = '<p class="text-muted">No applications started yet.</p>';
        }
    }).catch(e=>{
        elements.applicationStatusList.innerHTML = '<p class="text-muted">No applications started yet.</p>';
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
        `).join('') : '<p class="text-muted">No recent activity.</p>';
    }
    
    if(window.lucide) lucide.createIcons();
}

function updateProgressUI() {
    let progress = 0;
    let status = "Start your journey.";
    let activeSteps = 0;
    
    if (userProgress.profile || currentUser) { progress = 25; status = "Profile created."; activeSteps = 1; }
    if (userProgress.eligibility) { progress = 50; status = "Eligibility checked."; activeSteps = 2; }
    if (userProgress.documents) { progress = 75; status = "Documents verified."; activeSteps = 3; }
    if (userProgress.application) { progress = 90; status = "Application in review."; activeSteps = 4; }
    if (userProgress.completed) { progress = 100; status = "All applications completed!"; activeSteps = 4; }

    if (elements.mainProgressBar) { elements.mainProgressBar.style.width = `${progress}%`; elements.progressStatus.innerText = status; }
    if (elements.mainProgressBarLarge) elements.mainProgressBarLarge.style.width = `${progress}%`;
    if (elements.progressPercentLarge) elements.progressPercentLarge.innerText = `${progress}%`;

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

function startListening(onResult, btnElement) {
    if (!recognition) return showToast("Speech recognition not supported in this browser.", 'error');
    if (isListening) { try { recognition.stop(); } catch(e){} return; }
    try {
        recognition.start();
        isListening = true;
        btnElement.classList.add('listening');
        showToast("Listening... Speak now.");
    } catch (e) {}
    recognition.onresult = (e) => {
        onResult(e.results[0][0].transcript);
        isListening = false;
        btnElement.classList.remove('listening');
    };
    recognition.onerror = () => { isListening=false; btnElement.classList.remove('listening'); };
    recognition.onend = () => { isListening=false; btnElement.classList.remove('listening'); };
}

function speakText(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    // remove markdown
    const cleanText = text.replace(/[*#_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = currentLang === 'hi' ? 'hi-IN' : (currentLang === 'mr' ? 'mr-IN' : 'en-IN');
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
    if (elements.voiceBtn) elements.voiceBtn.onclick = () => startListening((t) => {
        elements.schemeSearch.value = t; handleSearch();
    }, elements.voiceBtn);

    if (elements.toggleChat) elements.toggleChat.onclick = () => elements.chatAssistant?.classList.toggle('minimized');
    if (elements.sendChat) elements.sendChat.onclick = handleChat;
    if (elements.chatInput) elements.chatInput.onkeypress = handleChat;
    const chatVoiceBtn = document.getElementById('chatVoiceBtn');
    if (chatVoiceBtn) chatVoiceBtn.onclick = () => startListening((t) => {
        elements.chatInput.value = t; handleChat();
    }, chatVoiceBtn);

    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.value = currentLang;
        langSelect.addEventListener('change', async (e) => {
            currentLang = e.target.value;
            localStorage.setItem('sahayak_lang', currentLang);
            translateUI(currentLang);

            // optional adaptive chat greeting via AI translate
            const greetingText = "Hi! I am Sahayak AI assistant.";
            const translatedGreeting = await translateTextViaAPI(greetingText, currentLang);
            if (translatedGreeting && elements.chatBody && elements.chatBody.firstElementChild && elements.chatBody.firstElementChild.classList.contains('ai')) {
                elements.chatBody.firstElementChild.innerText = translatedGreeting;
            }

            showToast(currentLang === 'en' ? "Language changed to English" : (currentLang === 'hi' ? "भाषा बदलकर हिंदी कर दी गई है" : "भाषा बदलून मराठी करण्यात आली आहे"));
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
    renderCategories();
    translateUI(currentLang);
    setupEventListeners();
    updateProgressUI();
    checkAuth();
    loadFeaturedSchemes(); // Boot up real data 
}

// Start
init();
