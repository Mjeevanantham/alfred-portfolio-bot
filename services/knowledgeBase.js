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
      // Default to Jeeva's live portfolio if not explicitly configured
      const portfolioUrl = process.env.PORTFOLIO_URL || 'https://www.jeevanantham.site';
      
      if (!portfolioUrl) {
        console.log('No portfolio URL configured, using sample data...');
        this.data.portfolio = this.getSamplePortfolioData();
        return;
      }
      
      // Scrape portfolio website
      const response = await axios.get(portfolioUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'JIA Portfolio Bot/1.0'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      // Extract relevant content
      const content = [];
      
      // Remove script and style elements
      $('script, style').remove();
      
      // Extract text from main content areas
      const MAIN_SELECTORS = 'main, .content, .portfolio, .about, .projects, .skills, section, article';
      $(MAIN_SELECTORS).each((i, el) => {
        const text = this.cleanText($(el).text());
        if (text.length > 50) content.push(text);
      });
      
      // If no main content found, extract from body
      if (content.length === 0) {
        $('body')
          .find('p, h1, h2, h3, h4, h5, h6, li')
          .each((i, el) => {
            const text = this.cleanText($(el).text());
            if (text.length > 20) content.push(text);
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
    const skillsText = String(this.data.resume || '') + ' ' + String(this.data.portfolio || '');
    const commonSkills = [
      // Core
      'JavaScript', 'TypeScript', 'Node.js', 'React', 'Next.js', 'NestJS',
      'Flutter', 'Dart', 'Redux', 'Redux Saga',
      // Styling / UI
      'HTML', 'CSS', 'SASS', 'SCSS', 'Tailwind CSS', 'Bootstrap',
      // Backend / APIs
      'Express.js', 'REST API', 'GraphQL', 'Microservices', 'RBAC',
      // Databases
      'MongoDB', 'PostgreSQL', 'MySQL', 'Prisma ORM', 'Redis', 'Firebase',
      // DevOps / Cloud
      'Docker', 'CI/CD', 'Server Deployment', 'AWS', 'Azure', 'Google Cloud',
      // Other
      'Git', 'GitHub', 'GitLab', 'Jenkins', 'ServiceNow', 'Performance Optimization'
    ];

    const containsFlexible = (haystack, skill) => {
      try {
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Allow optional whitespace between alphanumerics to handle OCR/formatting
        const pattern = escaped
          .split('')
          .map(ch => (/^[a-z0-9]$/i.test(ch) ? `${ch}\\s*` : ch))
          .join('');
        const re = new RegExp(pattern, 'i');
        return re.test(haystack);
      } catch (_) {
        return false;
      }
    };

    const foundSkills = [];
    const haystack = skillsText;
    commonSkills.forEach((skill) => {
      if (
        haystack.toLowerCase().includes(skill.toLowerCase()) ||
        containsFlexible(haystack, skill)
      ) {
        foundSkills.push(skill);
      }
    });

    return Array.from(new Set(foundSkills));
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
    
    const queryLower = (query || '').toString().toLowerCase();
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
      const resume = this.cleanText(this.data.resume).substring(0, 1000);
      const portfolio = this.cleanText(this.data.portfolio).substring(0, 1000);
      context = `Resume Summary: ${resume}...\n\n`;
      context += `Portfolio Summary: ${portfolio}...`;
    }
    
    return context;
  }

  /**
   * Remove UI filler like "Show more", trim whitespace, collapse spaces,
   * and strip repeated ellipses so the model doesn't echo them back.
   */
  cleanText(input) {
    if (!input) return '';
    let t = input
      .replace(/\s+/g, ' ')
      .replace(/\b(show|see|read)\s+more\b/gi, '')
      .replace(/\bview\s+more\b/gi, '')
      .replace(/…+/g, ' ')
      .replace(/\.\.\.+/g, ' ')
      .trim();
    // Remove isolated UI labels commonly found in portfolio templates
    t = t.replace(/^(back|menu|home|next|previous)$/gim, '').trim();
    return t;
  }

  getSampleResumeData() {
    return `NAME: Jeevanantham Mahalingam (Jeeva)
LOCATION: Coimbatore, Tamil Nadu, India
CONTACT: mjeevanantham04@gmail.com | +91 88078 25309 | www.jeevanantham.site
PROFILES: LinkedIn | GitHub

PROFILE SUMMARY
- Creative full‑stack developer building fast, user‑friendly web and mobile apps.
- Trusted problem‑solver delivering reliable, growth‑ready solutions and performance wins.

PROFESSIONAL EXPERIENCE
Aaludra Technology Solutions — Junior Software Engineer (Aug 2024 – Present)
Projects:
- HRMS System (Next.js): Strengthened frontend with Next.js + Redux; created reusable components for smoother UX.
- Static Website (HTML/CSS/JS/PHP): Delivered a responsive, user‑friendly site with 100 Lighthouse SEO in 15 days.
- Ticketing Tool (Next.js): Pixel‑perfect responsive UI; improved load times with lazy loading and dynamic imports.
- Customer Food Delivery App (Flutter/Dart): OTP login, real‑time tracking, wallet payments; added API rate limiting.

Aaludra Technology Solutions — Software Engineer Intern (Oct 2023 – Aug 2024)
Focus:
- Advanced from HTML/CSS/JS to Node.js; built scalable systems with performance focus.
- Hands‑on deployments with Docker and cloud; improved production reliability.
- Wrote clean, maintainable code to reduce technical debt; trained in ServiceNow.
Projects:
- Recruitment Platform (Node.js): Primary backend dev; robust REST API for candidates and employers.
- eSim SaaS (NestJS): Optimized queries and APIs (~30% faster); tenant‑aware time formatting; dynamic tenant emails.
- CRM System (NestJS + Docker): Real‑time Employee/Opportunity GraphQL API; led Dockerization and RBAC design.

ACHIEVEMENTS
- 50+ APIs powering CRM systems for 500+ users.
- 6+ production modules deployed, reliable and scalable.

TECHNICAL SKILLS
- Languages/Frameworks: Node.js, NestJS, Next.js, React, Flutter, Dart, JavaScript, TypeScript, HTML, CSS, SCSS, Redux, Saga, GraphQL
- Databases & ORM: MongoDB, PostgreSQL, Prisma ORM
- Cloud & DevOps: Docker, Server Deployment, CI/CD
- Capabilities: REST API Development, Microservices, Performance Optimization, Code Quality

ADDITIONAL
- Skills: Java (Intermediate), ServiceNow (Intermediate), Computer Networking (Intermediate), Figma (Beginner)
- Languages: English (Fluent), Tamil (Native)

EDUCATION
Bachelor of Technology, Computer Science and Business Systems — 7.8 GPA
Bannari Amman Institute of Technology (Anna University) (2020–2024)`;
  }

  getSamplePortfolioData() {
    return `Jeeva's Portfolio — www.jeevanantham.site

ABOUT
- Full‑stack & Flutter developer focused on clean architecture and performance.
- Builds scalable web/mobile apps; collaborates closely with stakeholders.

HIGHLIGHTS
- 50+ APIs shipped; 6+ production modules; ~30% API performance gains.
- Tech: Next.js, React, TypeScript, Node.js, NestJS, GraphQL, Flutter, Dart, PostgreSQL, MongoDB, Prisma, Docker.

CONTACT
Email: mjeevanantham04@gmail.com | Phone: +91 88078 25309 | Site: www.jeevanantham.site`;
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
