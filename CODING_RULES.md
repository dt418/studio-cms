# Coding Rules for StudioCMS Blog

This document outlines the coding standards and best practices that all agents must follow when working on this project.

## Component Architecture

### Modular Components

- **Extract reusable UI patterns** into separate components
- Each component should have a single, well-defined responsibility
- Components should be placed in logical directories (e.g., `components/Blog/` for blog-related components)

### Astro Component Patterns

- **Do not use React-style component functions** in Astro frontmatter
  - Astro does not support defining JSX-returning functions in the frontmatter like React
  - Instead, create separate `.astro` component files or inline the logic directly in the template
  - Example of what NOT to do:

    ```astro
    ---
    const MyComponent = (props) => (
      <div>{props.children}</div>
    )
    ---
    ```

  - Correct approach - create a separate component file or use conditional rendering inline

### Component Props
- **Use proper TypeScript types** - never use `any`
- For Astro content, use `CollectionEntry<'posts'>` from `astro:content`
- Mark optional props with `?:` and use conditional prop passing:
  ```astro
  {...(prop && { prop })}
  ```
- This is required due to `exactOptionalPropertyTypes: true` in TypeScript config

### Content Composition
- **Use Astro slots** for content composition instead of props
- This avoids type issues and follows Astro best practices:
  ```astro
  <ArticleContent>
    <slot />
  </ArticleContent>
  ```

## Imports and Dependencies

### Path Aliases
- **Use `@` alias** for imports instead of relative paths:
  ```typescript
  import { formatDate } from '@/lib/date'  // ✅
  import { formatDate } from '../lib/utils' // ❌
  ``` 

### Utility Functions
- **Use centralized utilities**:
  - `formatDate` from `@/lib/date` - for date formatting
  - `readingTime` from `@/lib/reading-time` - for calculating reading time
  - `getAuthorInitials`, `getAuthorAvatar`, `getImageUrl` from `@/lib/utils` - for author and image utilities
- Do not duplicate these functions in components

### Icon Components
- **Extract SVG icons** as reusable components in `components/icons/`
- Icons should accept a `class` prop for styling flexibility:
  ```astro
  interface Props {
    class?: string
  }
  ```

## Date and Time Handling

### Date Formatting
- **Never use inline date formatting** like `toLocaleDateString` in components
- Always use the `formatDate` utility from `@/lib/utils`
- For client-side JavaScript (e.g., in `<script>` tags), create a helper function:
  ```javascript
  function formatDate(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
  ```

### ISO Dates
- Use `toISOString()` for:
  - datetime attributes (HTML5)
  - JSON-LD structured data
  - Data serialization
- These are valid use cases and should not be replaced with formatDate

## TypeScript and Type Safety

### Strict Type Checking
- **Never use `any` types** - always use proper TypeScript types
- Use `exactOptionalPropertyTypes: true` in tsconfig
- Use conditional prop passing for optional properties
- Type all function parameters and return values

### Content Types
- Use `CollectionEntry<'posts'>` from `astro:content` for post data
- Extract data properties explicitly: `post.data.title`
- For custom interfaces, define them at the top of the component

## Code Style and Linting

### Conditional Statements
- **Always use curly braces** for if statements:
  ```javascript
  if (condition) {
    return
  }
  ```
- This is required by the linting rules

### Variable Naming
- Use descriptive variable names (minimum 2 characters)
- Avoid single-letter variable names except for loop counters
- Use camelCase for variables and functions

### Array Operations
- **Use Array helpers** instead of spread syntax when appropriate:
  ```typescript
  const duplicatedItems = Array.from({ length: 2 }, () => items).flat()
  ```
- This improves readability and is more explicit

## Styling

### Scoped Styles
- Use `is:global` directive for styles that need to affect global scope
- Keep component-specific styles scoped to the component
- Use CSS custom properties (CSS variables) for theming

### Tailwind CSS
- Use Tailwind utility classes for styling
- Follow the established design tokens and color scheme
- Use the shorthand notation for opacity (e.g., `bg-white/2` instead of `bg-white/[0.02]`)

## File Organization

### Component Structure
```
components/
  Blog/          # Blog-specific components
  icons/         # Reusable icon components
  [other]        # Other domain-specific components
```

### Page Organization
- Pages in `src/pages/` should be minimal
- Extract complex logic into components
- Use layouts for common page structure

## Accessibility

### ARIA Labels
- Add `aria-label` attributes to interactive elements
- Use semantic HTML elements
- Provide proper heading hierarchy

### Keyboard Navigation
- Ensure all interactive elements are keyboard accessible
- Add appropriate focus states

## Testing Considerations

When refactoring:
- Ensure all existing functionality remains intact
- Verify that the application runs without TypeScript errors
- Check that components display correctly
- Run linting to ensure code style compliance

## Common Patterns

### Conditional Rendering
```astro
{condition && <Component />}
```

### Optional Props
```astro
<Component
  requiredProp={value}
  {...(optionalProp && { optionalProp })}
/>
```

### List Rendering
```astro
{items.map((item) => (
  <Component key={item.id} item={item} />
))}
```

## Migration Checklist

When refactoring existing code:
1. ✅ Extract inline logic into helper functions or components
2. ✅ Replace custom types with `CollectionEntry` types
3. ✅ Update imports to use `@` alias
4. ✅ Replace inline date formatting with `formatDate`
5. ✅ Extract SVG icons as reusable components
6. ✅ Use slots for content composition
7. ✅ Add proper TypeScript types (no `any`)
8. ✅ Follow linting rules
9. ✅ Verify functionality after changes
