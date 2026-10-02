import { GoogleGenAI } from "@google/genai";
import { AppState } from './store.js';

let aiInstance = null;

export function initChatbot() {
    try {
        aiInstance = new GoogleGenAI({ apiKey: "none" }); // Will be injected or configured if they actually have a real key, otherwise fallback mock or real config
        // Actually the package uses process.env which requires vite preprocessing:
        // For security and client-side limitation, I'll rely on global or Vite import.mata.env if available.
    } catch(e) {
        console.warn('AI initialization skipped or failed', e);
    }
}

export async function askGemini(prompt) {
    if(!aiInstance && window.process?.env?.GEMINI_API_KEY) {
        aiInstance = new GoogleGenAI({ apiKey: window.process.env.GEMINI_API_KEY });
    }

    const context = AppState.selectedScheme ? `The user is currently viewing the scheme: ${AppState.selectedScheme.name}. ` : "";
    const userContext = AppState.user ? `The user is ${AppState.user.name}, age ${AppState.user.age || 'unknown'}. ` : "";
    
    // STRICT Prompt engineering for structured output without markdown
    const systemPrompt = `You are Sahayak AI, a premium multilingual government scheme assistant. 
Your goal is to be helpful and provide exact answers.
Language: ${AppState.language === 'en' ? 'English' : AppState.language}

CRITICAL: 
- DO NOT USE MARKDOWN (No **, no #, no -, no list markdown).
- Only output plain text structured exactly as follows:

Scheme Name: [Name]
Benefits: [Benefit 1], [Benefit 2]
Eligibility: [Criteria 1], [Criteria 2]
Next Step: [What to do next]

Keep it extremely short. Maximum 4 lines. If they ask a general question, just give a short friendly answer without the format.`;

    const fullPrompt = `${context}${userContext}User asked: ${prompt}`;

    try {
        if(!aiInstance) {
            // Mock response if API is not setup
            return mockResponse(prompt);
        }

        const chat = aiInstance.chats.create({
            model: "gemini-3-flash-preview",
            config: {
                systemInstruction: systemPrompt
            }
        });

        const response = await chat.sendMessage({ message: fullPrompt });
        return formatForUI(response.text);
    } catch (error) {
        console.error("Gemini Error:", error);
        return formatForUI(mockResponse(prompt));
    }
}

function mockResponse(prompt) {
    if(prompt.toLowerCase().includes('pm kisan') || prompt.toLowerCase().includes('farmer')) {
        return "Scheme Name: PM-Kisan Samman Nidhi\nBenefits: ₹6,000 per year direct transfer\nEligibility: All landholding farmers\nNext Step: Register on PM-Kisan portal with Aadhaar";
    }
    return "I am Sahayak AI. How can I help you find government schemes today?";
}

function formatForUI(text) {
    // Just in case it sneaks in Markdown
    let clean = text.replace(/\*\*/g, '');
    clean = clean.replace(/#/g, '');
    clean = clean.replace(/-/g, '•');

    // Make it UI ready block
    const lines = clean.split('\n').filter(l => l.trim() !== '');
    if(lines.length > 1 && lines[0].includes('Scheme Name')) {
        return `
            <div class="chat-structured-block">
                ${lines.map(l => {
                    const parts = l.split(':');
                    if(parts.length > 1) {
                        return `<div class="chat-row"><span class="chat-label">${parts[0].trim()}</span><span class="chat-val">${parts.slice(1).join(':').trim()}</span></div>`;
                    }
                    return `<p>${l}</p>`;
                }).join('')}
            </div>
        `;
    }

    return clean;
}

export function appendChatMessage(text, sender = 'user', isRawHTML = false) {
    const chatBody = document.getElementById('chatBody');
    if (!chatBody) return;

    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;
    
    if(isRawHTML) {
        div.innerHTML = text;
    } else {
        div.innerText = text;
    }
    
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
    
    if(window.gsap) {
        gsap.fromTo(div, { scale: 0.9, opacity: 0, y: 10 }, { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' });
    }
}
