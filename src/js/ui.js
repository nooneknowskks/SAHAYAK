import { AppState, setSelectedScheme } from './store.js';
import { showPage } from './router.js';

export function renderDashboard() {
    const profileName = document.getElementById('profileName');
    const profileId = document.getElementById('profileId');
    const userAvatar = document.getElementById('profileAvatar');
    
    if(AppState.user && profileName) {
        profileName.innerText = AppState.user.name;
        profileId.innerText = `User ID: ${AppState.user.id || 'N/A'}`;
        document.getElementById('userNameDisplay').innerText = `Namaste, ${AppState.user.name.split(' ')[0]}`;
        // Basic Initials avatar
        userAvatar.innerHTML = `<span class="initials">${AppState.user.name.charAt(0).toUpperCase()}</span>`;
    }

    // Render Progress
    renderProgress();

    // Render Notifications
    renderNotifications();
    
    // Render My Applications (from eligible or selected schemes)
    renderApplications();

    // GSAP Stagger animations
    if(window.gsap) {
        gsap.fromTo('.dashboard-card', 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power3.out' });
    }
}

export function renderProgress() {
    const mainProgressBar = document.getElementById('mainProgressBar');
    const mainProgressBarLarge = document.getElementById('mainProgressBarLarge');
    const progressPercentLarge = document.getElementById('progressPercentLarge');
    const progressPercent = document.getElementById('progressPercent');
    
    const p = AppState.progressPercent;
    
    if(mainProgressBar) {
        mainProgressBar.style.width = `${p}%`;
        progressPercent.innerText = `${p}%`;
    }
    
    if(mainProgressBarLarge) {
        mainProgressBarLarge.style.width = `${p}%`;
        progressPercentLarge.innerText = `${p}%`;
        
        // Update Step items classes
        ['profile', 'eligibility', 'documents', 'completed'].forEach((step, idx) => {
            const stepEl = document.getElementById(`step${idx+1}`);
            if(stepEl) {
                if(AppState.progress[step]) {
                    stepEl.classList.add('active');
                } else {
                    stepEl.classList.remove('active');
                }
            }
        });
    }
}

export function renderSchemes(schemeList, targetGridId = 'schemeGrid') {
    const grid = document.getElementById(targetGridId);
    if (!grid) return;
    
    if (schemeList.length === 0) {
        grid.innerHTML = '<p class="text-muted w-full col-span-full text-center py-10">No schemes match your criteria.</p>';
        return;
    }

    grid.innerHTML = schemeList.map((s, i) => `
        <div class="scheme-card" data-scheme-index="${i}">
            <div class="scheme-tag">${s.tag}</div>
            <div class="scheme-info">
                <h4>${s.name}</h4>
                <p>${s.desc}</p>
                <div class="scheme-meta">
                    <span class="scheme-cat"><i data-lucide="${getCategoryIcon(s.category)}"></i> ${s.category}</span>
                </div>
            </div>
            <div class="scheme-footer">
                <button class="btn-outline scheme-view-btn" data-id="${s.id}">View Details</button>
                <button class="btn-primary full-width scheme-apply-btn" data-id="${s.id}">Apply Now</button>
            </div>
        </div>
    `).join('');

    if(window.lucide) {
        lucide.createIcons();
    }

    // Attach Details binding
    grid.querySelectorAll('.scheme-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.getAttribute('data-id'));
            const sc = schemeList.find(x => x.id === id);
            viewSchemeDetails(sc);
        });
    });

    // Attach Apply binding
    grid.querySelectorAll('.scheme-apply-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.getAttribute('data-id'));
            const sc = schemeList.find(x => x.id === id);
            viewSchemeDetails(sc); // They can upload and apply there
        });
    });

    if(window.gsap) {
        gsap.fromTo(grid.children, 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: 'back.out(1.2)' });
    }
}

function getCategoryIcon(name) {
    const cat = AppState.categories.find(c => c.name === name);
    return cat ? cat.icon : 'star';
}

export function viewSchemeDetails(scheme) {
    setSelectedScheme(scheme);
    const modalBody = document.getElementById('modalBody');
    if(!modalBody) return;

    modalBody.innerHTML = `
        <div class="detail-header">
            <div class="detail-icon"><i data-lucide="landmark"></i></div>
            <div>
                <h3>${scheme.name}</h3>
                <span class="scheme-tag">${scheme.category}</span>
            </div>
        </div>
        <div class="detail-section">
            <h5><i data-lucide="info"></i> Overview</h5>
            <p>${scheme.desc}</p>
        </div>
        <div class="detail-section">
            <h5><i data-lucide="gift"></i> Key Benefits</h5>
            <p>${scheme.benefits}</p>
        </div>
        <div class="detail-section">
            <h5><i data-lucide="check-square"></i> Eligibility Criteria</h5>
            <ul class="checklist">
                <li><i data-lucide="check-circle" class="check"></i> Age: ${scheme.eligibility.age[0]} - ${scheme.eligibility.age[1]} years</li>
                <li><i data-lucide="check-circle" class="check"></i> Occupation: ${scheme.eligibility.occupation.join(', ')}</li>
                <li><i data-lucide="check-circle" class="check"></i> State: ${scheme.eligibility.state === 'any' ? 'All India' : scheme.eligibility.state}</li>
            </ul>
        </div>
        <div class="detail-section">
            <h5><i data-lucide="file-text"></i> Required Documents</h5>
            <div class="checklist-grid">
                ${scheme.documents.map(doc => `
                    <div class="status-item">
                        <div class="status-info">
                            <i data-lucide="file"></i>
                            <span>${doc}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="detail-section">
            <h5><i data-lucide="upload-cloud"></i> Document Upload</h5>
            <div class="upload-area" id="dropZone">
                <i data-lucide="upload-cloud"></i>
                <p>Drag & drop or click to upload Aadhaar/Income Proof</p>
                <input type="file" id="fileInput" class="hidden" accept="image/*,application/pdf">
            </div>
            <div id="uploadPreview" class="hidden"></div>
        </div>
        <button id="finalSubmitBtn" class="btn-primary full-width">Submit Application</button>
    `;

    document.getElementById('schemeModal').classList.remove('hidden');
    
    if(window.lucide) {
        lucide.createIcons();
    }
    
    // Bind document upload to Store
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('uploadPreview');

    if(dropZone && fileInput) {
        dropZone.onclick = () => fileInput.click();
        fileInput.onchange = (e) => {
            if(e.target.files.length > 0) {
                const file = e.target.files[0];
                import('./store.js').then(({ saveDocuments }) => {
                    saveDocuments({ name: file.name, type: file.type, schemeId: scheme.id });
                    
                    preview.innerHTML = `
                        <div class="upload-preview">
                            <i data-lucide="check-circle" style="color: #10b981;"></i>
                            <span>${file.name} Uploaded Successfully</span>
                        </div>
                    `;
                    preview.classList.remove('hidden');
                    if(window.lucide) lucide.createIcons();
                    
                    showToast("Document Verified", "success");
                });
            }
        }
    }

    const finalSubmitBtn = document.getElementById('finalSubmitBtn');
    finalSubmitBtn.onclick = () => {
        import('./progress.js').then(({ completeApplication }) => {
            completeApplication();
            document.getElementById('schemeModal').classList.add('hidden');
            showToast(`Application for ${scheme.name} submitted successfully!`);
            setTimeout(() => { showPage('userDashboard') }, 1000);
        });
    }

    if(window.gsap) {
        gsap.fromTo('.detail-section', { opacity: 0, x: -10 }, { opacity: 1, x: 0, stagger: 0.1, duration: 0.4 });
    }
}

export function renderNotifications() {
    const list = document.getElementById('notifList');
    if(!list) return;

    list.innerHTML = AppState.notifications.map(n => `
        <div class="notif-item ${n.unread ? 'unread' : ''}">
            <div class="notif-icon ${n.type}"><i data-lucide="info"></i></div>
            <div class="notif-content">
                <p>${n.text}</p>
                <span>${n.time}</span>
            </div>
        </div>
    `).join('');
    
    const badge = document.getElementById('notifBadge');
    if(badge) {
        const unreadCount = AppState.notifications.filter(x => x.unread).length;
        badge.innerText = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    if(window.lucide) lucide.createIcons();
}

function renderApplications() {
    const list = document.getElementById('applicationStatusList');
    if(!list) return;

    if(!AppState.user) {
        list.innerHTML = `<p class="text-muted p-4">Please login to view active applications.</p>`;
        return;
    }

    const hasCompleted = AppState.progress.completed;
    const activeApp = AppState.selectedScheme;

    if(!activeApp && !hasCompleted) {
        list.innerHTML = `<button class="btn-outline w-full" onclick="window.showPage('exploreMode')">Find Schemes to Apply</button>`;
        return;
    }

    list.innerHTML = `
        <div class="app-status-card">
            <div class="app-info">
                <h5>${activeApp ? activeApp.name : 'Unknown Application'}</h5>
                <span class="app-stage">${hasCompleted ? 'Under Review' : 'Draft / In Progress'}</span>
            </div>
            <div class="mini-progress-bar">
                <div class="mini-progress-fill" style="width: ${AppState.progressPercent}%"></div>
            </div>
        </div>
    `;
}

export function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-fade`;
    toast.innerHTML = `<i data-lucide="${type === 'success' ? 'check-circle' : 'info'}"></i> <span>${message}</span>`;
    document.body.appendChild(toast);
    
    if(window.lucide) lucide.createIcons();
    
    if(window.gsap) {
        gsap.fromTo(toast, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.3 });
    }
    
    setTimeout(() => {
        if(window.gsap) {
            gsap.to(toast, { opacity: 0, y: 50, duration: 0.3, onComplete: () => toast.remove() });
        } else {
            toast.remove();
        }
    }, 4000);
}

export function showLoading(text = "Processing...") {
    const overlay = document.getElementById('loadingOverlay');
    const loadText = document.getElementById('loadingText');
    if(overlay) {
        loadText.innerText = text;
        overlay.classList.remove('hidden');
    }
}

export function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if(overlay) {
        overlay.classList.add('hidden');
    }
}
