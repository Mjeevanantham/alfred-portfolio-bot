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
            /* JIA Bot Widget Styles - Clean, Intercom-like */
            .alfred-widget { position: fixed; bottom: 20px; right: 20px; z-index: 10000; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .alfred-widget-toggle { width: 60px; height: 60px; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px; box-shadow: 0 10px 30px rgba(37, 99, 235, 0.35); transition: transform .2s ease, box-shadow .2s ease, background .2s ease; position: relative; }
            .alfred-widget-toggle:hover { transform: scale(1.06); box-shadow: 0 14px 34px rgba(37, 99, 235, 0.45); }
            .alfred-widget-toggle.active { background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); }
            .alfred-widget-toggle .pulse { position: absolute; inset: -2px; border-radius: 50%; background: rgba(37, 99, 235, 0.28); animation: alfred-pulse 2s infinite; }
            @keyframes alfred-pulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.35); opacity: 0; } }
            .alfred-widget-panel { position: fixed; bottom: 90px; right: 20px; width: 380px; max-width: calc(100vw - 40px); height: min(70vh, 620px); background: #ffffff; color: #0f172a; border-radius: 16px; border: 1px solid rgba(15, 23, 42, 0.08); box-shadow: 0 24px 60px rgba(2, 6, 23, 0.18), 0 8px 18px rgba(2, 6, 23, 0.12); z-index: 10001; display: flex; flex-direction: column; opacity: 0; transform: translateY(12px) scale(.98); visibility: hidden; pointer-events: none; transition: opacity .2s ease, transform .2s ease, visibility .2s ease; }
            .alfred-widget-panel.open { opacity: 1; transform: translateY(0) scale(1); visibility: visible; pointer-events: auto; }
            .alfred-widget-header { padding: 12px 14px; background: #ffffff; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(15, 23, 42, 0.08); border-top-left-radius: 16px; border-top-right-radius: 16px; }
            .alfred-widget-header-left { display: flex; align-items: center; gap: 10px; }
            .alfred-widget-avatar { width: 28px; height: 28px; background: #eff6ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 1px solid rgba(37, 99, 235, 0.35); color: #1d4ed8; }
            .alfred-widget-title { font-size: 14px; font-weight: 600; margin: 0; line-height: 1; color: #0f172a; }
            .alfred-widget-subtitle { font-size: 12px; margin: 2px 0 0 0; color: #64748b; }
            .alfred-widget-close { background: none; border: none; color: #334155; font-size: 18px; cursor: pointer; padding: 6px; border-radius: 6px; transition: background .15s ease; }
            .alfred-widget-close:hover { background: rgba(15, 23, 42, 0.06); }
            .alfred-widget-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
            .alfred-widget-greeting { padding: 14px; text-align: left; background: #f8fafc; border-bottom: 1px solid rgba(15,23,42,0.06); }
            .alfred-widget-greeting h3 { font-size: 16px; margin: 0 0 6px 0; font-weight: 600; color: #0f172a; }
            .alfred-widget-greeting p { font-size: 13px; margin: 0; color: #475569; }
            .alfred-widget-disclaimer { padding: 8px 14px; font-size: 11px; color: #94a3b8; background: #f8fafc; border-top: 1px solid rgba(15,23,42,0.06); }
            .alfred-widget-chat { flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
            .alfred-widget-message { display: flex; gap: 10px; align-items: flex-start; }
            .alfred-widget-message.user { flex-direction: row-reverse; }
            .alfred-widget-message-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; }
            .alfred-widget-message.alfred .alfred-widget-message-avatar { background: #eff6ff; color: #1d4ed8; border: 1px solid rgba(37,99,235,.35); }
            .alfred-widget-message.user .alfred-widget-message-avatar { background: linear-gradient(135deg, #64748b, #475569); color: #fff; }
            .alfred-widget-message-bubble { max-width: 80%; padding: 10px 14px; border-radius: 14px; font-size: 14px; line-height: 1.45; border: 1px solid transparent; }
            .alfred-widget-message.alfred .alfred-widget-message-bubble { background: #f1f5f9; color: #0f172a; border-color: #e2e8f0; }
            .alfred-widget-message.user .alfred-widget-message-bubble { background: linear-gradient(135deg, #2563eb, #3b82f6); color: #fff; }
            .alfred-widget-input-area { padding: 12px; background: #ffffff; border-top: 1px solid rgba(15, 23, 42, 0.08); border-bottom-left-radius: 16px; border-bottom-right-radius: 16px; }
            .alfred-widget-input-wrapper { display: flex; gap: 10px; align-items: flex-end; background: #f8fafc; border-radius: 12px; padding: 10px; border: 1px solid #e2e8f0; }
            .alfred-widget-input { flex: 1; background: none; border: none; outline: none; color: #0f172a; font-size: 16px; resize: none; min-height: 20px; max-height: 100px; font-family: inherit; }
            .alfred-widget-input::placeholder { color: #94a3b8; }
            .alfred-widget-send { width: 36px; height: 36px; background: linear-gradient(135deg, #2563eb, #3b82f6); border: none; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform .15s ease; flex-shrink: 0; }
            .alfred-widget-send:hover { transform: scale(1.06); }
            .alfred-widget-suggestions { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
            .alfred-widget-suggestion { background: #f1f5f9; border: 1px solid #e2e8f0; color: #0f172a; padding: 6px 10px; border-radius: 14px; font-size: 12px; cursor: pointer; transition: transform .15s ease, background .15s ease; }
            .alfred-widget-suggestion:hover { background: #e2e8f0; transform: translateY(-1px); }
            .alfred-widget-overlay { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.35); z-index: 10000; opacity: 0; visibility: hidden; transition: opacity .2s ease, visibility .2s ease; }
            .alfred-widget-overlay.open { opacity: 1; visibility: visible; }
            @media (max-width: 768px) { .alfred-widget-panel { right: 10px; left: 10px; width: auto; max-width: none; height: min(80vh, 640px); bottom: 80px; } .alfred-widget-toggle { width: 50px; height: 50px; font-size: 20px; bottom: 15px; right: 15px; } }
            .alfred-widget-chat::-webkit-scrollbar { width: 4px; }
            .alfred-widget-chat::-webkit-scrollbar-track { background: transparent; }
            .alfred-widget-chat::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.5); border-radius: 2px; }
            .alfred-widget-chat::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.7); }
            .alfred-widget-message-bubble .markdown-body { color: inherit; }
            .alfred-widget-message-bubble .markdown-body p { margin: 0.25rem 0; }
            .alfred-widget-message-bubble .markdown-body ul, .alfred-widget-message-bubble .markdown-body ol { padding-left: 1.25rem; margin: 0.25rem 0; }
            .alfred-widget-message-bubble .markdown-body a { color: inherit; text-decoration: underline; }
            .alfred-widget-message-bubble pre { background: rgba(15,23,42,0.06); padding: 0.75rem; border-radius: 8px; overflow-x: auto; white-space: pre; -webkit-overflow-scrolling: touch; }
            .alfred-widget-message.user .alfred-widget-message-bubble pre { background: rgba(255,255,255,0.15); }
            .alfred-widget-message-bubble pre code { background: transparent; padding: 0; }
            .alfred-widget-message-bubble code { background: rgba(15,23,42,0.06); padding: 0.15rem 0.35rem; border-radius: 4px; font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace; }
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
                            <p class="alfred-widget-subtitle">Jeeva's AI Assistant • May make mistakes</p>
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
                                Hi there! I'm JIA, Jeeva's personal AI assistant. I strive to be helpful but I may make mistakes — please verify important information. How can I assist you today?
                            </div>
                        </div>
                    </div>
                    
                    <div class="alfred-widget-input-area">
                        <div class="alfred-widget-input-wrapper">
                            <textarea class="alfred-widget-input" id="alfredInput" placeholder="Ask JIA about Jeeva's work..." rows="1"></textarea>
                            <button class="alfred-widget-send" id="alfredSend"><i class="fas fa-paper-plane"></i></button>
                        </div>
                        <div class="alfred-widget-suggestions">
                            <div class="alfred-widget-suggestion" data-suggestion="What are Jeeva's main skills?">Skills</div>
                            <div class="alfred-widget-suggestion" data-suggestion="Tell me about Jeeva's projects">Projects</div>
                            <div class="alfred-widget-suggestion" data-suggestion="What is Jeeva's experience?">Experience</div>
                            <div class="alfred-widget-suggestion" data-suggestion="How can I contact Jeeva?">Contact</div>
                        </div>
                        <div class="alfred-widget-disclaimer">AI can make mistakes. For critical decisions, double‑check important info.</div>
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
                    document.head.appendChild(script);
                } else {
                    this.connectSocket();
                }
            } catch (error) {
                console.error('Failed to initialize socket:', error);
            }
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

        togglePanel() { this.isOpen ? this.closePanel() : this.openPanel(); }
        openPanel() { this.isOpen = true; this.elements.panel.classList.add('open'); this.elements.overlay.classList.add('open'); this.elements.toggle.classList.add('active'); this.elements.input.focus(); }
        closePanel() { this.isOpen = false; this.elements.panel.classList.remove('open'); this.elements.overlay.classList.remove('open'); this.elements.toggle.classList.remove('active'); }

        sendMessage() {
            const message = this.elements.input.value.trim();
            if (!message) return;

            this.addMessage(message, 'user');
            this.elements.input.value = '';
            this.autoResizeTextarea();

            if (this.socket && this.socket.connected) {
                this.socket.emit('chat-message', { message, sessionId: this.sessionId });
            } else {
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
                <div class="alfred-widget-message-avatar"><i class="${avatarIcon}"></i></div>
                <div class="alfred-widget-message-bubble"><div class="markdown-body">${this.formatMessage(content)}</div></div>
            `;
            this.elements.chat.appendChild(messageDiv);
            try {
                if (window.hljs) {
                    const blocks = messageDiv.querySelectorAll('pre code');
                    blocks.forEach((b) => window.hljs.highlightElement(b));
                }
            } catch (e) {}
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
            ensureLink('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css', '(prefers-color-scheme: light)');
            ensureLink('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css', '(prefers-color-scheme: dark)');
            Promise.all([ensureScript(markedUrl), ensureScript(purifyUrl), ensureScript(hljsUrl)]).then(() => {
                try {
                    if (window.marked) {
                        window.marked.setOptions({
                            gfm: true, breaks: true, headerIds: true, mangle: false,
                            highlight: (code, lang) => {
                                if (window.hljs) {
                                    if (lang && window.hljs.getLanguage(lang)) return window.hljs.highlight(code, { language: lang }).value;
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

        scrollToBottom() { setTimeout(() => { this.elements.chat.scrollTop = this.elements.chat.scrollHeight; }, 100); }
        generateSessionId() { return 'widget_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }
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
