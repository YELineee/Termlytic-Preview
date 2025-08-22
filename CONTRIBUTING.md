# Contributing to Termlytic

Thank you for considering contributing to Termlytic! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Setup Development Environment

1. Fork and clone the repository:
```bash
git clone https://github.com/yourusername/ViscmdTE.git
cd ViscmdTE
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## 🛠️ Development Workflow

### Project Structure
```
src/
├── main/           # Electron main process
├── renderer/       # Vue.js frontend
└── preload/       # Electron preload scripts
```

### Available Scripts
- `npm run dev` - Start development with hot reload
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Code Style
- Use ESLint and Prettier configurations provided
- Follow Vue 3 Composition API patterns
- Use TypeScript where beneficial
- Write meaningful commit messages

## 📝 Contributing Guidelines

### Bug Reports
1. Check existing issues first
2. Use the bug report template
3. Include steps to reproduce
4. Provide system information

### Feature Requests
1. Check if feature already exists or is planned
2. Describe the use case clearly
3. Explain why it would be valuable

### Pull Requests
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Commit with descriptive messages
6. Push to your fork
7. Open a pull request

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 🧪 Testing

### Shell Configuration Testing
When contributing shell parsing features:
1. Test with multiple shell configurations
2. Verify timestamp parsing accuracy
3. Test with large history files
4. Ensure cross-platform compatibility

### UI Testing
1. Test responsive design
2. Verify dark theme consistency
3. Check accessibility
4. Test with different data sets

## 📋 Areas for Contribution

### High Priority
- [ ] Additional shell support (PowerShell, etc.)
- [ ] Performance optimizations
- [ ] Data export features
- [ ] Accessibility improvements

### Medium Priority
- [ ] Additional chart types
- [ ] Keyboard shortcuts
- [ ] Plugin system
- [ ] Command prediction features

### Documentation
- [ ] API documentation
- [ ] User guides
- [ ] Video tutorials
- [ ] Translation improvements

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow the code of conduct

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🆘 Getting Help

- Open an issue for bugs or feature requests
- Join discussions in GitHub Discussions
- Check existing documentation
- Review the codebase for examples

Thank you for contributing to Termlytic! 🎉
