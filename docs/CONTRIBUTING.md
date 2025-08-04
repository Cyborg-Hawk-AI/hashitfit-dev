
# Contributing Guide
## Hashim - AI-Powered Personal Fitness Trainer

Thank you for your interest in contributing to Hashim! This guide will help you get started with contributing to our AI-powered fitness application.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:
- **Node.js** (v18 or higher)
- **Git** for version control
- **Supabase account** for backend services
- **Code editor** (VS Code recommended)
- **Basic knowledge** of React, TypeScript, and Tailwind CSS

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/hashim-fitness.git
   cd hashim-fitness
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   - Create Supabase project
   - Configure environment variables
   - Run database migrations

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📋 Ways to Contribute

### 🐛 Bug Reports

**Before submitting:**
- Search existing issues to avoid duplicates
- Test with latest version
- Gather system information

**Include in your report:**
- Clear, descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots or videos if applicable
- Device/browser information
- Console errors or logs

**Bug Report Template:**
```markdown
**Bug Description**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- Device: [e.g. iPhone 12, Desktop]
- OS: [e.g. iOS 15, Windows 11]
- Browser: [e.g. Safari, Chrome]
- App Version: [e.g. 1.2.0]

**Additional Context**
Any other context about the problem.
```

### ✨ Feature Requests

**Before requesting:**
- Check if feature already exists
- Search existing feature requests
- Consider if it fits project scope

**Include in your request:**
- Clear problem statement
- Proposed solution
- Alternative solutions considered
- Use cases and benefits
- Mockups or examples (if applicable)

### 💻 Code Contributions

#### Types of Contributions Welcome
- **Bug fixes** - Resolve existing issues
- **Feature implementations** - Add new functionality
- **Performance improvements** - Optimize existing code
- **UI/UX enhancements** - Improve user experience
- **Documentation** - Improve or add documentation
- **Tests** - Add or improve test coverage

#### Development Workflow

1. **Find an issue** or create one for discussion
2. **Comment on the issue** to indicate you're working on it
3. **Create a feature branch** from `main`
4. **Make your changes** following our guidelines
5. **Test thoroughly** on different devices/browsers
6. **Submit a pull request** with clear description

## 🏗️ Code Guidelines

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   └── ...             # Feature-specific components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and services
│   └── supabase/       # Supabase configuration and services
├── pages/              # Page components (one per route)
├── context/            # React context providers
└── integrations/       # External service integrations
```

### Coding Standards

#### TypeScript
- **Use TypeScript** for all new code
- **Define interfaces** for component props and data structures
- **Avoid `any` type** - use specific types
- **Use enum** for constants with multiple values

```typescript
// Good
interface UserProfile {
  id: string;
  name: string;
  age: number;
  fitnessGoal: FitnessGoal;
}

// Avoid
const userProfile: any = { ... };
```

#### React Components
- **Use functional components** with hooks
- **Extract custom hooks** for complex logic
- **Keep components small** and focused (< 200 lines)
- **Use proper prop destructuring**

```typescript
// Good
interface Props {
  title: string;
  onSave: (data: FormData) => void;
}

export function WorkoutForm({ title, onSave }: Props) {
  // Component logic
}

// Avoid
export function WorkoutForm(props: any) {
  // Using props.title throughout
}
```

#### Styling
- **Use Tailwind CSS** for styling
- **Follow mobile-first** responsive design
- **Use shadcn/ui components** when possible
- **Keep consistent spacing** (4, 8, 16, 24, 32px)

```tsx
// Good
<div className="flex flex-col gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
  <h2 className="text-xl font-semibold">Title</h2>
  <p className="text-gray-600 dark:text-gray-300">Description</p>
</div>
```

#### State Management
- **Use TanStack Query** for server state
- **Use React Context** for global app state
- **Keep local state** in components when possible
- **Use custom hooks** for complex state logic

### File Naming Conventions

- **Components**: PascalCase (`WorkoutCard.tsx`)
- **Hooks**: camelCase with "use" prefix (`useAuth.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Pages**: PascalCase (`Dashboard.tsx`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

### Component Guidelines

#### Creating New Components

1. **Start with props interface**
   ```typescript
   interface WorkoutCardProps {
     workout: Workout;
     onComplete: (workoutId: string) => void;
     isLoading?: boolean;
   }
   ```

2. **Use proper component structure**
   ```typescript
   export function WorkoutCard({ workout, onComplete, isLoading = false }: WorkoutCardProps) {
     // Hooks at the top
     const [isExpanded, setIsExpanded] = useState(false);
     
     // Event handlers
     const handleComplete = () => {
       onComplete(workout.id);
     };
     
     // Early returns for loading/error states
     if (isLoading) {
       return <Skeleton />;
     }
     
     // Main component JSX
     return (
       <div className="...">
         {/* Component content */}
       </div>
     );
   }
   ```

3. **Keep components focused**
   - Single responsibility principle
   - Extract subcomponents when needed
   - Limit props to essential data

#### Component Best Practices

- **Use semantic HTML** elements
- **Include proper accessibility** attributes
- **Handle loading and error states**
- **Provide meaningful error messages**
- **Use consistent naming** for props and handlers

### API & Data Guidelines

#### Supabase Integration
- **Use typed client** from `src/integrations/supabase/client.ts`
- **Implement proper error handling**
- **Use Row Level Security (RLS)** for data access
- **Keep queries in service files**

```typescript
// Good - in service file
export async function getWorkoutPlans(userId: string) {
  const { data, error } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    throw new Error(`Failed to fetch workout plans: ${error.message}`);
  }
  
  return data;
}
```

#### Error Handling
- **Use try-catch** for async operations
- **Provide user-friendly** error messages
- **Log errors** for debugging
- **Handle network failures** gracefully

### Testing Guidelines

#### What to Test
- **Component rendering** with different props
- **User interactions** (clicks, form submissions)
- **API integration** (mock responses)
- **Error scenarios** and edge cases
- **Accessibility** features

#### Testing Best Practices
- **Write descriptive test names**
- **Test behavior, not implementation**
- **Use proper setup and teardown**
- **Mock external dependencies**

## 📝 Documentation

### Code Documentation
- **Add JSDoc comments** for complex functions
- **Include usage examples** for utilities
- **Document prop types** and expected behavior
- **Explain non-obvious logic**

### README Updates
When adding features:
- Update feature list
- Add new environment variables
- Include setup instructions
- Update screenshots if UI changed

## 🔄 Pull Request Process

### Before Submitting

1. **Test your changes thoroughly**
   - Test on multiple devices/browsers
   - Check responsive design
   - Verify accessibility
   - Test error scenarios

2. **Update documentation**
   - Add/update code comments
   - Update README if needed
   - Add changelog entry
   - Update relevant guides

3. **Check code quality**
   - Run linter and fix issues
   - Ensure TypeScript compiles
   - Check for console errors
   - Verify performance

### Pull Request Template

```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Performance improvement
- [ ] Refactoring
- [ ] Documentation update

## Testing
- [ ] Tested on desktop browsers
- [ ] Tested on mobile devices
- [ ] Added/updated unit tests
- [ ] Tested edge cases

## Screenshots
Include screenshots for UI changes.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors or warnings
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** on different environments
4. **Approval** from core team member
5. **Merge** to main branch

## 🎯 Areas Needing Help

### High Priority
- **Performance optimization** - App loading and responsiveness
- **Accessibility improvements** - WCAG compliance
- **Test coverage** - Unit and integration tests
- **Mobile experience** - iOS/Android specific optimizations

### Medium Priority
- **Documentation** - User guides and API docs
- **Internationalization** - Multi-language support
- **Offline functionality** - Progressive Web App features
- **Analytics integration** - User behavior tracking

### Nice to Have
- **Design system** - Comprehensive component library
- **Storybook setup** - Component documentation
- **E2E testing** - Automated user journey tests
- **CI/CD improvements** - Better deployment pipeline

## 📞 Getting Help

### Communication Channels
- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Discord Community** - Real-time chat and collaboration
- **Email** - contribute@hashim-fitness.com

### Questions?
Don't hesitate to ask! We're here to help:
- Comment on issues you're interested in
- Ask questions in discussions
- Reach out on Discord
- Email us directly

## 🏆 Recognition

We appreciate all contributions! Contributors will be:
- **Listed in CONTRIBUTORS.md**
- **Mentioned in release notes**
- **Invited to contributor Discord channel**
- **Eligible for contributor swag** (future)

---

**Thank you for contributing to Hashim! Together, we're building the future of AI-powered fitness.** 💪
