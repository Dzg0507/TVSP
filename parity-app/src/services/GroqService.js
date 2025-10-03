import axios from 'axios';

class GroqService {
  constructor() {
    // Groq API configuration
    this.apiKey = process.env.GROQ_API_KEY || 'your-groq-api-key-here';
    this.baseURL = 'https://api.groq.com/openai/v1';
    this.model = 'gemma2-9b-it'; // Google's Gemma2 model - fast and efficient
    
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    this.isInitialized = false;
    
    // Mrs. Sebiv Doog's personality and background
    this.coachPersonality = `You are Dr. Sebiv Doog, a warm and experienced relationship therapist with 25+ years of helping couples communicate better. 

Your Background:
- PhD in Clinical Psychology from Stanford University
- Specialized in Emotionally Focused Therapy (EFT) and Gottman Method
- Author of "Love Languages in the Digital Age" 
- Known for your direct but compassionate approach
- You believe every relationship can be strengthened through better communication

Your Speaking Style:
- Warm, empathetic, but refreshingly direct
- Use practical examples and actionable advice
- Often reference real relationship scenarios
- Balance validation with gentle challenges
- End responses with specific action steps

Your Core Principles:
1. Listen with your heart, not just your ears
2. Speak from love, not from hurt
3. Every conflict is an opportunity for deeper connection
4. Small changes in communication create big relationship shifts
5. Empathy is a skill that can be learned and practiced

Always respond as Dr. Sebiv Doog would - with wisdom, warmth, and practical guidance.`;
  }

  async initialize() {
    try {
      if (this.isInitialized) return true;

      // Test API connection
      console.log('🤖 Initializing Mrs. Sebiv Doog with Groq...');
      
      const testResponse = await this.axiosInstance.post('/chat/completions', {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.coachPersonality
          },
          {
            role: 'user',
            content: 'Hello, are you ready to help couples communicate better?'
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      });

      if (testResponse.data && testResponse.data.choices) {
        this.isInitialized = true;
        console.log('✅ Mrs. Sebiv Doog is ready to coach with Groq!');
        return true;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.log('Groq API test failed, using fallback mode:', error.message);
      console.log('Error details:', error.response?.data || 'No response data');
      this.isInitialized = true; // Still allow fallback mode
      return false;
    }
  }

  async getCoachingResponse(userMessage, conversationContext = {}) {
    try {
      console.log('🤖 GroqService: Getting coaching response for:', userMessage);
      
      await this.initialize();

      const contextInfo = this.buildContextPrompt(conversationContext);
      
      const coachingPrompt = `${contextInfo}

User's Message: "${userMessage}"

Please provide a brief, warm response as Dr. Sebiv Doog (2-3 sentences max).

Just give your empathetic, conversational response. Be supportive and caring.

Do NOT include empathy scores, tips, suggestions, bullet points, or any formatting in your response - just natural conversation.`;

      console.log('🚀 Making API call to Groq...');

      const response = await this.axiosInstance.post('/chat/completions', {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.coachPersonality
          },
          {
            role: 'user',
            content: coachingPrompt
          }
        ],
        max_tokens: 200,
        temperature: 0.8,
        stream: false
      });

      console.log('✅ Got response from Groq:', response.data);

      const responseText = response.data.choices[0]?.message?.content || '';
      console.log('📝 Response text:', responseText);
      
      const parsedResponse = this.parseCoachingResponse(responseText, userMessage);
      console.log('🎯 Parsed response:', parsedResponse);
      
      return parsedResponse;
    } catch (error) {
      console.error('❌ Error getting Groq coaching response:', error.message);
      console.log('Error details:', error.response?.data || 'No response data');
      console.log('Status:', error.response?.status);
      
      const fallback = this.getFallbackCoaching(userMessage, conversationContext);
      console.log('🔄 Using fallback:', fallback);
      return fallback;
    }
  }

  buildContextPrompt(conversationContext) {
    const {
      partnerName = 'your partner',
      empathyScore = 75,
      relationshipHealth = 80,
      partnerEmotion = 'neutral',
      recentMessages = [],
      currentMessage = ''
    } = conversationContext;

    return `Context for this coaching session:
- Partner: ${partnerName}
- Current relationship health: ${relationshipHealth}%
- Recent conversation tone: ${partnerEmotion}
- Previous empathy score: ${empathyScore}%
${recentMessages.length > 0 ? `- Recent conversation: ${recentMessages.slice(-2).map(m => `${m.sender}: ${m.text}`).join(', ')}` : ''}
${currentMessage ? `- Current message being composed: "${currentMessage}"` : ''}`;
  }

  parseCoachingResponse(responseText, userMessage) {
    // Clean the response text by removing any empathy scores that might have leaked through
    const cleanedMessage = responseText
      .replace(/empathy score:?\s*\d+%?/gi, '')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    // Generate empathy score using our own analysis
    const empathyAnalysis = this.analyzeEmpathy(userMessage);
    const suggestions = this.extractSuggestions(userMessage);

    return {
      message: cleanedMessage,
      empathyAnalysis: {
        score: empathyAnalysis.score,
        emotion: empathyAnalysis.emotion,
        suggestions: suggestions.slice(0, 2) // Limit to 2 suggestions
      },
      suggestions: suggestions,
      actionItems: this.extractActionItems(cleanedMessage)
    };
  }

  extractSuggestions(userMessage) {
    // Generate contextual suggestions based on the user's message content
    const suggestions = [];
    const lowerMessage = userMessage.toLowerCase();
    
    // Analyze the user's message to provide relevant tips
    if (lowerMessage.includes('you always') || lowerMessage.includes('you never')) {
      suggestions.push("Try starting with 'I feel...' instead of 'You always...'");
      suggestions.push("Focus on specific behaviors rather than generalizations");
    } else if (lowerMessage.includes('angry') || lowerMessage.includes('frustrated')) {
      suggestions.push("Take a deep breath before responding");
      suggestions.push("Acknowledge their feelings first");
    } else if (lowerMessage.includes('sorry') || lowerMessage.includes('understand')) {
      suggestions.push("Great job showing empathy! Keep it up");
      suggestions.push("Ask 'How can I support you better?'");
    } else {
      suggestions.push("Consider acknowledging their feelings first");
      suggestions.push("Ask 'Can you tell me more about that?'");
    }
    
    return suggestions.slice(0, 2); // Limit to 2 suggestions max
  }

  extractActionItems(text) {
    const actionItems = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().includes('action') || 
          trimmed.toLowerCase().includes('next step') ||
          trimmed.toLowerCase().includes('right now')) {
        actionItems.push(trimmed);
      }
    }
    
    return actionItems;
  }

  determineEmotion(empathyScore) {
    if (empathyScore >= 80) return 'empathetic';
    if (empathyScore >= 60) return 'understanding';
    if (empathyScore >= 40) return 'neutral';
    if (empathyScore >= 20) return 'defensive';
    return 'hostile';
  }

  // Fallback coaching when API is unavailable
  getFallbackCoaching(userMessage, conversationContext) {
    const empathyAnalysis = this.analyzeEmpathy(userMessage);
    
    let coachingMessage = "I can sense you're working on your communication, and that's wonderful! ";
    
    if (empathyAnalysis.score < 60) {
      coachingMessage += "I notice this message might come across as a bit defensive. Try starting with 'I feel...' instead of 'You always...' to create more connection.";
    } else if (empathyAnalysis.score > 80) {
      coachingMessage += "Beautiful! Your message shows real empathy and understanding. Your partner will feel heard and valued.";
    } else {
      coachingMessage += "This is a good start. To make it even more connecting, try acknowledging your partner's feelings first before sharing your own perspective.";
    }

    return {
      message: coachingMessage,
      empathyAnalysis,
      suggestions: empathyAnalysis.suggestions,
      actionItems: ['Practice active listening', 'Use "I" statements', 'Validate their feelings first']
    };
  }

  analyzeEmpathy(message) {
    const empathyKeywords = [
      'i understand', 'i hear you', 'i feel', 'i see', 'i appreciate',
      'thank you', 'i love', 'i care', 'i value', 'i respect',
      'i notice', 'i realize', 'i acknowledge', 'i recognize', 'i get it',
      'that makes sense', 'i can imagine', 'i empathize', 'i relate'
    ];
    
    const defensiveKeywords = [
      'you always', 'you never', 'you should', 'you need to', 'you have to',
      'that\'s wrong', 'that\'s stupid', 'whatever', 'fine', 'i don\'t care',
      'you\'re being', 'you make me', 'it\'s your fault', 'you did this',
      'you\'re so', 'typical', 'here we go again', 'not my problem'
    ];

    let score = 70; // Base score
    let suggestions = [];
    let emotion = 'neutral';

    const lowerCaseMessage = message.toLowerCase();

    // Check for empathy
    let empathyCount = 0;
    empathyKeywords.forEach(keyword => {
      if (lowerCaseMessage.includes(keyword)) {
        empathyCount++;
      }
    });

    // Check for defensiveness
    let defensiveCount = 0;
    defensiveKeywords.forEach(keyword => {
      if (lowerCaseMessage.includes(keyword)) {
        defensiveCount++;
      }
    });

    if (empathyCount > defensiveCount) {
      score = Math.min(100, score + empathyCount * 10);
      emotion = 'empathetic';
      suggestions.push("Great job showing empathy!");
    } else if (defensiveCount > empathyCount) {
      score = Math.max(0, score - defensiveCount * 15);
      emotion = 'defensive';
      suggestions.push("Consider rephrasing to reduce defensiveness.");
    }

    // Specific patterns
    if (lowerCaseMessage.includes("i feel")) {
      score = Math.min(100, score + 5);
      suggestions.push("Using 'I feel' statements is excellent for expressing your emotions.");
    }
    if (lowerCaseMessage.includes("you always") || lowerCaseMessage.includes("you never")) {
      score = Math.max(0, score - 10);
      suggestions.push("Avoid generalizations like 'always' or 'never'. Focus on specific behaviors.");
    }

    return { score, emotion, suggestions };
  }
}

export default new GroqService();
