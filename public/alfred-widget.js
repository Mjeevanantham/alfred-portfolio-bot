(function() {
    'use strict';
    
    // Configuration - You can customize these
    const WIDGET_CONFIG = {
        serverUrl: 'https://alfred-portfolio-bot.vercel.app', // Default production URL
        position: 'bottom-right',
        theme: 'dark',
        showPulse: true,
        autoOpen: false,
        tenantId: null // Will be set from data-tenant-id attribute
    };
    
    // Get configuration from script tag
    const currentScript = document.currentScript;
    if (currentScript) {
        const tenantId = currentScript.getAttribute('data-tenant-id');
        if (tenantId) {
            WIDGET_CONFIG.tenantId = tenantId;
        }
        
        // You can add more data attributes for configuration
        const serverUrl = currentScript.getAttribute('data-server-url');
        if (serverUrl) {
            WIDGET_CONFIG.serverUrl = serverUrl;
        }
        
        const position = currentScript.getAttribute('data-position');
        if (position) {
            WIDGET_CONFIG.position = position;
        }
        
        const theme = currentScript.getAttribute('data-theme');
        if (theme) {
            WIDGET_CONFIG.theme = theme;
        }
    }
    
    // CSS Styles - Injected automatically
    const widgetCSS = `
        <style id="alfred-widget-styles">
            /* JIA Bot Widget Styles */
            .alfred-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .alfred-widget-toggle {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
                border-radius: 50%;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
                transition: all 0.3s ease;
                position: relative;
            }
            
            .alfred-widget-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 25px rgba(37, 99, 235, 0.6);
            }
            
            .alfred-widget-toggle.active {
                background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
            }
            
            .alfred-widget-toggle .pulse {
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                border-radius: 50%;
                background: rgba(37, 99, 235, 0.3);
                animation: alfred-pulse 2s infinite;
            }
            
            @keyframes alfred-pulse {
                0% {
                    transform: scale(1);
                    opacity: 1;
                }
                100% {
                    transform: scale(1.4);
                    opacity: 0;
                }
            }
            
            .alfred-widget-panel {
                position: fixed;
                top: 0;
                right: -400px;
                width: 400px;
                height: 100vh;
                background: #1e293b;
                color: white;
                transition: right 0.3s ease;
                z-index: 10001;
                display: flex;
                flex-direction: column;
                box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
            }
            
            .alfred-widget-panel.open {
                right: 0;
            }
            
            .alfred-widget-header {
                padding: 20px;
                background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .alfred-widget-header-left {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .alfred-widget-avatar {
                width: 40px;
                height: 40px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                backdrop-filter: blur(10px);
                border: 2px solid rgba(255, 255, 255, 0.3);
            }
            
            .alfred-widget-title {
                font-size: 18px;
                font-weight: 600;
                margin: 0;
            }
            
            .alfred-widget-subtitle {
                font-size: 12px;
                opacity: 0.9;
                margin: 0;
            }
            
            .alfred-widget-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 8px;
                border-radius: 4px;
                transition: background 0.2s ease;
            }
            
            .alfred-widget-close:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .alfred-widget-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .alfred-widget-greeting {
                padding: 20px;
                text-align: center;
                background: rgba(255, 255, 255, 0.05);
            }
            
            .alfred-widget-greeting h3 {
                font-size: 20px;
                margin: 0 0 8px 0;
                font-weight: 600;
            }
            
            .alfred-widget-greeting p {
                font-size: 14px;
                opacity: 0.8;
                margin: 0;
            }
            
            .alfred-widget-chat {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .alfred-widget-message {
                display: flex;
                gap: 12px;
                align-items: flex-start;
            }
            
            .alfred-widget-message.user {
                flex-direction: row-reverse;
            }
            
            .alfred-widget-message-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                flex-shrink: 0;
            }
            
            .alfred-widget-message.alfred .alfred-widget-message-avatar {
                background: linear-gradient(135deg, #2563eb, #3b82f6);
                color: white;
            }
            
            .alfred-widget-message.user .alfred-widget-message-avatar {
                background: linear-gradient(135deg, #64748b, #475569);
                color: white;
            }
            
            .alfred-widget-message-bubble {
                max-width: 80%;
                padding: 12px 16px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .alfred-widget-message.alfred .alfred-widget-message-bubble {
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }
            
            .alfred-widget-message.user .alfred-widget-message-bubble {
                background: linear-gradient(135deg, #2563eb, #3b82f6);
                color: white;
            }
            
            .alfred-widget-input-area {
                padding: 20px;
                background: rgba(255, 255, 255, 0.05);
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .alfred-widget-input-wrapper {
                display: flex;
                gap: 12px;
                align-items: flex-end;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 24px;
                padding: 12px;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .alfred-widget-input {
                flex: 1;
                background: none;
                border: none;
                outline: none;
                color: white;
                font-size: 16px; /* prevent iOS zoom */
                resize: none;
                min-height: 20px;
                max-height: 100px;
                font-family: inherit;
            }
            
            .alfred-widget-input::placeholder {
                color: rgba(255, 255, 255, 0.6);
            }
            
            .alfred-widget-send {
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, #2563eb, #3b82f6);
                border: none;
                border-radius: 50%;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }
            
            .alfred-widget-send:hover {
                transform: scale(1.1);
            }
            
            .alfred-widget-suggestions {
                display: flex;
                gap: 8px;
                margin-top: 12px;
                flex-wrap: wrap;
            }
            
            .alfred-widget-suggestion {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                padding: 6px 12px;
                border-radius: 16px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .alfred-widget-suggestion:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-1px);
            }
            
            .alfred-widget-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .alfred-widget-overlay.open {
                opacity: 1;
                visibility: visible;
            }
            
            /* Mobile Responsive */
            @media (max-width: 768px) {
                .alfred-widget-panel {
                    width: 100%;
                    right: -100%;
                }
                
                .alfred-widget-toggle {
                    width: 50px;
                    height: 50px;
                    font-size: 20px;
                    bottom: 15px;
                    right: 15px;
                }
            }
            
            /* Scrollbar Styling */
            .alfred-widget-chat::-webkit-scrollbar {
                width: 4px;
            }
            
            .alfred-widget-chat::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .alfred-widget-chat::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 2px;
            }
            
            .alfred-widget-chat::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.5);
            }

            /* Markdown rendering inside bubbles */
            .alfred-widget-message-bubble .markdown-body { color: inherit; }
            .alfred-widget-message-bubble .markdown-body p { margin: 0.25rem 0; }
            .alfred-widget-message-bubble .markdown-body ul,
            .alfred-widget-message-bubble .markdown-body ol { padding-left: 1.25rem; margin: 0.25rem 0; }
            .alfred-widget-message-bubble .markdown-body ul { list-style: disc inside; }
            .alfred-widget-message-bubble .markdown-body ol { list-style: decimal inside; }
            .alfred-widget-message-bubble .markdown-body li { margin: 0.125rem 0; }
            .alfred-widget-message-bubble .markdown-body ul { list-style: disc inside; }
            .alfred-widget-message-bubble .markdown-body ol { list-style: decimal inside; }
            .alfred-widget-message-bubble .markdown-body a { color: inherit; text-decoration: underline; }
            .alfred-widget-message-bubble pre {
                background: rgba(0,0,0,0.25);
                padding: 0.75rem;
                border-radius: 8px;
                overflow-x: auto;
                white-space: pre;
                -webkit-overflow-scrolling: touch;
            }
            .alfred-widget-message.user .alfred-widget-message-bubble pre { background: rgba(255,255,255,0.15); }
            .alfred-widget-message-bubble pre code { background: transparent; padding: 0; }
            .alfred-widget-message-bubble code {
                background: rgba(255,255,255,0.15);
                padding: 0.15rem 0.35rem;
                border-radius: 4px;
                font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;
            }
            .alfred-widget-message.user .alfred-widget-message-bubble code { background: rgba(255,255,255,0.25); }
        </style>
    `;
    
    // Widget HTML Template
    const widgetHTML = `
        <div class="alfred-widget" id="alfredWidget">
            <button class="alfred-widget-toggle" id="alfredToggle">
                ${WIDGET_CONFIG.showPulse ? '<div class="pulse"></div>' : ''}
                <i class="fas fa-robot"></i>
            </button>
            
            <div class="alfred-widget-overlay" id="alfredOverlay"></div>
            
            <div class="alfred-widget-panel" id="alfredPanel">
                <div class="alfred-widget-header">
                    <div class="alfred-widget-header-left">
                        <div class="alfred-widget-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div>
                            <h3 class="alfred-widget-title">JIA</h3>
                            <p class="alfred-widget-subtitle">Jeeva's AI Assistant</p>
                        </div>
                    </div>
                    <button class="alfred-widget-close" id="alfredClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="alfred-widget-content">
                    <div class="alfred-widget-greeting">
                        <h3>Hello! 👋</h3>
                        <p>I'm JIA, Jeeva's AI assistant. Ask me anything about his work, skills, or experience!</p>
                    </div>
                    
                    <div class="alfred-widget-chat" id="alfredChat">
                        <div class="alfred-widget-message alfred">
                            <div class="alfred-widget-message-avatar">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="alfred-widget-message-bubble">
                                Hi there! I'm JIA, Jeeva's personal AI assistant. I'm here to help you learn about his work, skills, and experience. How can I assist you today?
                            </div>
                        </div>
                    </div>
                    
                    <div class="alfred-widget-input-area">
                        <div class="alfred-widget-input-wrapper">
                            <textarea 
                                class="alfred-widget-input" 
                                id="alfredInput" 
                                placeholder="Ask JIA about Jeeva's work..."
                                rows="1"
                            ></textarea>
                            <button class="alfred-widget-send" id="alfredSend">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                        <div class="alfred-widget-suggestions">
                            <div class="alfred-widget-suggestion" data-suggestion="What are Jeeva's main skills?">Skills</div>
                            <div class="alfred-widget-suggestion" data-suggestion="Tell me about Jeeva's projects">Projects</div>
                            <div class="alfred-widget-suggestion" data-suggestion="What is Jeeva's experience?">Experience</div>
                            <div class="alfred-widget-suggestion" data-suggestion="How can I contact Jeeva?">Contact</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Alfred Widget Class
    class AlfredWidget {
        constructor(config) {
            this.config = config;
            this.isOpen = false;
            this.socket = null;
            this.sessionId = this.generateSessionId();
            
            this.initializeWidget();
        }
        
        initializeWidget() {
            // Add CSS to head
            if (!document.getElementById('alfred-widget-styles')) {
                const styleElement = document.createElement('div');
                styleElement.innerHTML = widgetCSS;
                document.head.appendChild(styleElement);
            }
            
            // Add widget HTML to body
            const widgetElement = document.createElement('div');
            widgetElement.innerHTML = widgetHTML;
            document.body.appendChild(widgetElement.firstElementChild);
            
            this.initializeElements();
            this.bindEvents();
            this.initializeSocket();
            this.configureMarkdown();
            
            // Auto-open if configured
            if (this.config.autoOpen) {
                setTimeout(() => this.openPanel(), 1000);
            }
        }
        
        initializeElements() {
            this.elements = {
                widget: document.getElementById('alfredWidget'),
                toggle: document.getElementById('alfredToggle'),
                panel: document.getElementById('alfredPanel'),
                overlay: document.getElementById('alfredOverlay'),
                close: document.getElementById('alfredClose'),
                chat: document.getElementById('alfredChat'),
                input: document.getElementById('alfredInput'),
                send: document.getElementById('alfredSend')
            };
        }
        
        bindEvents() {
            this.elements.toggle.addEventListener('click', () => this.togglePanel());
            this.elements.close.addEventListener('click', () => this.closePanel());
            this.elements.overlay.addEventListener('click', () => this.closePanel());
            this.elements.send.addEventListener('click', () => this.sendMessage());
            
            this.elements.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            this.elements.input.addEventListener('input', () => {
                this.autoResizeTextarea();
            });
            
            // Suggestion clicks
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('alfred-widget-suggestion')) {
                    const suggestion = e.target.getAttribute('data-suggestion');
                    this.elements.input.value = suggestion;
                    this.sendMessage();
                }
            });
        }
        
        initializeSocket() {
            try {
                // Load Socket.IO if not already loaded
                if (typeof io === 'undefined') {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
                    script.onload = () => this.connectSocket();
                    script.onerror = () => {
                        console.error('Failed to load Socket.IO from CDN');
                        this.showFallbackMessage();
                    };
                    document.head.appendChild(script);
                } else {
                    this.connectSocket();
                }
            } catch (error) {
                console.error('Failed to initialize socket:', error);
                this.showFallbackMessage();
            }
        }
        
        showFallbackMessage() {
            // Show a message that the bot is in offline mode
            setTimeout(() => {
                this.addMessage('I\'m currently in offline mode. Please refresh the page to try again.', 'alfred');
            }, 1000);
        }
        
        connectSocket() {
            try {
                const isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
                if (!isLocal && !this.config.serverUrl) {
                    this.socket = null;
                    return;
                }

                this.socket = io(this.config.serverUrl, {
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    timeout: 5000
                });
                
                this.socket.on('alfred-response', (data) => {
                    this.addMessage(data.message, 'alfred');
                });
                
                this.socket.on('alfred-error', () => {
                    this.addMessage('Sorry, I encountered an error. Please try again.', 'alfred');
                });
                
                this.socket.on('connect', () => {
                    console.log('Connected to JIA server');
                });
                
                this.socket.on('connect_error', (err) => {
                    console.warn('Socket connect_error; using HTTP fallback.', err?.message || err);
                });
                
                this.socket.on('disconnect', () => {
                    console.log('Disconnected from JIA server');
                });
            } catch (error) {
                console.error('Failed to connect to JIA server:', error);
            }
        }
        
        togglePanel() {
            this.isOpen ? this.closePanel() : this.openPanel();
        }
        
        openPanel() {
            this.isOpen = true;
            this.elements.panel.classList.add('open');
            this.elements.overlay.classList.add('open');
            this.elements.toggle.classList.add('active');
            this.elements.input.focus();
        }
        
        closePanel() {
            this.isOpen = false;
            this.elements.panel.classList.remove('open');
            this.elements.overlay.classList.remove('open');
            this.elements.toggle.classList.remove('active');
        }
        
        sendMessage() {
            const message = this.elements.input.value.trim();
            if (!message) return;
            
            this.addMessage(message, 'user');
            this.elements.input.value = '';
            this.autoResizeTextarea();
            
            if (this.socket && this.socket.connected) {
                this.socket.emit('chat-message', {
                    message: message,
                    sessionId: this.sessionId
                });
            } else {
                // HTTP fallback
                fetch(`${this.config.serverUrl}/api/chat/message`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message, sessionId: this.sessionId })
                })
                .then(res => res.ok ? res.json() : Promise.reject(new Error('HTTP error')))
                .then(data => this.addMessage(data.content, 'alfred'))
                .catch(() => this.addMessage('Sorry, I encountered an error. Please try again.', 'alfred'));
            }
        }
        
        addMessage(content, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `alfred-widget-message ${sender}`;
            
            const avatarIcon = sender === 'alfred' ? 'fas fa-robot' : 'fas fa-user';
            
            messageDiv.innerHTML = `
                <div class="alfred-widget-message-avatar">
                    <i class="${avatarIcon}"></i>
                </div>
                <div class="alfred-widget-message-bubble">
                    <div class="markdown-body">${this.formatMessage(content)}</div>
                </div>
            `;
            
            this.elements.chat.appendChild(messageDiv);
            try {
                if (window.hljs) {
                    const blocks = messageDiv.querySelectorAll('pre code');
                    blocks.forEach((block) => window.hljs.highlightElement(block));
                }
            } catch (_) {}
            this.scrollToBottom();
        }
        
        // Normalize inline bullets like "Intro: * Item A * Item B" to proper lists
        normalizeInlineLists(content) {
            try {
                if (!content || typeof content !== 'string') return content;
                if (/(^|\n)\s*(?:[-*+]\s+|\d+\.[\t ]+)/.test(content)) return content;
                let text = content.replace(/:\s*\*\s+/g, ':\n- ');
                text = text.replace(/\s\*\s+/g, '\n- ');
                text = text.replace(/\n{3,}/g, '\n\n');
                return text;
            } catch (_) { return content; }
        }

        formatMessage(content) {
            // Render markdown then sanitize; fallback to linkify
            let rendered = content;
            try {
                const normalized = this.normalizeInlineLists(content);
                if (window.marked) {
                    rendered = window.marked.parse(normalized);
                } else {
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    rendered = normalized.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer nofollow">$1<\/a>');
                }
            } catch (e) {}
            try {
                if (window.DOMPurify) {
                    return window.DOMPurify.sanitize(rendered, {
                        USE_PROFILES: { html: true },
                        ADD_ATTR: ['target','rel','class'],
                        ALLOWED_TAGS: ['a','p','br','span','div','strong','em','del','code','pre','blockquote','hr','ul','ol','li','h1','h2','h3','h4','h5','h6','table','thead','tbody','tr','th','td']
                    });
                }
            } catch (e) {}
            return rendered;
        }

        // Load libraries and configure markdown rendering
        configureMarkdown() {
            const ensureScript = (src) => new Promise((resolve) => {
                const exists = Array.from(document.scripts).some(s => s.src === src);
                if (exists) return resolve();
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = resolve;
                document.head.appendChild(script);
            });
            const ensureLink = (href, media) => {
                const exists = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(l => l.href === href);
                if (exists) return;
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                if (media) link.media = media;
                document.head.appendChild(link);
            };
            const markedUrl = 'https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js';
            const purifyUrl = 'https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js';
            const hljsUrl = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
            // Add highlight.js themes for light/dark
            ensureLink('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css', '(prefers-color-scheme: light)');
            ensureLink('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css', '(prefers-color-scheme: dark)');
            Promise.all([ensureScript(markedUrl), ensureScript(purifyUrl), ensureScript(hljsUrl)])
                .then(() => {
                    try {
                        if (window.marked) {
                            window.marked.setOptions({
                                gfm: true,
                                breaks: true,
                                headerIds: true,
                                mangle: false,
                                highlight: (code, lang) => {
                                    if (window.hljs) {
                                        if (lang && window.hljs.getLanguage(lang)) {
                                            return window.hljs.highlight(code, { language: lang }).value;
                                        }
                                        return window.hljs.highlightAuto(code).value;
                                    }
                                    return code;
                                }
                            });
                            const renderer = new window.marked.Renderer();
                            renderer.link = (href, title, text) => {
                                const t = title ? ` title="${title}"` : '';
                                return `<a href="${href}"${t} target="_blank" rel="noopener noreferrer nofollow">${text}<\/a>`;
                            };
                            window.marked.use({ renderer });
                        }
                    } catch (e) {}
                });
        }
        
        autoResizeTextarea() {
            const textarea = this.elements.input;
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
        }
        
        scrollToBottom() {
            setTimeout(() => {
                this.elements.chat.scrollTop = this.elements.chat.scrollHeight;
            }, 100);
        }
        
        generateSessionId() {
            return 'widget_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
    }
    
    // Initialize widget when DOM is ready
    function initializeAlfredWidget() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.alfredWidget = new AlfredWidget(WIDGET_CONFIG);
            });
        } else {
            window.alfredWidget = new AlfredWidget(WIDGET_CONFIG);
        }
    }
    
    // Start initialization
    initializeAlfredWidget();
    
})();
