const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const pdfParse = require('pdf-parse');

class KnowledgeBase {
  constructor() {
    this.data = {
      resume: '',
      portfolio: '',
      projects: [],
      skills: [],
      experience: []
    };
    this.initialized = false;
  }

  async initialize() {
    try {
      console.log('Initializing knowledge base...');
      
      // Load resume data
      await this.loadResumeData();
      
      // Load portfolio data
      await this.loadPortfolioData();
      
      // Parse and structure the data
      this.parseData();
      
      this.initialized = true;
      console.log('Knowledge base initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize knowledge base:', error);
      // Continue with empty data rather than failing
      this.initialized = true;
    }
  }

  async loadResumeData() {
    try {
      const resumePath = path.join(__dirname, '../data/resume.pdf');
      
      // Check if resume file exists
      try {
        await fs.access(resumePath);
      } catch {
        console.log('No resume file found, creating sample data...');
        this.data.resume = this.getSampleResumeData();
        return;
      }
      
      // Read and parse PDF
      const dataBuffer = await fs.readFile(resumePath);
      const pdfData = await pdfParse(dataBuffer);
      this.data.resume = pdfData.text;
      
    } catch (error) {
      console.error('Error loading resume:', error);
      this.data.resume = this.getSampleResumeData();
    }
  }

  async loadPortfolioData() {
    try {
      const portfolioUrl = process.env.PORTFOLIO_URL;
      
      if (!portfolioUrl) {
        console.log('No portfolio URL configured, using sample data...');
        this.data.portfolio = this.getSamplePortfolioData();
        return;
      }
      
      // Scrape portfolio website
      const response = await axios.get(portfolioUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Alfred Portfolio Bot/1.0'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      // Extract relevant content
      const content = [];
      
      // Remove script and style elements
      $('script, style').remove();
      
      // Extract text from main content areas
      $('main, .content, .portfolio, .about, .projects, .skills').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 50) {
          content.push(text);
        }
      });
      
      // If no main content found, extract from body
      if (content.length === 0) {
        $('body').find('p, h1, h2, h3, h4, h5, h6, li').each((i, el) => {
          const text = $(el).text().trim();
          if (text.length > 20) {
            content.push(text);
          }
        });
      }
      
      this.data.portfolio = content.join('\n\n');
      
    } catch (error) {
      console.error('Error loading portfolio:', error);
      this.data.portfolio = this.getSamplePortfolioData();
    }
  }

  parseData() {
    // Extract skills from resume and portfolio
    this.data.skills = this.extractSkills();
    
    // Extract projects
    this.data.projects = this.extractProjects();
    
    // Extract experience
    this.data.experience = this.extractExperience();
  }

  extractSkills() {
    const skillsText = this.data.resume + ' ' + this.data.portfolio;
    const commonSkills = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'C#',
      'HTML', 'CSS', 'SASS', 'SCSS', 'Bootstrap', 'Tailwind CSS',
      'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase',
      'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
      'Git', 'GitHub', 'GitLab', 'CI/CD', 'Jenkins',
      'Express.js', 'Next.js', 'Vue.js', 'Angular', 'Svelte',
      'REST API', 'GraphQL', 'WebSocket', 'Microservices',
      'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch'
    ];
    
    const foundSkills = [];
    commonSkills.forEach(skill => {
      if (skillsText.toLowerCase().includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    });
    
    return foundSkills;
  }

  extractProjects() {
    // Simple project extraction - can be enhanced
    const projects = [];
    const text = this.data.resume + ' ' + this.data.portfolio;
    
    // Look for project patterns
    const projectRegex = /(?:project|app|website|application|system)[\s\S]{0,200}?(?:built|developed|created|designed)[\s\S]{0,300}/gi;
    const matches = text.match(projectRegex);
    
    if (matches) {
      matches.forEach(match => {
        if (match.length > 50) {
          projects.push(match.trim());
        }
      });
    }
    
    return projects.slice(0, 5); // Limit to 5 projects
  }

  extractExperience() {
    // Simple experience extraction
    const experience = [];
    const text = this.data.resume + ' ' + this.data.portfolio;
    
    // Look for experience patterns
    const expRegex = /(?:worked|experience|position|role)[\s\S]{0,200}?(?:at|in|for)[\s\S]{0,300}/gi;
    const matches = text.match(expRegex);
    
    if (matches) {
      matches.forEach(match => {
        if (match.length > 50) {
          experience.push(match.trim());
        }
      });
    }
    
    return experience.slice(0, 3); // Limit to 3 experiences
  }

  getRelevantContext(query) {
    if (!this.initialized) {
      return 'Knowledge base not yet initialized.';
    }
    
    const queryLower = query.toLowerCase();
    let context = '';
    
    // Check for skill-related queries
    if (queryLower.includes('skill') || queryLower.includes('technology') || queryLower.includes('tech')) {
      context += `Skills: ${this.data.skills.join(', ')}\n\n`;
    }
    
    // Check for project-related queries
    if (queryLower.includes('project') || queryLower.includes('work') || queryLower.includes('portfolio')) {
      if (this.data.projects.length > 0) {
        context += `Projects:\n${this.data.projects.join('\n\n')}\n\n`;
      }
    }
    
    // Check for experience-related queries
    if (queryLower.includes('experience') || queryLower.includes('background') || queryLower.includes('career')) {
      if (this.data.experience.length > 0) {
        context += `Experience:\n${this.data.experience.join('\n\n')}\n\n`;
      }
    }
    
    // Always include general resume/portfolio context for broader queries
    if (context === '') {
      context = `Resume Summary: ${this.data.resume.substring(0, 1000)}...\n\n`;
      context += `Portfolio Summary: ${this.data.portfolio.substring(0, 1000)}...`;
    }
    
    return context;
  }

  getSampleResumeData() {
    return `JEEVA - SOFTWARE DEVELOPER

EXPERIENCE:
- Senior Software Developer at TechCorp (2022-Present)
  • Developed full-stack web applications using React, Node.js, and MongoDB
  • Led a team of 5 developers in building scalable microservices
  • Implemented CI/CD pipelines using Docker and Kubernetes

- Software Developer at StartupXYZ (2020-2022)
  • Built responsive web applications using modern JavaScript frameworks
  • Collaborated with design team to create intuitive user interfaces
  • Optimized application performance resulting in 40% faster load times

SKILLS:
- Frontend: React, Vue.js, TypeScript, HTML5, CSS3, Tailwind CSS
- Backend: Node.js, Express.js, Python, Django, FastAPI
- Databases: MongoDB, PostgreSQL, Redis
- Cloud: AWS, Google Cloud Platform, Docker, Kubernetes
- Tools: Git, GitHub, Jenkins, VS Code, Figma

EDUCATION:
- Bachelor of Computer Science, University of Technology (2018-2022)
- Relevant Coursework: Data Structures, Algorithms, Software Engineering

PROJECTS:
- E-commerce Platform: Full-stack application with React frontend and Node.js backend
- Task Management App: Real-time collaborative tool with WebSocket integration
- Data Visualization Dashboard: Interactive charts using D3.js and React`;
  }

  getSamplePortfolioData() {
    return `Welcome to Jeeva's Portfolio

ABOUT ME:
I'm a passionate software developer with 4+ years of experience building scalable web applications. I specialize in full-stack development with a focus on modern JavaScript frameworks and cloud technologies.

MY WORK:
- Built 20+ web applications serving thousands of users
- Expertise in React, Node.js, and cloud deployment
- Passionate about clean code and user experience
- Open source contributor and tech blogger

RECENT PROJECTS:
1. E-commerce Platform - A full-featured online store with payment integration
2. Task Management App - Collaborative project management tool
3. Data Analytics Dashboard - Real-time data visualization platform

TECHNOLOGIES:
Frontend: React, Vue.js, TypeScript, HTML5, CSS3
Backend: Node.js, Python, Express.js, Django
Database: MongoDB, PostgreSQL, Redis
Cloud: AWS, Google Cloud, Docker, Kubernetes

CONTACT:
Ready to discuss your next project or collaboration opportunities.`;
  }
}

const knowledgeBase = new KnowledgeBase();

async function initializeKnowledgeBase() {
  await knowledgeBase.initialize();
}

function getRelevantContext(query) {
  return knowledgeBase.getRelevantContext(query);
}

module.exports = {
  initializeKnowledgeBase,
  getRelevantContext,
  knowledgeBase
};
