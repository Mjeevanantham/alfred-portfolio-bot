class AlfredChat {
    constructor() {
        this.socket = null;
        this.sessionId = this.generateSessionId();
        this.isListening = false;
        this.recognition = null;
        this.synthesis = null;
        this.voiceEnabled = true;
        this.settings = null;
        
        this.initializeElements();
        this.initializeSocket();
        this.initializeVoiceFeatures();
        this.bindEvents();
        this.initializeUI();
        this.loadSettings();
    }
    
    initializeElements() {
        this.elements = {
            chatMessages: document.getElementById('chatMessages'),
            messageInput: document.getElementById('messageInput'),
            sendButton: document.getElementById('sendButton'),
            typingIndicator: document.getElementById('typingIndicator'),
            voiceToggle: document.getElementById('voiceToggle'),
            clearChat: document.getElementById('clearChat'),
            settingsPanel: document.getElementById('settingsPanel'),
            settingsToggle: document.getElementById('settingsToggle'),
            voiceModal: document.getElementById('voiceModal'),
            stopListening: document.getElementById('stopListening'),
            inputSuggestions: document.getElementById('inputSuggestions'),
            voiceEnabled: document.getElementById('voiceEnabled'),
            stopVoice: document.getElementById('stopVoice')
        };
    }
    
    initializeSocket() {
        this.socket = io();
        
        this.socket.on('alfred-response', (data) => {
            this.hideTypingIndicator();
            this.addMessage(data.message, 'alfred');
            if (this.voiceEnabled && this.synthesis) {
                this.speakMessage(data.message);
            }
        });
        
        this.socket.on('alfred-error', (data) => {
            this.hideTypingIndicator();
            this.addMessage(data.message, 'alfred');
        });
        
        this.socket.on('connect', () => {
            console.log('Connected to Alfred server');
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from Alfred server');
        });
    }
    
    initializeVoiceFeatures() {
        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.elements.messageInput.value = transcript;
                this.hideVoiceModal();
                this.sendMessage();
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.hideVoiceModal();
                this.showNotification('Voice recognition failed. Please try again.', 'error');
            };
            
            this.recognition.onend = () => {
                this.hideVoiceModal();
            };
        }
        
        // Initialize Speech Synthesis
        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
        }
    }
    
    bindEvents() {
        // Send message events
        this.elements.sendButton.addEventListener('click', () => this.sendMessage());
        this.elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize textarea
        this.elements.messageInput.addEventListener('input', () => {
            this.autoResizeTextarea();
        });
        
        // Voice features
        this.elements.voiceToggle.addEventListener('click', () => this.toggleVoiceInput());
        this.elements.stopListening.addEventListener('click', () => this.stopVoiceInput());
        this.elements.stopVoice.addEventListener('click', () => this.stopAllVoice());

        // Settings toggle
        if (this.elements.settingsToggle) {
            this.elements.settingsToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.elements.settingsPanel.classList.toggle('active');
            });
        }
        
        // Chat management
        this.elements.clearChat.addEventListener('click', () => this.clearChat());
        
        // Voice settings
        this.elements.voiceEnabled.addEventListener('change', () => this.toggleVoiceSettings());
        
        // Suggestion chips
        this.elements.inputSuggestions.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-chip')) {
                const suggestion = e.target.getAttribute('data-suggestion');
                this.elements.messageInput.value = suggestion;
                this.sendMessage();
            }
        });
        
        // Close settings when clicking outside
        document.addEventListener('click', (e) => {
            const panel = this.elements.settingsPanel;
            const toggle = this.elements.settingsToggle;
            if (panel && !panel.contains(e.target) && toggle && !toggle.contains(e.target)) {
                panel.classList.remove('active');
            }
        });
    }
    
    initializeUI() {
        // Focus on input
        this.elements.messageInput.focus();
        
        // Update voice toggle visibility based on settings
        this.updateVoiceToggleVisibility();
    }
    
    async loadSettings() {
        try {
            const response = await fetch('/api/admin/settings');
            if (response.ok) {
                this.settings = await response.json();
                this.voiceEnabled = this.settings.voiceEnabled;
                this.elements.voiceEnabled.checked = this.voiceEnabled;
                this.updateVoiceToggleVisibility();
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    updateVoiceToggleVisibility() {
        if (this.voiceEnabled) {
            this.elements.voiceToggle.style.display = 'flex';
        } else {
            this.elements.voiceToggle.style.display = 'none';
        }
    }
    
    toggleVoiceSettings() {
        this.voiceEnabled = this.elements.voiceEnabled.checked;
        this.updateVoiceToggleVisibility();
        
        if (!this.voiceEnabled) {
            this.stopAllVoice();
        }
    }
    
    stopAllVoice() {
        // Stop speech synthesis
        if (this.synthesis) {
            this.synthesis.cancel();
        }
        
        // Stop speech recognition
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        
        this.isListening = false;
        this.elements.voiceModal.classList.remove('active');
        this.elements.voiceToggle.innerHTML = '<i class="fas fa-microphone"></i>';
        
        this.showNotification('Voice features stopped', 'info');
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    sendMessage() {
        const message = this.elements.messageInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Clear input
        this.elements.messageInput.value = '';
        this.autoResizeTextarea();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Send to server
        this.socket.emit('chat-message', {
            message: message,
            sessionId: this.sessionId
        });
        
        // Hide suggestions after first message
        this.elements.inputSuggestions.style.display = 'none';
    }
    
    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const timestamp = new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        if (sender === 'alfred') {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <div class="avatar-circle">
                        <i class="fas fa-robot"></i>
                    </div>
                </div>
                <div class="message-content">
                    <div class="message-bubble">
                        <p>${this.formatMessage(content)}</p>
                    </div>
                    <div class="message-time">${timestamp}</div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <div class="avatar-circle">
                        <i class="fas fa-user"></i>
                    </div>
                </div>
                <div class="message-content">
                    <div class="message-bubble">
                        <p>${this.formatMessage(content)}</p>
                    </div>
                    <div class="message-time">${timestamp}</div>
                </div>
            `;
        }
        
        this.elements.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    formatMessage(content) {
        // Convert URLs to clickable links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return content.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    }
    
    showTypingIndicator() {
        this.elements.typingIndicator.classList.add('active');
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.elements.typingIndicator.classList.remove('active');
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
        }, 100);
    }
    
    autoResizeTextarea() {
        const textarea = this.elements.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    toggleVoiceInput() {
        if (!this.voiceEnabled) {
            this.showNotification('Voice features are disabled', 'info');
            return;
        }
        
        if (!this.recognition) {
            this.showNotification('Voice input not supported in this browser', 'error');
            return;
        }
        
        if (this.isListening) {
            this.stopVoiceInput();
        } else {
            this.startVoiceInput();
        }
    }
    
    startVoiceInput() {
        try {
            this.isListening = true;
            this.elements.voiceModal.classList.add('active');
            this.elements.voiceToggle.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            this.recognition.start();
        } catch (error) {
            console.error('Error starting voice input:', error);
            this.showNotification('Failed to start voice input', 'error');
        }
    }
    
    stopVoiceInput() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        this.isListening = false;
        this.elements.voiceModal.classList.remove('active');
        this.elements.voiceToggle.innerHTML = '<i class="fas fa-microphone"></i>';
    }
    
    speakMessage(message) {
        if (!this.synthesis) return;
        
        // Cancel any ongoing speech
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        // Try to use a more natural voice
        const voices = this.synthesis.getVoices();
        const preferredVoice = voices.find(voice => 
            voice.name.includes('Google') || 
            voice.name.includes('Microsoft') ||
            voice.name.includes('Natural')
        );
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        this.synthesis.speak(utterance);
    }
    
    clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            // Clear UI
            const messages = this.elements.chatMessages.querySelectorAll('.message:not(:first-child)');
            messages.forEach(msg => msg.remove());
            
            // Clear server-side history
            fetch('/api/chat/clear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sessionId: this.sessionId })
            });
            
            // Show suggestions again
            this.elements.inputSuggestions.style.display = 'flex';
            
            this.showNotification('Chat history cleared', 'success');
        }
    }
    
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });
        
        // Set background color based on type
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            info: '#3498db',
            warning: '#f39c12'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
}

// Initialize the chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AlfredChat();
});
