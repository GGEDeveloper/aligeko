# AliTools Brand Style Guide

This style guide documents the visual identity of AliTools B2B Platform, including colors, typography, UI components, and usage guidelines.

## 1. Logo

*Note: Logo variations to be added as they are designed.*

- **Primary Logo**: Full color version on white background
- **Secondary Logo**: Monochromatic version for restricted color applications
- **Icon**: Standalone icon for favicons, small applications
- **Exclusion Zone**: Maintain space of at least half the logo's width on all sides

## 2. Color Palette

### Primary Colors

| Name | Hex | Sample | Usage |
|------|-----|--------|-------|
| Primary 500 | #1E3A8A | ![#1E3A8A](https://via.placeholder.com/20/1E3A8A/FFFFFF?text=+) | Main brand color, primary buttons, active elements |
| Primary 600 | #182E6E | ![#182E6E](https://via.placeholder.com/20/182E6E/FFFFFF?text=+) | Hover states for primary elements |
| Primary 700 | #122353 | ![#122353](https://via.placeholder.com/20/122353/FFFFFF?text=+) | Active states, headings, sidebar background |

### Secondary Colors

| Name | Hex | Sample | Usage |
|------|-----|--------|-------|
| Secondary 500 | #F97316 | ![#F97316](https://via.placeholder.com/20/F97316/FFFFFF?text=+) | Accent color, call-to-actions, highlights |
| Secondary 600 | #C75C12 | ![#C75C12](https://via.placeholder.com/20/C75C12/FFFFFF?text=+) | Hover states for secondary elements |
| Secondary 700 | #95450D | ![#95450D](https://via.placeholder.com/20/95450D/FFFFFF?text=+) | Active states for secondary elements |

### Neutral Colors

| Name | Hex | Sample | Usage |
|------|-----|--------|-------|
| Neutral 100 | #FFFFFF | ![#FFFFFF](https://via.placeholder.com/20/FFFFFF/000000?text=+) | Background, cards, text on dark backgrounds |
| Neutral 200 | #F9FAFB | ![#F9FAFB](https://via.placeholder.com/20/F9FAFB/000000?text=+) | Page background, alternate rows |
| Neutral 300 | #F3F4F6 | ![#F3F4F6](https://via.placeholder.com/20/F3F4F6/000000?text=+) | Input backgrounds, dividers |
| Neutral 400 | #E5E7EB | ![#E5E7EB](https://via.placeholder.com/20/E5E7EB/000000?text=+) | Borders, dividers |
| Neutral 500 | #D1D5DB | ![#D1D5DB](https://via.placeholder.com/20/D1D5DB/000000?text=+) | Disabled elements |
| Neutral 600 | #9CA3AF | ![#9CA3AF](https://via.placeholder.com/20/9CA3AF/000000?text=+) | Placeholder text |
| Neutral 700 | #6B7280 | ![#6B7280](https://via.placeholder.com/20/6B7280/FFFFFF?text=+) | Secondary text |
| Neutral 800 | #4B5563 | ![#4B5563](https://via.placeholder.com/20/4B5563/FFFFFF?text=+) | Primary text |
| Neutral 900 | #1F2937 | ![#1F2937](https://via.placeholder.com/20/1F2937/FFFFFF?text=+) | Headings, important text |

## 3. Typography

### Font Family

**Primary Font**: Inter
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
  Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
```

### Heading Styles

| Element | Font Size | Font Weight | Line Height | Color | Margin |
|---------|-----------|-------------|-------------|-------|--------|
| h1 | 1.875rem (3xl) / 2.25rem (4xl) | 700 (bold) | 1.2 | primary-700 | mb-4 |
| h2 | 1.5rem (2xl) / 1.875rem (3xl) | 600 (semibold) | 1.25 | primary-600 | mb-3 |
| h3 | 1.25rem (xl) / 1.5rem (2xl) | 500 (medium) | 1.3 | primary-500 | mb-2 |
| h4 | 1.125rem (lg) / 1.25rem (xl) | 500 (medium) | 1.4 | primary-500 | mb-2 |

### Body Text

| Element | Font Size | Font Weight | Line Height | Color |
|---------|-----------|-------------|-------------|-------|
| p | 1rem (base) | 400 (regular) | 1.5 (relaxed) | neutral-800 |
| small | 0.875rem (sm) | 400 (regular) | 1.4 | neutral-700 |

## 4. UI Components

### Buttons

**Primary Button**
```css
bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition-smooth
```

**Secondary Button**
```css
bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-md transition-smooth
```

**Outline Button**
```css
border border-primary-500 text-primary-500 hover:bg-primary-50 px-4 py-2 rounded-md transition-smooth
```

### Cards

**Basic Card**
```css
bg-white rounded-lg shadow-card p-4 border border-neutral-300
```

**Interactive Card**
```css
card h-full transition-smooth hover:shadow-lg
```

### Form Elements

**Input**
```css
border border-neutral-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
```

**Select**
```css
border border-neutral-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
```

**Label**
```css
block text-sm font-medium text-neutral-700 mb-1
```

### Badges/Tags

**Primary Badge**
```css
inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded
```

**Neutral Badge**
```css
inline-block bg-neutral-100 text-neutral-800 text-xs px-2 py-1 rounded
```

## 5. Layout Guidelines

### Spacing System

| Size | Value | Usage |
|------|-------|-------|
| xs | 0.25rem (4px) | Minimal spacing between related elements |
| sm | 0.5rem (8px) | Spacing between related elements |
| md | 1rem (16px) | Standard spacing between elements |
| lg | 1.5rem (24px) | Spacing between sections |
| xl | 2rem (32px) | Generous spacing between major sections |
| 2xl | 3rem (48px) | Very large spacing for major page sections |

### Container Widths

- **Content max-width**: 1280px (Standard container width)
- **Card max-width**: 450px (For forms and info cards)

### Grid System

- **Mobile**: 1 column
- **Tablet (sm)**: 2 columns
- **Desktop (lg)**: 3 columns
- **Large Desktop (xl)**: 4 columns
- **Gap**: 1rem (16px)

## 6. Iconography

- **Style**: Flat, minimalist icons with consistent line weights
- **Library**: Bootstrap Icons (bi) for consistency
- **Default Size**: 1em (scales with font size)
- **Color**: Inherits from text color or explicitly set

## 7. Animations & Transitions

**Standard Transition**
```css
transition-all duration-300 ease-in-out
```

## 8. Usage Examples

### Headers
```jsx
<h1>Products</h1>
<p className="text-neutral-600">Browse and manage products in your inventory</p>
```

### Forms
```jsx
<div>
  <label className="block text-sm font-medium text-neutral-700 mb-1">Input Label</label>
  <input 
    type="text" 
    className="border border-neutral-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
  />
</div>
```

### Cards
```jsx
<div className="card h-full transition-smooth hover:shadow-lg">
  <div className="p-4">
    <h4 className="font-semibold mb-1 text-primary-700">Card Title</h4>
    <p className="text-sm text-neutral-600">Card content goes here.</p>
  </div>
</div>
```

### Buttons
```jsx
<button className="btn-primary">Primary Button</button>
<button className="btn-secondary">Secondary Button</button>
<button className="btn-outline">Outline Button</button>
```

## 9. Implementation Notes

- All styling is implemented using TailwindCSS
- Custom utility classes are defined in index.css
- Color palette is defined in tailwind.config.js
- Typography rules are applied globally through the @layer base directive

---

*This style guide is a living document and will be updated as the AliTools brand evolves.* 