/**
 * JIA - Modern AI Chat Interface
 * Advanced UI/UX with latest web technologies
 */

class JIAModern {
    constructor() {
        this.socket = null;
        this.sessionId = this.generateSessionId();
        this.isListening = false;
        this.recognition = null;
        this.synthesis = null;
        this.voiceEnabled = true;
        this.settings = null;
        this.currentTheme = this.detectSystemTheme();
        this.isTyping = false;
        this.messages = [];
        this.toasts = [];
        
        // Modern UI state
        this.ui = {
            loading: true,
            welcomeVisible: true,
            settingsOpen: false,
            voiceModalOpen: false,
            darkMode: this.currentTheme === 'dark'
        };
        
        this.initialize();
    }
    
    async initialize() {
        console.log('🚀 Initializing JIA Modern Interface...');
        
        try {
            // Initialize modern UI systems
            this.initializeTheme();
            this.initializeParticles();
            this.initializeElements();
            this.initializeSocket();
            this.initializeVoiceFeatures();
            this.initializeModernFeatures();
            this.bindEvents();
            this.loadSettings();
            this.configureMarkdown();
            
            // Show loading screen then transition to app
            await this.handleLoadingSequence();
            
            console.log('✅ JIA Modern Interface initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize JIA:', error);
            this.showToast('Failed to initialize application', 'error');
        }
    }
    
    // Theme Management
    initializeTheme() {
        document.documentElement.setAttribute('data-theme', this.ui.darkMode ? 'dark' : 'light');
        this.updateThemeToggle();
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                if (!localStorage.getItem('jia-theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }
    
    setTheme(theme) {
        this.ui.darkMode = theme === 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('jia-theme', theme);
        this.updateThemeToggle();
        
        // Trigger particle theme update if particles are initialized
        if (this.particles) {
            this.updateParticleTheme(theme);
        }
        
        this.showToast(`Switched to ${theme} theme`, 'success');
    }
    
    updateThemeToggle() {
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.classList.toggle('dark', this.ui.darkMode);
        }
    }
    
    detectSystemTheme() {
        if (localStorage.getItem('jia-theme')) {
            return localStorage.getItem('jia-theme');
        }
        
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        
        return 'light';
    }
    
    // Particle Background
    initializeParticles() {
        if (typeof particlesJS === 'undefined') {
            console.warn('⚠️ Particles.js not loaded');
            return;
        }
        
        const particleConfig = {
            particles: {
                number: { value: 50, density: { enable: true, value_area: 800 } },
                color: { value: this.ui.darkMode ? '#3b82f6' : '#2563eb' },
                shape: { type: 'circle' },
                opacity: { value: 0.3, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1 } },
                size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 0.1 } },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: this.ui.darkMode ? '#60a5fa' : '#3b82f6',
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'repulse' },
                    onclick: { enable: true, mode: 'push' },
                    resize: true
                }
            },
            retina_detect: true
        };
        
        particlesJS('particle-background', particleConfig);
    }
    
    updateParticleTheme(theme) {
        // Update particle colors based on theme
        if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
            const pJS = window.pJSDom[0].pJS;
            pJS.particles.color.value = theme === 'dark' ? '#60a5fa' : '#3b82f6';
            pJS.particles.line_linked.color = theme === 'dark' ? '#60a5fa' : '#3b82f6';
            pJS.fn.canvasInit();
            pJS.fn.canvasDraw();
        }
    }
    
    // Loading Sequence
    async handleLoadingSequence() {
        const loadingScreen = document.getElementById('loading-screen');
        const appContainer = document.getElementById('app-container');
        
        if (!loadingScreen || !appContainer) return;
        
        // Simulate loading time for smooth experience
        await this.delay(2000);
        
        // Fade out loading screen
        loadingScreen.classList.add('hidden');
        
        // Show app with stagger animation
        await this.delay(500);
        appContainer.style.opacity = '1';
        appContainer.style.transform = 'translateY(0)';
        
        // Hide loading screen after transition
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            this.ui.loading = false;
            
            // Initialize particles after app is visible
            setTimeout(() => this.initializeParticles(), 1000);
        }, 800);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Element Initialization
    initializeElements() {
        this.elements = {
            // Core elements
            appContainer: document.getElementById('app-container'),
            chatMessages: document.getElementById('chat-messages'),
            messagesContainer: document.getElementById('messages-container'),
            messageInput: document.getElementById('message-input'),
            sendButton: document.getElementById('send-button'),
            
            // Navigation and controls
            themeToggle: document.getElementById('theme-toggle'),
            voiceToggle: document.getElementById('voice-toggle'),
            clearChat: document.getElementById('clear-chat'),
            settingsToggle: document.getElementById('settings-toggle'),
            settingsClose: document.getElementById('settings-close'),
            settingsPanel: document.getElementById('settings-panel'),
            
            // Voice features
            voiceModal: document.getElementById('voice-modal'),
            voiceCancel: document.getElementById('voice-cancel'),
            voiceTranscript: document.getElementById('voice-transcript'),
            
            // UI elements
            welcomeScreen: document.getElementById('welcome-screen'),
            typingIndicator: document.getElementById('typing-indicator'),
            quickSuggestions: document.getElementById('quick-suggestions'),
            toastContainer: document.getElementById('toast-container'),
            
            // Action buttons
            scrollToBottom: document.getElementById('scroll-to-bottom'),
            newChatFab: document.getElementById('new-chat-fab'),
            
            // Input actions
            attachButton: document.getElementById('attach-button'),
            emojiButton: document.getElementById('emoji-button'),
            charCount: document.getElementById('char-count'),
            
            // Settings
            voiceEnabled: document.getElementById('voice-enabled'),
            testVoice: document.getElementById('test-voice'),
            stopVoice: document.getElementById('stop-voice'),
            soundEffects: document.getElementById('sound-effects')
        };
        
        // Initialize app container styles
        if (this.elements.appContainer) {
            this.elements.appContainer.style.opacity = '0';
            this.elements.appContainer.style.transform = 'translateY(20px)';
            this.elements.appContainer.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        }
    }
    
    // Modern Features
    initializeModernFeatures() {
        this.initializeToastSystem();
        this.initializeScrollFeatures();
        this.initializeInputEnhancements();
        this.initializeAccessibility();
    }
    
    initializeToastSystem() {
        // Create toast container if it doesn't exist
        if (!this.elements.toastContainer) {
            this.elements.toastContainer = document.createElement('div');
            this.elements.toastContainer.id = 'toast-container';
            this.elements.toastContainer.className = 'toast-container';
            document.body.appendChild(this.elements.toastContainer);
        }
    }
    
    showToast(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = this.getToastIcon(type);
        toast.innerHTML = `
            <div class="toast-content">
                <i class="toast-icon fas fa-${icon}"></i>
                <div class="toast-message">${message}</div>
                <button class="toast-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        this.elements.toastContainer.appendChild(toast);
        
        // Auto remove
        setTimeout(() => this.removeToast(toast), duration);
        
        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.removeToast(toast);
        });
        
        return toast;
    }
    
    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    removeToast(toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
    
    initializeScrollFeatures() {
        const messagesContainer = this.elements.messagesContainer;
        const scrollButton = this.elements.scrollToBottom;
        
        if (messagesContainer) {
            messagesContainer.addEventListener('scroll', () => {
                const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
                const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
                
                if (scrollButton) {
                    scrollButton.classList.toggle('hidden', isNearBottom);
                }
            });
        }
    }
    
    initializeInputEnhancements() {
        const messageInput = this.elements.messageInput;
        const charCount = this.elements.charCount;
        const maxLength = 2000;
        
        if (messageInput && charCount) {
            messageInput.addEventListener('input', () => {
                const length = messageInput.value.length;
                charCount.textContent = length;
                
                // Update character counter styling
                charCount.className = 'char-counter';
                if (length > maxLength * 0.9) {
                    charCount.classList.add('warning');
                }
                if (length >= maxLength) {
                    charCount.classList.add('error');
                }
                
                // Auto-resize textarea
                this.autoResizeTextarea(messageInput);
                
                // Update send button state
                this.updateSendButton();
            });
            
            // Handle Enter key
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
    }
    
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    initializeAccessibility() {
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
        
        // Focus management
        this.trapFocus(this.elements.settingsPanel);
    }
    
    trapFocus(element) {
        if (!element) return;
        
        element.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            
            const focusableElements = element.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }
    
    // Voice Features (Enhanced)
    initializeVoiceFeatures() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            this.elements?.voiceToggle?.classList.add('hidden');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        this.recognition.onstart = () => {
            this.isListening = true;
            this.showVoiceModal();
            this.updateVoiceUI();
        };
        
        this.recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            this.updateVoiceTranscript(transcript);
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.showToast(`Voice recognition error: ${event.error}`, 'error');
            this.hideVoiceModal();
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.hideVoiceModal();
            this.updateVoiceUI();
        };
    }
    
    showVoiceModal() {
        if (this.elements.voiceModal) {
            this.elements.voiceModal.classList.add('active');
            this.ui.voiceModalOpen = true;
            
            // Add animation class
            setTimeout(() => {
                this.elements.voiceModal.querySelector('.voice-content').style.transform = 'scale(1)';
            }, 10);
        }
    }
    
    hideVoiceModal() {
        if (this.elements.voiceModal) {
            this.elements.voiceModal.classList.remove('active');
            this.ui.voiceModalOpen = false;
            
            // Clear transcript after animation
            setTimeout(() => {
                this.updateVoiceTranscript('');
            }, 300);
        }
    }
    
    updateVoiceTranscript(transcript) {
        if (this.elements.voiceTranscript) {
            this.elements.voiceTranscript.textContent = transcript || 'Listening...';
        }
    }
    
    updateVoiceUI() {
        const voiceButton = this.elements.voiceToggle;
        if (voiceButton) {
            voiceButton.classList.toggle('listening', this.isListening);
        }
    }
    
    // Socket and Communication
    initializeSocket() {
        console.log('Initializing Socket.IO connection...');
        
        let shouldUseSocket = false;
        try {
            const host = window.location.hostname;
            const params = new URLSearchParams(window.location.search);
            const force = params.get('useSocket') === '1';
            shouldUseSocket = force || host === 'localhost' || host === '127.0.0.1';
        } catch (_) {
            shouldUseSocket = true;
        }
        
        if (shouldUseSocket) {
            this.socket = io({
                transports: ['websocket', 'polling'],
                upgrade: true
            });
            
            this.socket.on('connect', () => {
                console.log('✅ Connected to JIA server');
                this.socket.emit('join', { sessionId: this.sessionId });
            });
            
            this.socket.on('disconnect', () => {
                console.log('⚠️ Disconnected from server');
                this.showToast('Connection lost', 'warning');
            });
            
            this.socket.on('alfred-message', (data) => {
                this.handleReceivedMessage(data.message);
            });
            
            this.socket.on('error', (error) => {
                console.error('Socket error:', error);
                this.showToast('Connection error', 'error');
            });
        } else {
            console.log('Using HTTP API mode');
        }
    }
    
    async handleReceivedMessage(message) {
        this.hideTyping();
        
        if (this.ui.welcomeVisible) {
            this.hideWelcomeScreen();
        }
        
        // Create and animate message
        const messageElement = this.createMessageElement(message, 'alfred');
        this.elements.chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        this.scrollToBottom();
        
        // Handle voice synthesis
        if (this.voiceEnabled && this.elements.soundEffects?.checked) {
            this.speakMessage(message);
        }
    }
    
    // Message Handling (Enhanced)
    createMessageElement(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const avatar = type === 'alfred' ? 
            '<div class="avatar-container mini"><div class="avatar-core"><i class="fas fa-robot"></i></div></div>' :
            '<div class="avatar-container mini"><div class="avatar-core"><i class="fas fa-user"></i></div></div>';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                ${avatar}
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    ${this.formatMessageContent(message)}
                </div>
                <div class="message-footer">
                    <div class="message-time">${time}</div>
                    <div class="message-actions">
                        <button class="message-action" title="Copy">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="message-action" title="Speak">
                            <i class="fas fa-volume-up"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add message actions
        const copyBtn = messageDiv.querySelector('[title="Copy"]');
        const speakBtn = messageDiv.querySelector('[title="Speak"]');
        
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(message);
            this.showToast('Message copied to clipboard', 'success');
        });
        
        speakBtn.addEventListener('click', () => {
            this.speakMessage(message);
        });
        
        // Highlight code blocks
        setTimeout(() => {
            messageDiv.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        }, 100);
        
        return messageDiv;
    }
    
    formatMessageContent(message) {
        // Convert markdown to HTML and sanitize
        const html = marked.parse(message);
        return DOMPurify.sanitize(html);
    }
    
    async sendMessage() {
        const messageInput = this.elements.messageInput;
        const message = messageInput.value.trim();
        
        if (!message) return;
        
        // Hide welcome screen if visible
        if (this.ui.welcomeVisible) {
            this.hideWelcomeScreen();
        }
        
        // Add user message
        const userMessageElement = this.createMessageElement(message, 'user');
        this.elements.chatMessages.appendChild(userMessageElement);
        
        // Clear input
        messageInput.value = '';
        this.autoResizeTextarea(messageInput);
        this.updateSendButton();
        this.updateCharCount();
        
        // Scroll to bottom
        this.scrollToBottom();
        
        // Show typing indicator
        this.showTyping();
        
        try {
            // Send via socket or HTTP
            if (this.socket) {
                this.socket.emit('message', {
                    sessionId: this.sessionId,
                    message: message
                });
            } else {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message, sessionId: this.sessionId })
                });
                
                const data = await response.json();
                this.handleReceivedMessage(data.response || data.error || 'No response received');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.showToast('Failed to send message', 'error');
            this.hideTyping();
        }
    }
    
    showTyping() {
        if (this.elements.typingIndicator) {
            this.elements.typingIndicator.classList.add('active');
            this.isTyping = true;
        }
    }
    
    hideTyping() {
        if (this.elements.typingIndicator) {
            this.elements.typingIndicator.classList.remove('active');
            this.isTyping = false;
        }
    }
    
    scrollToBottom() {
        if (this.elements.messagesContainer) {
            this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
        }
    }
    
    hideWelcomeScreen() {
        if (this.elements.welcomeScreen) {
            this.elements.welcomeScreen.classList.add('hidden');
            this.ui.welcomeVisible = false;
        }
    }
    
    // Event Binding
    bindEvents() {
        // Theme toggle
        this.elements.themeToggle?.addEventListener('click', () => {
            this.setTheme(this.ui.darkMode ? 'light' : 'dark');
        });
        
        // Voice toggle
        this.elements.voiceToggle?.addEventListener('click', () => {
            if (this.recognition) {
                if (this.isListening) {
                    this.recognition.stop();
                } else {
                    this.recognition.start();
                }
            }
        });
        
        // Settings
        this.elements.settingsToggle?.addEventListener('click', () => {
            this.toggleSettings();
        });
        
        this.elements.settingsClose?.addEventListener('click', () => {
            this.closeSettings();
        });
        
        // Send button
        this.elements.sendButton?.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Clear chat
        this.elements.clearChat?.addEventListener('click', () => {
            this.clearChat();
        });
        
        // Voice modal
        this.elements.voiceCancel?.addEventListener('click', () => {
            if (this.recognition) {
                this.recognition.stop();
            }
        });
        
        // Floating action buttons
        this.elements.scrollToBottom?.addEventListener('click', () => {
            this.scrollToBottom();
        });
        
        this.elements.newChatFab?.addEventListener('click', () => {
            this.startNewChat();
        });
        
        // Quick actions
        document.querySelectorAll('.quick-action, .suggestion-chip').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const suggestion = e.currentTarget.getAttribute('data-suggestion');
                if (suggestion) {
                    this.elements.messageInput.value = suggestion;
                    this.updateSendButton();
                    this.sendMessage();
                }
            });
        });
        
        // Settings controls
        this.elements.voiceEnabled?.addEventListener('change', (e) => {
            this.voiceEnabled = e.target.checked;
            localStorage.setItem('jia-voice-enabled', this.voiceEnabled);
        });
        
        this.elements.testVoice?.addEventListener('click', () => {
            this.testVoice();
        });
        
        this.elements.stopVoice?.addEventListener('click', () => {
            this.stopVoice();
        });
        
        this.elements.soundEffects?.addEventListener('change', (e) => {
            localStorage.setItem('jia-sound-effects', e.target.checked);
        });
    }
    
    // Settings Management
    toggleSettings() {
        if (this.elements.settingsPanel) {
            this.elements.settingsPanel.classList.toggle('active');
            this.ui.settingsOpen = this.elements.settingsPanel.classList.contains('active');
        }
    }
    
    closeSettings() {
        if (this.elements.settingsPanel) {
            this.elements.settingsPanel.classList.remove('active');
            this.ui.settingsOpen = false;
        }
    }
    
    updateSendButton() {
        const messageInput = this.elements.messageInput;
        const sendButton = this.elements.sendButton;
        
        if (messageInput && sendButton) {
            const hasMessage = messageInput.value.trim().length > 0;
            sendButton.disabled = !hasMessage;
        }
    }
    
    updateCharCount() {
        const messageInput = this.elements.messageInput;
        const charCount = this.elements.charCount;
        
        if (messageInput && charCount) {
            const length = messageInput.value.length;
            charCount.textContent = length;
        }
    }
    
    // Chat Management
    clearChat() {
        if (this.elements.chatMessages) {
            this.elements.chatMessages.innerHTML = '';
            this.ui.welcomeVisible = true;
            this.showWelcomeScreen();
            this.showToast('Chat cleared', 'success');
        }
    }
    
    showWelcomeScreen() {
        if (this.elements.welcomeScreen) {
            this.elements.welcomeScreen.classList.remove('hidden');
            this.ui.welcomeVisible = true;
        }
    }
    
    startNewChat() {
        this.clearChat();
        this.messages = [];
        this.sessionId = this.generateSessionId();
        this.showToast('Started new chat', 'info');
    }
    
    // Voice Functions
    testVoice() {
        if (this.synthesis) {
            const utterance = new SpeechSynthesisUtterance('Hello! This is a test of JIA\'s voice capabilities.');
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            this.synthesis.speak(utterance);
            this.showToast('Voice test played', 'success');
        } else {
            this.showToast('Voice synthesis not available', 'warning');
        }
    }
    
    stopVoice() {
        if (this.synthesis) {
            this.synthesis.cancel();
            this.showToast('Voice stopped', 'info');
        }
    }
    
    speakMessage(message) {
        if (!this.synthesis) return;
        
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        this.synthesis.speak(utterance);
    }
    
    // Utility Functions
    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    closeAllModals() {
        this.closeSettings();
        this.hideVoiceModal();
    }
    
    loadSettings() {
        // Load saved settings
        this.voiceEnabled = localStorage.getItem('jia-voice-enabled') !== 'false';
        const soundEffects = localStorage.getItem('jia-sound-effects') !== 'false';
        
        if (this.elements.voiceEnabled) {
            this.elements.voiceEnabled.checked = this.voiceEnabled;
        }
        
        if (this.elements.soundEffects) {
            this.elements.soundEffects.checked = soundEffects;
        }
    }
    
    configureMarkdown() {
        marked.setOptions({
            highlight: (code, lang) => {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (__) {}
                }
                return hljs.highlightAuto(code).value;
            },
            langPrefix: 'hljs language-',
            breaks: true,
            gfm: true
        });
    }
    
    // Error Handling
    handleError(error, context = 'Unknown') {
        console.error(`Error in ${context}:`, error);
        this.showToast(`${context}: ${error.message}`, 'error');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jia = new JIAModern();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is hidden
        document.body.classList.add('page-hidden');
    } else {
        // Resume animations when page is visible
        document.body.classList.remove('page-hidden');
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    if (window.jia) {
        window.jia.showToast('Connection restored', 'success');
    }
});

window.addEventListener('offline', () => {
    if (window.jia) {
        window.jia.showToast('You are offline', 'warning');
    }
});

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}