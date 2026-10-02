import { AppState } from './store.js';
import { renderDashboard } from './ui.js';

export function initRouter() {
    window.showPage = showPage;
    
    // Default page or check hash
    const hash = window.location.hash.replace('#', '') || 'heroSection';
    showPage(hash);
}

export function showPage(pageId) {
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(sec => {
        sec.classList.remove('active');
        sec.style.display = 'none'; // Cleanup layout overlapping
    });
    
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
        target.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // GSAP Animation entry
        if(window.gsap) {
            gsap.fromTo(target, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
        }
    } else {
        // Fallback
        const hero = document.getElementById('heroSection');
        if (hero) hero.style.display = 'block';
    }

    // Update nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick')?.includes(pageId)) {
            link.classList.add('active');
        }
    });

    // Update sidebar active state
    const sidebarItems = document.querySelectorAll('.nav-item');
    let hasSidebarActive = false;
    sidebarItems.forEach(item => {
        item.classList.remove('active');
        const targetAttr = item.getAttribute('data-target');
        if (targetAttr === 'dashboard' && pageId === 'userDashboard') { item.classList.add('active'); hasSidebarActive = true; }
        if (targetAttr === 'eligibility' && pageId === 'eligibilitySection') { item.classList.add('active'); hasSidebarActive = true; }
        if (targetAttr === 'schemes' && pageId === 'exploreMode') { item.classList.add('active'); hasSidebarActive = true; }
        if (targetAttr === 'documents' && pageId === 'documentsPage') { item.classList.add('active'); hasSidebarActive = true; }
        if (targetAttr === 'settings' && pageId === 'settingsPage') { item.classList.add('active'); hasSidebarActive = true; }
    });

    // Toggle Sidebar wrapper visibility for better layout
    const sidebar = document.getElementById('dashboardSidebar');
    if (sidebar) {
        if (hasSidebarActive && AppState.user) {
            sidebar.classList.remove('hidden');
        } else {
            sidebar.classList.add('hidden');
        }
    }

    // Special case triggers
    if (pageId === 'userDashboard') {
        renderDashboard();
    }
    
    window.location.hash = pageId;
}
