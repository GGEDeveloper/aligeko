---
trigger: manual
description:
globs:
------|------|-----------|---------|
| Category cards | 24px | 48px circle | CategoryCard component |
| Navigation | 20px | None | Navbar icons |
| Buttons | 16px | None | Action buttons |
| Feature highlights | 32px | 64px circle | Homepage features |

## Icon Color Guidelines

- **Primary**: Match icon colors to the text color of their container for consistent contrast
- **Brand Icons**: Use brand yellow (#FFCC00) for emphasis
- **Interactive Icons**: Ensure they follow the same hover/active states as their parent components
- **Accessibility**: Maintain a minimum contrast ratio of 4.5:1 for icons used as functional elements

## Best Practices

1. **Consistency**: Use the same icon style throughout the application
2. **Responsiveness**: Ensure icons scale appropriately on different screen sizes
3. **Semantics**: Add appropriate aria-labels for icons that convey meaning
4. **Performance**: Use SVG icons instead of icon fonts for better performance and accessibility
5. **Organization**: Follow the established naming convention for new icons
6. **Size Constraints**: Always use fixed-size containers to prevent layout disruptions

## Related Rules

- [Branding Guidelines](mdc:.cursor/rules/branding.mdc) - Guidelines for brand-consistent visuals
- [UI Components](mdc:.cursor/rules/ui_components.mdc) - UI component patterns

## External References

- [React Icons Documentation](https://react-icons.github.io/react-icons/) - Reference for react-icons usage
- [SVG Best Practices](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial) - MDN guide for SVG optimization

## Search Icons

Search icons should be consistently sized across the application to maintain visual harmony.

### Guidelines for Search Icons

- **Size:**
  - Inline search icons (inside input fields): 16px (0.8-1rem) maximum 
  - Standalone search buttons: 20px (1rem) maximum

- **Color:**
  - Input fields: Use text-gray-500 (medium gray) for sufficient contrast
  - Search buttons: Use color that contrasts with the button background (like black on yellow)

### Search Icon Implementations

```jsx
// ✅ DO: Proper search icon in input field
<div className="relative">
  <input
    type="text"
    placeholder="Search..."
    className="pl-10 pr-4 py-2 border rounded-lg"
  />
  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </div>
</div>

// ❌ DON'T: Oversized search icon
<div className="relative">
  <input
    type="text"
    placeholder="Search..."
    className="pl-10 pr-4 py-2 border rounded-lg"
  />
  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <svg className="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </div>
</div>
```

## Input Field Icons

Special care must be taken with icons that appear inside input fields, particularly search icons:

### Search Icon Guidelines

- **Size**: 
  - Search icons inside input fields should be h-4 w-4 (16px) maximum
  - For mobile inputs, consider even smaller sizing (h-3.5 w-3.5 or 14px)
  
- **Visual Weight**:
  - Use `fill="none" stroke="currentColor"` for lighter appearance in search boxes
  - If using `fill="currentColor"`, ensure the icon doesn't appear too heavy
  
- **Color**:
  - Use `text-gray-500` for sufficient contrast within inputs
  - Avoid using `text-gray-400` which can appear too light against white backgrounds
  
- **Position**:
  - Always position search icons 12px (pl-3) from the left edge of the input
  - Center vertically within the input field
  - Use `pointer-events-none` to ensure they don't interfere with input field interactions
  
- **Accessibility**:
  - Ensure sufficient color contrast (minimum 4.5:1 ratio)
  - If the icon is functional (clickable), provide proper `aria-label`

### Examples

```jsx
// ✅ DO: Proper search icon implementation in an input field
<div className="relative">
  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="none" stroke="currentColor">
      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
  </div>
  <input
    type="text"
    placeholder="Search..."
    className="pl-10 pr-3 py-2 border rounded-md focus:ring-1 focus:ring-yellow-500 w-full"
  />
</div>

// ❌ DON'T: Oversized or heavy search icon
<div className="relative">
  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
  </div>
  <input
    type="text"
    placeholder="Search..."
    className="pl-10 pr-3 py-2 border rounded-md"
  />
</div>
```

---

*Last updated: 2025-05-07*
