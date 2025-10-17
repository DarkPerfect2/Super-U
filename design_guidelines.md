# Design Guidelines: Géant Casino Click & Collect

## Design Approach

**Selected Approach:** Reference-Based Design inspired by modern e-commerce leaders (Alibaba, Shopify) with clean, professional aesthetics from Kikku.com

**Justification:** E-commerce platform requiring strong visual appeal to drive conversions, showcase products effectively, and build trust through familiar patterns. The grocery/supermarket context demands clarity, accessibility, and emphasis on critical policy information (24h/48h expiration rules).

**Key Design Principles:**
- Trust & Transparency: Highly visible policies, clear pricing, stock indicators
- Efficiency First: Streamlined checkout, quick product discovery, minimal friction
- Visual Hierarchy: Product imagery takes center stage, supported by clean typography
- Mobile-First: Touch-friendly interactions, responsive grids, optimal thumb zones

## Core Design Elements

### A. Color Palette

**Primary Colors (Light Mode):**
- Brand Primary: 220 85% 45% (Deep professional blue - trust and reliability)
- Brand Accent: 142 70% 45% (Fresh green - grocery/freshness association)
- Background: 0 0% 98% (Soft off-white for reduced eye strain)
- Surface: 0 0% 100% (Pure white for cards and elevated elements)

**Primary Colors (Dark Mode):**
- Brand Primary: 220 75% 55% (Lighter blue for contrast)
- Brand Accent: 142 65% 50% (Vibrant green)
- Background: 220 15% 10% (Deep dark blue-gray)
- Surface: 220 12% 15% (Elevated dark surface)

**Semantic Colors (Both Modes):**
- Success: 142 70% 45% / 142 65% 50%
- Warning: 38 95% 55% / 38 90% 60% (for stock alerts, expiration notices)
- Error: 0 75% 50% / 0 70% 55%
- Info: 210 85% 55% / 210 80% 60%

**Text Colors:**
- Primary Text (Light): 220 20% 15%
- Secondary Text (Light): 220 10% 45%
- Primary Text (Dark): 220 10% 95%
- Secondary Text (Dark): 220 8% 70%

### B. Typography

**Font Families:**
- Primary: 'Inter' (Google Fonts) - Clean, modern, excellent readability for UI and body text
- Accent: 'Poppins' (Google Fonts) - Bold headings and CTAs for visual impact

**Type Scale:**
- Heading 1: Poppins, 2.5rem (40px), font-weight 700, line-height 1.2
- Heading 2: Poppins, 2rem (32px), font-weight 600, line-height 1.3
- Heading 3: Poppins, 1.5rem (24px), font-weight 600, line-height 1.4
- Body Large: Inter, 1.125rem (18px), font-weight 400, line-height 1.6
- Body: Inter, 1rem (16px), font-weight 400, line-height 1.6
- Small: Inter, 0.875rem (14px), font-weight 400, line-height 1.5
- Caption: Inter, 0.75rem (12px), font-weight 500, line-height 1.4

**Style Applications:**
- Product titles: Heading 3, Primary Text color
- Section headings: Heading 2, Brand Primary color
- CTAs: Poppins 1rem, font-weight 600, uppercase tracking-wide
- Prices: Poppins 1.25rem, font-weight 700
- Policies/Legal: Inter 0.875rem, font-weight 500, Warning color for emphasis

### C. Layout System

**Spacing Primitives (Tailwind Units):**
- Core spacing set: 2, 4, 6, 8, 12, 16 (p-2, m-4, gap-6, py-8, px-12, space-y-16)
- Section padding: py-16 md:py-24 lg:py-32
- Card padding: p-4 md:p-6
- Grid gaps: gap-4 md:gap-6 lg:gap-8

**Container & Grid:**
- Max-width containers: max-w-7xl mx-auto px-4 md:px-6 lg:px-8
- Product grids: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
- Category grids: grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- Content max-width (text-heavy): max-w-4xl

**Responsive Breakpoints:**
- Mobile: Base (0-640px) - single column, stacked navigation
- Tablet: md (768px+) - 2-3 column grids, side-by-side layouts
- Desktop: lg (1024px+) - full multi-column, expanded navigation
- Wide: xl (1280px+) - maximum content width, optimized spacing

### D. Component Library

**Navigation:**
- Header: Sticky top bar with logo left, search center, cart/auth right
- Search bar: Rounded-full with icon, suggestions dropdown with product thumbnails
- Mobile menu: Slide-in drawer with category tree, search, account links
- Breadcrumbs: Text-sm with chevron separators, Brand Primary on hover

**Product Components:**
- Product card: Aspect-square image, overlay badges (stock, promo), title, price, quick-add button
- Product grid: Responsive columns with consistent gap-6, skeleton loaders during fetch
- Product gallery: Main image with thumbnails below, zoom on hover (desktop), swipe (mobile)
- Stock badge: Pill-shaped, Success (in stock), Warning (low stock <10), Error (out of stock)
- Rating display: Gold stars with count, average shown as "4.5 (234 avis)"

**Cart & Checkout:**
- Cart drawer: Slide from right, max-h-screen with scrollable items, sticky footer with total
- Cart item row: Product thumbnail left, details center, quantity controls + remove right
- Stepper (3-step checkout): Horizontal on desktop, stacked on mobile, completed steps in Success color
- Slot picker: Calendar-like grid, disabled past slots, capacity indicators with Warning color when <20%
- Payment buttons: Full-width on mobile, side-by-side on desktop, provider logos included

**Forms & Inputs:**
- Text inputs: Rounded-lg border, focus ring in Brand Primary, error state with Error color border
- Buttons Primary: bg-Brand-Primary text-white, hover brightness increase, rounded-lg px-6 py-3
- Buttons Secondary: border-2 border-Brand-Primary text-Brand-Primary, hover bg-opacity-10
- Buttons Outline on images: backdrop-blur-md bg-white/20 border-2 border-white text-white

**Feedback Elements:**
- Toasts: Top-right corner, slide-in animation, auto-dismiss 5s, icons for Success/Error/Info
- Loading skeletons: Pulse animation, match component shape (cards, lists)
- Empty states: Centered icon + heading + description + CTA, subtle illustrations
- Error boundaries: Full-page fallback with retry button, friendly messaging

**Policy Displays (Critical):**
- Banner style: bg-Warning/10 border-l-4 border-Warning, icon + bold text
- Placement: Landing hero section, checkout before payment, order confirmation
- Content: "⚠️ Politique de retrait : 24h max produits périssables, 48h non-périssables. Commande annulée sans remboursement après expiration."

### E. Animations

**Minimal Approach - Use Sparingly:**
- Page transitions: Fade-in only, no slide animations
- Button hover: Scale-105 transform on Primary CTAs
- Product card hover: Subtle shadow increase, no movement
- Drawer/modal: Slide-in from appropriate edge, 200ms ease-out
- Loading states: Pulse skeleton only, no spinners unless necessary
- Add to cart: Brief scale animation on cart icon badge

**Explicitly Avoid:**
- Parallax scrolling
- Auto-playing carousels
- Elaborate scroll-triggered animations
- Rotating 3D effects

## Images

**Hero Section (Landing Page):**
- Large hero image: Full-width banner showcasing fresh groceries/supermarket environment
- Dimensions: 1920x600px (desktop), maintain 16:9 aspect on mobile
- Overlay: Dark gradient (bottom to top, opacity 40%) for text readability
- Content over image: Centered CTA "Commencer mes courses en ligne" with outline button (blurred background)

**Product Images:**
- High-quality product photography on white/transparent backgrounds
- Square aspect ratio (1:1) for grid consistency
- Multiple angles in product gallery (minimum 3 images)
- Thumbnail size: 80x80px, Main view: 600x600px

**Category Images:**
- Representative category photos (fruits, dairy, bakery, etc.)
- Rounded-lg with subtle overlay, category name centered
- Dimensions: 400x300px

**Trust & Social Proof:**
- Payment provider logos: Airtel Money, MTN Mobile Money, Visa, Mastercard in footer
- Partner/certification badges if available
- User-generated content in reviews (optional avatar images)

**Placeholder Strategy:**
- Use semantic placeholders: "Image produit indisponible" with icon
- Lazy loading for all product images below fold
- Blur-up technique for progressive loading

## Page-Specific Layouts

**Landing Page:**
1. Hero: Full-width image, centered headline + CTA, policy banner below
2. Categories: 4-column grid with image cards
3. Featured Products: "Promotions" section with product carousel/grid
4. Trust Section: Payment methods, delivery promise, customer count
5. Footer: Newsletter, quick links, legal, contact

**Catalog/Category Page:**
- Left sidebar: Filters (desktop), modal (mobile)
- Main area: Breadcrumbs, sort dropdown, product grid
- Pagination: Bottom center, show 20 products per page

**Product Detail:**
- Two-column layout: Gallery left (60%), Details right (40%)
- Sticky add-to-cart section on scroll
- Tabs below: Description, Reviews, Related Products

**Checkout Flow:**
- Single column on mobile, two-column on desktop (form left, summary right)
- Progress stepper always visible at top
- Sticky order summary on desktop

**Confirmation Page:**
- Centered card with success icon, order number prominently displayed
- Codes section: Temporary code in large font, final code explanation
- Policy reminder: Warning-styled banner
- CTA: "Retour à l'accueil" + "Voir mes commandes"

## Accessibility & Internationalization

- Minimum contrast ratio: 4.5:1 for text, 3:1 for UI components
- Keyboard navigation: Visible focus rings (2px Brand Primary outline)
- ARIA labels on all interactive elements, French language
- Form error messages: Associated with inputs via aria-describedby
- Screen reader announcements for cart updates, loading states
- Touch targets: Minimum 44x44px on mobile