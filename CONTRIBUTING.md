# Contributing to Confidential Surgery Scheduler

Thank you for your interest in contributing to the Confidential Surgery Scheduler project! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Environment details** (OS, Node version, network)
- **Code samples** if applicable

### Suggesting Enhancements

Enhancement suggestions are welcome! Please create an issue with:

- **Clear description** of the enhancement
- **Use case** explaining why it's useful
- **Possible implementation** approach if you have ideas

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Add tests** for any new functionality
4. **Update documentation** as needed
5. **Ensure all tests pass** (`npm test`)
6. **Submit a pull request** with a clear description

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/fhevm-surgery-scheduler.git
cd fhevm-surgery-scheduler

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Run tests
npm test

# Compile contracts
npm run compile
```

## Coding Standards

### Solidity

- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use clear, descriptive function and variable names
- Add NatSpec comments for all public functions
- Include `@dev` comments for complex logic
- Keep functions focused and modular

### TypeScript

- Use TypeScript strict mode
- Follow consistent naming conventions
- Add JSDoc comments for complex functions
- Use async/await instead of promises
- Handle errors appropriately

### Testing

- Write comprehensive tests for new features
- Include both positive and negative test cases
- Test edge cases and error conditions
- Maintain >95% code coverage
- Use descriptive test names

### Documentation

- Update README.md for new features
- Add inline comments for complex logic
- Include code examples where helpful
- Keep documentation accurate and up-to-date

## Commit Message Guidelines

Use clear, descriptive commit messages:

```
feat: add emergency cancellation function
fix: resolve slot capacity overflow issue
docs: update deployment instructions
test: add tests for multi-surgeon workflow
refactor: optimize gas usage in assignment processing
```

### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test additions or modifications
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Maintenance tasks

## Testing Requirements

All pull requests must:

- Pass all existing tests
- Include tests for new functionality
- Maintain or improve code coverage
- Pass linting checks

Run the full test suite:

```bash
npm test
npm run gas-report
npm run coverage
```

## Documentation Requirements

Update documentation for:

- New functions or features
- Changed behavior
- New dependencies
- Configuration changes
- Deployment procedures

## Security Considerations

When contributing:

- Never commit private keys or sensitive data
- Follow security best practices
- Report security vulnerabilities privately
- Consider gas optimization
- Test access control thoroughly

## Pull Request Process

1. **Update your fork** with the latest from `main`
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with clear commits
4. **Push to your fork**: `git push origin feature/amazing-feature`
5. **Open a pull request** with:
   - Clear title and description
   - Reference to related issues
   - List of changes made
   - Test coverage information
6. **Address review feedback** promptly
7. **Squash commits** if requested
8. **Wait for approval** from maintainers

## Review Process

Pull requests are reviewed for:

- **Functionality**: Does it work as intended?
- **Code quality**: Is it well-written and maintainable?
- **Testing**: Are there adequate tests?
- **Documentation**: Is it properly documented?
- **Security**: Are there any security concerns?
- **Gas efficiency**: Is it optimized for gas usage?

## Community

- Ask questions in GitHub Discussions
- Join our Discord community (if available)
- Follow project updates
- Help others in the community

## Recognition

Contributors will be recognized in:

- README.md acknowledgments
- Release notes
- Project documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to:

- Open an issue for questions
- Start a discussion on GitHub
- Contact maintainers directly

Thank you for contributing to Confidential Surgery Scheduler! Your efforts help make privacy-preserving healthcare technology accessible to everyone.

---

**Built for the Zama Bounty Track December 2025**
