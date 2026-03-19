# Invoice Generator — Design System Rules

## Project Overview

**The Invoice** is a vanilla HTML/CSS/JavaScript single-page application (no build system, no framework) that generates professional invoices and exports them as PDFs. It supports 16+ locales (RTL included) and auto-saves to `localStorage`.

---

## 1. Token Definitions

All design tokens are defined as CSS custom properties in `:root` inside `styles.css`:

```css
:root {
  /* Colors — Neutral/slate palette with tech-minimal aesthetic */
  --primary-color: #475569;      /* Slate — primary actions, section borders */
  --primary-hover: #334155;      /* Darker slate — hover states, footer */
  --accent-color: #64748b;       /* Mid-slate — secondary accents */
  --success-color: #475569;      /* Slate — export PDF button (matches primary) */
  --success-hover: #334155;
  --danger-color: #94a3b8;       /* Light slate — remove button (subtle) */
  --danger-hover: #64748b;

  /* Text */
  --text-primary: #1e293b;       /* Near-black — body text */
  --text-secondary: #64748b;     /* Medium slate — labels, subtitles */
  --text-muted: #94a3b8;         /* Light slate — placeholder/disabled text */

  /* Backgrounds */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;       /* Subtle cool gray — alternating sections */
  --bg-hover: #f1f5f9;

  /* Borders */
  --border-color: #e2e8f0;

  /* Shadows — Minimal, flat */
  --shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.04);
  --shadow-md: 0 2px 4px 0 rgba(0,0,0,0.06);
  --shadow-lg: 0 4px 8px -1px rgba(0,0,0,0.06);
  --shadow-xl: 0 4px 12px -2px rgba(0,0,0,0.08);
}
```

**One hardcoded exception** — the footer note uses amber inline: `#fef3c7` / `#f59e0b` / `#92400e`. If this pattern recurs, promote to tokens.

**Always use CSS custom properties** when adding new styles. Never hardcode colors that map to an existing token.

---

## 2. Component Patterns

There is no component library. UI elements are plain HTML + CSS classes. Key reusable patterns:

### Buttons

```html
<!-- Primary action -->
<button class="btn-primary">Label</button>

<!-- Secondary / outline -->
<button class="btn-secondary">Label</button>

<!-- Success (PDF export) -->
<button class="btn-success">Label</button>

<!-- Danger (remove line item) -->
<button class="btn-remove">✕</button>
```

All buttons share: `padding: 0.625rem 1.25rem`, `border-radius: 6px`, `font-weight: 500`, `font-size: 0.875rem`, `transition: all 0.15s ease`.

### Form Fields

```html
<div class="form-group">
  <label for="fieldId" data-i18n="key">Label</label>
  <input type="text" id="fieldId" />
</div>
```

Inputs use `border: 1px solid var(--border-color)`, `border-radius: 6px`, focus ring `box-shadow: 0 0 0 2px rgba(71, 85, 105, 0.08)`.

### Cards / Sections

Both `.form-section` and `.preview-section` share:
```css
background: var(--bg-primary);
border-radius: 8px;
padding: 1.5rem;
box-shadow: var(--shadow-md);
border: 1px solid var(--border-color);
```

### Line Items

```html
<div class="line-item">
  <div class="line-item-row"> <!-- grid: 2fr 1fr auto -->
    <input class="item-description" type="text" />
    <input class="item-amount" type="number" step="0.01" min="0" />
    <button class="btn-remove" onclick="removeLineItem(this)">✕</button>
  </div>
</div>
```

### Dynamic Payment/Bank Detail Fields

Payment fields are fully dynamic — users can add/remove label+value pairs to support any payment platform (traditional banks, TechFX, Higlobe, etc.):

```html
<div class="bank-field-row"> <!-- grid: 1fr 2fr auto -->
  <input class="bank-field-label" type="text" placeholder="Field label" />
  <input class="bank-field-value" type="text" placeholder="Value" />
  <button class="btn-remove" onclick="removeBankField(this)">✕</button>
</div>
```

Bank fields are stored in `localStorage` as `bankFields: [{ label, value }, ...]` and rendered dynamically in both the form and invoice preview.

---

## 3. Frameworks & Libraries

| Concern | Tool |
|---|---|
| Language | Vanilla JavaScript (ES6+) |
| Styling | Plain CSS with custom properties (no preprocessor) |
| Markup | Plain HTML5 |
| Build system | None — files served directly |
| PDF export | `html2pdf.js` v0.10.1 (CDN) |
| i18n | Custom `i18n.js` (see §6) |

No npm, no bundler, no TypeScript. When implementing features, stay in vanilla JS unless a library is already imported.

---

## 4. Project Structure

```
invoice-generator/
  index.html          # Main application shell
  styles.css          # All styles (tokens, layout, components, responsive, print)
  script.js           # All app logic (form handling, preview, PDF export, localStorage)
  i18n.js             # Internationalization helper
  locales/
    en-US.json        # Translation keys
    ar.json, de.json, es.json, fr.json, he.json, hi.json,
    it.json, ja.json, nl.json, pt-BR.json, pt-PT.json,
    ru.json, uk.json, zh.json   # Additional locales
  pages/
    about.html
    privacy.html
    terms.html
  images/
    favicon.ico
  ads.txt
  robots.txt
```

---

## 5. Asset Management

- Images live in `images/`.
- No CDN for project assets — referenced by relative path.
- External CDNs: Google AdSense (`pagead2.googlesyndication.com`), html2pdf.js (`cdnjs.cloudflare.com`).
- No icon library — icons are Unicode characters (e.g., `✕`). Emojis have been removed from UI for a cleaner look.
- Font: Inter (loaded from Google Fonts CDN) with system font fallbacks.

---

## 6. Internationalization

All user-facing strings use `data-i18n` attributes resolved at runtime by `i18n.js`:

```html
<label data-i18n="form.invoiceNumber">Invoice Number</label>
<input data-i18n-placeholder="form.placeholderDescription" placeholder="..." />
```

In JavaScript, always use `i18n.t("key")` for strings and `i18n.formatCurrency(amount)` for money values. Never hardcode user-visible text.

RTL languages (Arabic, Hebrew) are handled via `[dir="rtl"]` attribute on `<html>`:

```css
[dir="rtl"] .invoice-parties { flex-direction: row-reverse; }
[dir="rtl"] .text-right { text-align: left !important; }
```

---

## 7. Styling Approach

- **Methodology**: Flat BEM-like class names, no CSS modules or scoping.
- **Global styles**: `* { box-sizing: border-box; margin: 0; padding: 0; }` in `styles.css`.
- **Inline styles**: Avoid — inline styles exist in the codebase but are a legacy smell. Prefer adding classes.
- **Nesting**: Native CSS nesting (`&`) is used in a few places (`.links a`, `.line-item-row:last-child`) — this is acceptable for modern browsers.

### Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| `max-width: 400px` | Hide ad slot |
| `max-width: 768px` | Stack layout, full-width inputs, single-column line items |
| `max-width: 1024px` | Stack `.main-content` to single column |

Main layout uses CSS Grid: `.main-content { grid-template-columns: 1fr 1fr; }`.

### Print / PDF Styles

`@media print` hides `.form-section` and `.app-header`, removes shadows and max-heights. `page-break-inside: avoid` is applied to invoice blocks. When adding new invoice sections, include `page-break-inside: avoid`.

---

## 8. Figma Integration Guidelines

When translating Figma designs into this codebase:

1. **Map Figma color styles to existing CSS tokens** — do not introduce new hex values if an existing token matches.
2. **Match border-radius**: Cards use `8px`, inputs/buttons use `6px`, small accents use `4px`.
3. **Typography scale** (Inter font):
   - App title: `1.75rem / 600`
   - Section headings (`h2`): `1.125rem / 600`
   - Sub-headings (`h3`): `0.8rem / 600` (uppercase, letter-spaced)
   - Body: `0.875rem / 400`, line-height `1.6`
   - Labels: `0.875rem / 600`
   - Small/meta: `0.75rem`
4. **Spacing rhythm**: `0.25rem`, `0.5rem`, `0.75rem`, `1rem`, `1.5rem`, `2rem`.
5. **No new dependencies** — implement UI with plain HTML/CSS/JS only.
6. **Always add `data-i18n` attributes** on any new user-visible text elements.
7. **Avoid inline styles** — add a class to `styles.css` instead.
8. **Respect RTL** — use logical properties or add `[dir="rtl"]` overrides for any directional layout.
