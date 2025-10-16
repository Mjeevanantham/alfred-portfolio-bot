const Groq = require('groq-sdk');
const { getRelevantContext } = require('./knowledgeBase');

class Alfred {
  constructor() {
    this.client = new Groq({
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
      
      // Get relevant context from knowledge base
      const context = await getRelevantContext(userMessage);
      
      // Build system prompt for Alfred
      const systemPrompt = this.buildSystemPrompt(context);
      
      // Prepare messages for Groq API
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-10), // Keep last 10 messages for context
        { role: 'user', content: userMessage }
      ];
      
      // Call Groq API
      const completion = await this.client.chat.completions.create({
        messages: messages,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      });
      
      const response = completion.choices[0].message.content;
      
      // Update conversation history
      history.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: response }
      );
      
      // Keep only last 20 messages to prevent memory issues
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }
      
      return {
        content: response,
        timestamp: new Date().toISOString(),
        context: context.length > 0 ? 'Used portfolio context' : 'General response'
      };
      
    } catch (error) {
      console.error('Error in Alfred processMessage:', error);
      throw new Error('Failed to process message');
    }
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

GUIDELINES:
- Always be accurate and base responses on the provided context
- If you don't know something specific about Jeeva, say so politely
- Keep responses concise but informative
- Use "I" when referring to yourself as Alfred
- Use "Jeeva" when referring to the portfolio owner
- Be encouraging about Jeeva's work and skills

Remember: You represent Jeeva's professional image, so maintain high standards in all interactions.`;
  }
  
  clearHistory(sessionId) {
    this.conversationHistory.delete(sessionId);
  }
}

module.exports = new Alfred();
