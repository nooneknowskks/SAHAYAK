import { AppState, updateProgressStep, notifyListeners } from './store.js';

export function calculateProgress() {
    let percentage = 0;
    
    // Profile -> 25%
    if (AppState.progress.profile || AppState.user) {
        percentage += 25;
        updateProgressStep('profile', true);
    }
    
    // Eligibility -> 50%
    if (AppState.progress.eligibility || AppState.eligibleSchemes?.length > 0) {
        percentage += 25;
        updateProgressStep('eligibility', true);
    }
    
    // Documents -> 75%
    if (AppState.progress.documents || AppState.documents?.length > 0) {
        percentage += 25;
        updateProgressStep('documents', true);
    }
    
    // Complete -> 100%
    if (AppState.progress.completed) {
        percentage += 25;
    }
    
    AppState.progressPercent = Math.min(percentage, 100);
    return AppState.progressPercent;
}

export function completeApplication() {
    if(!AppState.user) return;
    updateProgressStep('completed', true);
    calculateProgress();
    notifyListeners();
}
