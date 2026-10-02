import { setSchemes, addNotification } from './store.js';

export async function fetchSchemesData() {
    try {
        const response = await fetch('/data/schemes.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSchemes(data);
        return data;
    } catch (error) {
        console.error("Failed to load schemes data:", error);
        addNotification("System failed to load the latest schemes data.", 'error');
        return { categories: [], schemes: [] };
    }
}
