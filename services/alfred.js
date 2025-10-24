const Groq = require('groq-sdk');
const { getRelevantContext, knowledgeBase } = require('./knowledgeBase');

class Alfred {
  constructor() {
    this.fallbackMode = process.env.ALFRED_FALLBACK_MODE === 'true';
    this.client = this.fallbackMode
      ? null
      : new Groq({
          apiKey: process.env.GROQ_API_KEY,
        });
    this.conversationHistory = new Map(); // Store conversation history per session
  }

  async processMessage(userMessage, sessionId) {
    try {
      // Get or create conversation history for this session
      if (!this.conversationHistory.has(sessionId)) {
        this.conversationHistory.set(sessionId, []);
      }
      
      const history = this.conversationHistory.get(sessionId);
      
      // Prepare/normalize user input to reduce noise
      const tunedUserMessage = this.normalizeUserMessage(userMessage);

      // Get relevant context from knowledge base
      const context = await getRelevantContext(tunedUserMessage);
      
      // Build system prompt for Alfred
      const systemPrompt = this.buildSystemPrompt(context);
      
      // Prepare messages for Groq API
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-10), // Keep last 10 messages for context
        { role: 'user', content: tunedUserMessage }
      ];
      
      // Decide on generation path (LLM or fallback)
      let response;
      if (!this.fallbackMode && this.client) {
        try {
          const completion = await this.client.chat.completions.create({
            messages: messages,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.5,
            max_tokens: 400,
            stream: false
          });
          response = completion.choices[0].message.content;
        } catch (llmError) {
          console.warn('LLM call failed, falling back to KB response:', llmError?.message || llmError);
          response = this.generateFallbackResponse(userMessage, context);
        }
      } else {
        response = this.generateFallbackResponse(userMessage, context);
      }
      
      // Update conversation history
      history.push(
        { role: 'user', content: tunedUserMessage },
        { role: 'assistant', content: response }
      );
      
      // Keep only last 20 messages to prevent memory issues
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }
      
      return {
        content: response,
        timestamp: new Date().toISOString(),
        context: context.length > 0 ? 'Used portfolio context' : 'General response',
        mode: this.fallbackMode ? 'fallback' : 'llm'
      };
      
    } catch (error) {
      console.error('Error in Alfred processMessage:', error);
      throw new Error('Failed to process message');
    }
  }
  
  normalizeUserMessage(message) {
    if (!message) return '';
    return message
      .replace(/\s+/g, ' ')
      .replace(/\b(show|see|read)\s+more\b/gi, '')
      .replace(/[“”]/g, '"')
      .replace(/[’]/g, "'")
      .trim();
  }

  generateFallbackResponse(userMessage, context) {
    const lower = (userMessage || '').toLowerCase();
    const bullets = [];
    const kb = knowledgeBase && knowledgeBase.data ? knowledgeBase.data : null;

    if (lower.includes('skill')) {
      const skills = kb?.skills?.length ? kb.skills.join(', ') : 'a strong set of modern development skills';
      bullets.push(`Key skills: ${skills}`);
    }

    if (lower.includes('project') || lower.includes('work') || lower.includes('portfolio')) {
      const projects = kb?.projects?.length ? kb.projects.slice(0, 3) : [];
      projects.forEach(p => bullets.push(p));
    }

    if (lower.includes('experience') || lower.includes('background') || lower.includes('career')) {
      const experience = kb?.experience?.length ? kb.experience.slice(0, 3) : [];
      experience.forEach(e => bullets.push(e));
    }

    // If nothing matched, use trimmed context
    if (bullets.length === 0) {
      const trimmed = (context || '').toString().slice(0, 400);
      if (trimmed) bullets.push(trimmed);
    }

    // Format as concise bullet points (max 5)
    const formatted = bullets
      .filter(Boolean)
      .slice(0, 5)
      .map(item => `- ${item}`)
      .join('\n');
    return formatted || "- I'm Alfred. Ask about Jeeva's skills, projects, or experience.";
  }
  
  buildSystemPrompt(context) {
    return `You are Alfred, Jeeva's personal AI assistant for his portfolio. You are knowledgeable, helpful, and professional.

ABOUT JEEVA:
${context}

PERSONALITY:
- You are sophisticated, intelligent, and slightly formal (like Alfred from Batman)
- You speak with confidence and expertise about Jeeva's work
- You're helpful but maintain professional boundaries
- You can be witty and engaging while staying professional

CAPABILITIES:
- Answer questions about Jeeva's projects, skills, and experience
- Provide insights about his work and achievements
- Help visitors understand his expertise and capabilities
- Discuss technology, programming, and development topics
- Share information about his professional background

GUIDELINES (STRICT):
- Always be accurate and base responses on the provided context
- Answer with 3-5 concise bullets, 80 words total max
- Bold key nouns or technologies when useful; avoid fluff
- Never include phrases like "Show more", "See more", or long preambles
- If you don't know something specific about Jeeva, say so briefly
- Use "I" when referring to yourself as Alfred; use "Jeeva" for the owner

Remember: You represent Jeeva's professional image, so maintain high standards in all interactions.`;
  }
  
  clearHistory(sessionId) {
    this.conversationHistory.delete(sessionId);
  }
}

module.exports = new Alfred();
