// Chatbot functionality with Google Gemini API integration
class Chatbot {
  constructor() {
    this.apiKey = '';
    this.apiUrl = '';
    this.isOpen = false;
    this.isLoading = false;
    this.conversationHistory = [];
    
    this.init();
  }

  init() {
    // Check if user is logged in before showing chatbot
    if (!this.isUserLoggedIn()) {
      return;
    }

    this.createChatbotElements();
    this.bindEvents();
    this.showChatbot();
  }

  isUserLoggedIn() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return user && user._id;
  }

  createChatbotElements() {
    // Load chatbot HTML component
    this.loadChatbotComponent();
  }

  async loadChatbotComponent() {
    try {
      const response = await fetch('./components/chatbot.html');
      const html = await response.text();
      
      // Create container and insert HTML
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);
      
      // Initialize elements after DOM insertion
      setTimeout(() => {
        this.initializeElements();
      }, 100);
    } catch (error) {
      console.error('Failed to load chatbot component:', error);
    }
  }

  initializeElements() {
    this.container = document.getElementById('chatbot-container');
    this.toggle = document.getElementById('chatbot-toggle');
    this.window = document.getElementById('chatbot-window');
    this.chatIcon = document.getElementById('chat-icon');
    this.closeIcon = document.getElementById('close-icon');
    this.minimizeBtn = document.getElementById('minimize-chat');
    this.messagesContainer = document.getElementById('chat-messages');
    this.input = document.getElementById('chat-input');
    this.sendBtn = document.getElementById('send-message');
    this.loadingIndicator = document.getElementById('chat-loading');

    if (this.container) {
      this.bindEvents();
    }
  }

  bindEvents() {
    if (!this.toggle || !this.input || !this.sendBtn) return;

    // Toggle chat window
    this.toggle.addEventListener('click', () => this.toggleChat());
    this.minimizeBtn?.addEventListener('click', () => this.toggleChat());

    // Send message events
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Input validation
    this.input.addEventListener('input', () => {
      const hasText = this.input.value.trim().length > 0;
      this.sendBtn.disabled = !hasText || this.isLoading;
      this.sendBtn.style.opacity = hasText && !this.isLoading ? '1' : '0.5';
    });

    // Close chat when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.container.contains(e.target)) {
        // Don't close if clicking on other UI elements
        if (!e.target.closest('.modal, .dropdown, .popup')) {
          // this.toggleChat();
        }
      }
    });
  }

  showChatbot() {
    if (this.container) {
      this.container.classList.remove('hidden');
    }
  }

  toggleChat() {
    if (!this.window || !this.chatIcon || !this.closeIcon) return;

    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      this.window.classList.remove('hidden');
      this.chatIcon.classList.add('hidden');
      this.closeIcon.classList.remove('hidden');
      this.input?.focus();
    } else {
      this.window.classList.add('hidden');
      this.chatIcon.classList.remove('hidden');
      this.closeIcon.classList.add('hidden');
    }
  }

  async sendMessage() {
    const message = this.input.value.trim();
    if (!message || this.isLoading) return;

    // Add user message to chat
    this.addMessage(message, 'user');
    this.input.value = '';
    this.sendBtn.disabled = true;
    this.sendBtn.style.opacity = '0.5';

    // Show loading
    this.setLoading(true);

    try {
      // Get AI response
      const response = await this.getAIResponse(message);
      this.addMessage(response, 'bot');
    } catch (error) {
      console.error('Error getting AI response:', error);
      this.addMessage('Sorry, I encountered an error. Please try again later.', 'bot');
    } finally {
      this.setLoading(false);
    }
  }

  addMessage(text, sender) {
    if (!this.messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `flex items-start space-x-2 ${sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`;

    const avatar = document.createElement('div');
    avatar.className = `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
      sender === 'user' 
        ? 'bg-green-600 text-white' 
        : 'bg-blue-600 text-white'
    }`;

    const avatarIcon = sender === 'user' 
      ? '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>'
      : '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L3 6v6c0 5.55 3.84 9.739 9 9.899 5.16-.16 9-4.349 9-9.899V6l-7-4z"/></svg>';
    
    avatar.innerHTML = avatarIcon;

    const bubble = document.createElement('div');
    bubble.className = `p-3 rounded-lg shadow-sm max-w-xs break-words ${
      sender === 'user' 
        ? 'bg-blue-600 text-white' 
        : 'bg-white text-gray-700 border border-gray-200'
    }`;
    bubble.innerHTML = this.formatMessage(text);

    if (sender === 'user') {
      messageDiv.appendChild(bubble);
      messageDiv.appendChild(avatar);
    } else {
      messageDiv.appendChild(avatar);
      messageDiv.appendChild(bubble);
    }

    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  formatMessage(text) {
    // Basic formatting: convert line breaks and make links clickable
    return text
      .replace(/\n/g, '<br>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="underline">$1</a>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }

  async getAIResponse(message) {
    // Add current message to conversation history
    this.conversationHistory.push({ role: 'user', parts: [{ text: message }] });

    // Get user context for personalized responses
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userName = user?.name?.split(' ')[0] || 'there';

    // Create system context for e-commerce
    const systemContext = `You are a helpful AI assistant for an e-commerce platform. The user's name is ${userName}. 
    You can help with:
    - Product recommendations and search
    - Order assistance and tracking
    - Shopping guidance and comparisons
    - General e-commerce questions
    - Account and technical support
    
    Keep responses concise, friendly, and helpful. If you don't know specific information about orders or products, 
    suggest the user contact customer support or check their account dashboard.`;

    const requestBody = {
      contents: [
        { role: 'user', parts: [{ text: systemContext }] },
        ...this.conversationHistory.slice(-10) // Keep last 10 messages for context
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 300,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };

    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        // Add AI response to conversation history
        this.conversationHistory.push({ role: 'model', parts: [{ text: aiResponse }] });
        
        return aiResponse;
      } else if (data.candidates && data.candidates[0] && data.candidates[0].finishReason === 'SAFETY') {
        return "I apologize, but I can't provide a response to that message. Please try asking something else about our products or services.";
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('API Error:', error);
      if (error.message.includes('400')) {
        return "I'm having trouble understanding your request. Could you please rephrase your question?";
      } else if (error.message.includes('403')) {
        return "I'm currently experiencing technical difficulties. Please try again later.";
      } else {
        throw error;
      }
    }
  }

  setLoading(loading) {
    this.isLoading = loading;
    
    if (this.loadingIndicator) {
      this.loadingIndicator.classList.toggle('hidden', !loading);
    }
    
    if (this.sendBtn) {
      this.sendBtn.disabled = loading || this.input.value.trim().length === 0;
      this.sendBtn.style.opacity = loading ? '0.5' : '1';
    }
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  // Public method to clear conversation
  clearConversation() {
    this.conversationHistory = [];
    if (this.messagesContainer) {
      // Keep only the welcome message
      const welcomeMessage = this.messagesContainer.children[0];
      this.messagesContainer.innerHTML = '';
      if (welcomeMessage) {
        this.messagesContainer.appendChild(welcomeMessage);
      }
    }
  }

  // Public method to destroy chatbot
  destroy() {
    if (this.container) {
      this.container.remove();
    }
  }
}

// Initialize chatbot when DOM is loaded
let chatbot;

function initializeChatbot() {
  // Only initialize if user is logged in
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (user && user._id) {
    if (!chatbot) {
      chatbot = new Chatbot();
    }
  } else {
    // Destroy chatbot if user logs out
    if (chatbot) {
      chatbot.destroy();
      chatbot = null;
    }
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initializeChatbot);

// Re-initialize when user logs in/out
window.addEventListener('storage', (e) => {
  if (e.key === 'currentUser') {
    initializeChatbot();
  }
});

// Export for external access
window.chatbot = chatbot;
