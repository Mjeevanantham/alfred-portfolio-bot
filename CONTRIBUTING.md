# Contributing to JIA Portfolio Bot

Thank you for your interest in contributing to JIA! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Git
- A Groq API key for testing

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/alfred-portfolio-bot.git
   cd alfred-portfolio-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Groq API key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🌟 Branch Strategy

We use a simplified Git Flow:

- **`main`**: Production-ready code
- **`develop`**: Integration branch for features
- **`feature/*`**: New features
- **`bugfix/*`**: Bug fixes
- **`hotfix/*`**: Critical production fixes

### Creating a Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

## 📝 Code Style

### JavaScript
- Use ES6+ features
- Follow async/await patterns
- Use meaningful variable names
- Add comments for complex logic

### CSS
- Use BEM methodology for class names
- Keep styles organized by component
- Use CSS custom properties for theming

### File Structure
```
routes/          # API endpoints
services/        # Business logic
public/          # Frontend assets
data/           # Data storage (gitignored)
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Chat functionality works
- [ ] Voice features work (if enabled)
- [ ] Admin panel authentication
- [ ] Resume upload and parsing
- [ ] Portfolio URL configuration
- [ ] Responsive design on mobile

### Testing Voice Features
- Test speech-to-text in Chrome/Edge
- Test text-to-speech responses
- Verify voice controls work properly

## 📋 Pull Request Process

1. **Create a feature branch** from `develop`
2. **Make your changes** following the code style
3. **Test thoroughly** using the checklist above
4. **Update documentation** if needed
5. **Create a pull request** to `develop`

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Manual testing completed
- [ ] Voice features tested (if applicable)
- [ ] Admin panel tested (if applicable)

## Screenshots (if applicable)
Add screenshots here
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment details**
   - Node.js version
   - Operating system
   - Browser (for frontend issues)

2. **Steps to reproduce**
   - Clear, numbered steps
   - Expected vs actual behavior

3. **Error messages**
   - Full error logs
   - Console output

## 💡 Feature Requests

For new features, please:

1. **Check existing issues** first
2. **Describe the use case** clearly
3. **Provide mockups** if applicable
4. **Consider implementation complexity**

## 🔒 Security

- **Never commit** API keys or passwords
- **Use environment variables** for sensitive data
- **Report security issues** privately to maintainers

## 📚 Documentation

- **Update README.md** for new features
- **Add code comments** for complex logic
- **Update API documentation** for new endpoints
- **Include examples** in documentation

## 🎯 Areas for Contribution

### High Priority
- [ ] Unit tests
- [ ] Error handling improvements
- [ ] Performance optimizations
- [ ] Mobile UI enhancements

### Medium Priority
- [ ] Docker support
- [ ] CI/CD pipeline
- [ ] Internationalization
- [ ] Theme customization

### Low Priority
- [ ] Additional AI models
- [ ] Plugin system
- [ ] Analytics integration
- [ ] Advanced voice features

## 🤝 Community Guidelines

- **Be respectful** and inclusive
- **Provide constructive feedback**
- **Help others** learn and grow
- **Follow the code of conduct**

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Email**: For security issues or private matters

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to JIA! 🤖

