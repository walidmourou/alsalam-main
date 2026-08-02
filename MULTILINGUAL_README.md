# Islamisches Zentrum Brombach-Lörrach Website

A multilingual website for the Islamic Center of Brombach-Lörrach, supporting German (DE), French (FR), and Arabic (AR).

## Features

### 🌍 Multilingual Support

- **Three Languages**: German (DE), French (FR), and Arabic (AR)
- **Automatic Language Detection**: Based on browser preferences or cookies
- **SEO Optimized**: Each language version has proper hreflang tags and metadata
- **RTL Support**: Full right-to-left text direction for Arabic pages

### 🎨 Design

- **Custom Color Palette**:
  - Primary Green: `#009245`
  - Primary Purple: `#262262`
  - Complementary accent colors for optimal contrast
- **Responsive Design**: Mobile-first approach with Tailwind CSS v4
- **Accessible**: WCAG compliant with proper semantic HTML

### 🔍 SEO Features

- **Structured Data**: JSON-LD schema for ReligiousOrganization
- **Sitemap**: Dynamic sitemap generation for all language versions
- **Robots.txt**: Properly configured for search engine crawling
- **Meta Tags**: Comprehensive Open Graph and Twitter Card support
- **Language Alternates**: Proper hreflang tags for all pages
- **Semantic HTML**: Proper heading hierarchy and ARIA labels

## Project Structure

```
src/
├── app/
│   ├── [lang]/              # Dynamic language routes
│   │   ├── layout.tsx       # Language-specific layout with RTL support
│   │   ├── page.tsx         # Home page
│   │   ├── about/
│   │   ├── services/
│   │   └── contact/
│   ├── globals.css          # Global styles with custom Tailwind theme
│   ├── sitemap.ts           # Dynamic sitemap generator
│   └── robots.ts            # Robots.txt configuration
├── components/
│   ├── Header.tsx           # Main header with trilingual title
│   ├── LanguageSwitcher.tsx # Client-side language selector
│   └── OrganizationSchema.tsx # Structured data component
├── i18n/
│   ├── config.ts            # i18n configuration
│   ├── dictionaries.ts      # Dictionary loader
│   └── dictionaries/
│       ├── de.json          # German translations
│       ├── fr.json          # French translations
│       └── ar.json          # Arabic translations
└── middleware.ts            # Language detection and routing
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn or pnpm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The website will be available at `http://localhost:3000`

## Language Routing

The website uses Next.js 16 App Router with dynamic segments for language routing:

- `/de` - German version
- `/fr` - French version
- `/ar` - Arabic version (RTL layout)

The middleware automatically:

1. Detects the user's preferred language from cookies or browser settings
2. Redirects root path `/` to the appropriate language version
3. Maintains language preference across sessions

## Adding New Pages

To add a new page to all language versions:

1. Create a new folder in `src/app/[lang]/your-page/`
2. Add a `page.tsx` file:

```tsx
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

export default async function YourPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1>{dictionary.yourPage.title}</h1>
      {/* Your content */}
    </div>
  );
}
```

3. Add translations to each dictionary file in `src/i18n/dictionaries/`
4. Update the navigation in `Header.tsx` if needed

## Customization

### Colors

Edit `src/app/globals.css` to modify the color palette:

- `--primary-green`: Main green color
- `--primary-purple`: Main purple color
- Additional accent colors for various UI states

### Translations

Update the JSON files in `src/i18n/dictionaries/` to add or modify translations.

### Logo

Replace `public/images/logo.svg` with your custom logo.

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Other Platforms

Build the project and deploy the `.next` folder:

```bash
npm run build
```

## Performance

- **Static Generation**: All pages are statically generated at build time
- **Image Optimization**: Next.js automatic image optimization
- **Font Optimization**: Google Fonts with display=swap
- **Code Splitting**: Automatic code splitting per route

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## License

Copyright © 2025 Islamisches Zentrum Brombach-Lörrach

## Support

For questions or support, please contact the Islamic Center directly.
