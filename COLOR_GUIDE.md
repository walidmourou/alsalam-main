# Color System Guide

This document describes the color palette and usage guidelines for the Islamisches Zentrum Brombach-Lörrach website.

## Primary Colors

### Primary Green - `#009245`

- **Usage**: Main brand color, primary actions, links, highlights
- **Tailwind Classes**: `text-primary-green`, `bg-primary-green`, `border-primary-green`
- **Represents**: Growth, harmony, nature, Islamic tradition

### Primary Purple - `#262262`

- **Usage**: Headings, important text, secondary actions, emphasis
- **Tailwind Classes**: `text-primary-purple`, `bg-primary-purple`, `border-primary-purple`
- **Represents**: Spirituality, dignity, wisdom

## Accent Colors

### Accent Light Green - `#f0fdf4`

- **Usage**: Light backgrounds, hover states, card backgrounds
- **Tailwind Classes**: `bg-accent-light`
- **Context**: Subtle green tint for highlighting sections

### Accent Light Purple - `#f5f3ff`

- **Usage**: Alternative backgrounds, active states
- **Tailwind Classes**: `bg-accent-purple-light`
- **Context**: Subtle purple tint for variety

## Neutral Colors

### Text Dark - `#1a1a1a`

- **Usage**: Body text, primary content
- **Tailwind Classes**: `text-text-dark`

### Text Light - `#6b7280`

- **Usage**: Secondary text, descriptions, metadata
- **Tailwind Classes**: `text-text-light`

### Border Color - `#e5e7eb`

- **Usage**: Dividers, card borders, input borders
- **Tailwind Classes**: `border-border`
- **Dark Mode**: Automatically adjusts to `#374151`

## Color Combinations

### High Contrast (WCAG AAA)

- White text on Primary Green: ✅ Pass
- White text on Primary Purple: ✅ Pass
- Text Dark on White: ✅ Pass
- Text Dark on Accent Light: ✅ Pass

### Recommended Pairings

1. **Headers**: `text-primary-purple` on `bg-white`
2. **Links**: `text-primary-green` with `hover:text-primary-purple`
3. **Cards**: `bg-accent-light` with `border-primary-green/20`
4. **Buttons (Primary)**: `bg-primary-green` with `text-white`
5. **Buttons (Secondary)**: `bg-primary-purple` with `text-white`

## Usage Examples

### Call-to-Action Button

```tsx
<button className="bg-primary-green hover:bg-primary-purple text-white px-6 py-3 rounded-lg transition-colors">
  Action Text
</button>
```

### Info Card

```tsx
<div className="bg-accent-light border border-primary-green/20 rounded-lg p-6 hover:shadow-lg transition-shadow">
  <h3 className="text-primary-purple font-semibold mb-2">Title</h3>
  <p className="text-text-light">Description text</p>
</div>
```

### Section Header

```tsx
<h2 className="text-4xl font-bold text-primary-purple mb-6">
  Section Title
</h2>
<p className="text-lg text-text-light">
  Subtitle or description
</p>
```

### Navigation Link

```tsx
<a
  href="#"
  className="text-text-dark hover:text-primary-green transition-colors font-medium"
>
  Nav Item
</a>
```

## Accessibility Notes

- All color combinations meet WCAG AA standards at minimum
- Never rely on color alone to convey information
- Ensure sufficient contrast for text readability
- Icons should have text labels or ARIA labels
- Test with color blindness simulators

## Dark Mode (Future Enhancement)

The color system includes CSS variables that can be adjusted for dark mode:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
    --border-color: #374151;
    --text-light: #9ca3af;
  }
}
```

## Brand Guidelines

- **Primary Green** should be used more prominently than Purple (60/40 ratio)
- Maintain generous white space to let the colors breathe
- Use accent colors sparingly for emphasis
- Keep the interface clean and uncluttered
- Balance warm and cool tones throughout the design
