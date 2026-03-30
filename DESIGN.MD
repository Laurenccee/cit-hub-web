# Design System Document: The Scholastic Industrialist

## 1. Overview & Creative North Star

**Creative North Star: "The Modern Atelier"**
The College of Industrial Technology is where the precision of engineering meets the legacy of academia. This design system rejects the "cluttered portal" aesthetic common in higher education. Instead, it adopts the "Modern Atelier" approach: a digital environment that feels like a high-end architectural studio—clean, authoritative, and structurally sound.

We break the "template" look by utilizing **intentional asymmetry** and **editorial pacing**. High-contrast typography scales (the elegant serif vs. the functional sans) create a rhythm that guides the eye through complex data, making even a grade table or a dense calendar feel like a curated experience.

## 2. Colors & Tonal Architecture

The palette is anchored by a deep, authoritative Maroon (`primary: #570000`). This is balanced by a sophisticated range of grays and blues to ensure the interface feels academic but never "stale."

### The "No-Line" Rule

To achieve a premium, custom feel, **1px solid borders are prohibited for sectioning.** Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background creates a clean, sophisticated break without the "boxed-in" look of traditional UI.

### Surface Hierarchy & Nesting

Treat the UI as a series of stacked, physical layers—like fine drafting paper.

- **Level 0 (Base):** `surface` (#f9f9f9)
- **Level 1 (Sections):** `surface-container-low` (#f3f3f3)
- **Level 2 (Cards/Interaction):** `surface-container-lowest` (#ffffff)
- **Level 3 (Pop-overs):** `surface-bright` (#f9f9f9) with elevated depth.

### Signature Textures & Glassmorphism

- **CTAs & Hero States:** Use a subtle linear gradient transitioning from `primary` (#570000) to `primary-container` (#800000) at a 135-degree angle. This adds "soul" and depth.
- **Floating Elements:** For navigation bars or modal overlays, use `surface-container-lowest` at 80% opacity with a `20px` backdrop-blur to create a "frosted glass" effect, softening the transition between layers.

## 3. Typography

We use a bi-font system to bridge the gap between "Industrial" and "Academic."

- **Display & Headlines (Newsreader):** This serif typeface provides the academic gravitas.
- `display-lg` (3.5rem): Used for major landing page headers.
- `headline-sm` (1.5rem): Used for article titles and card headers.
- **Interface & Body (Public Sans):** This geometric sans-serif provides industrial precision and legibility.
- `title-md` (1.125rem): Used for sub-navigation and data labels.
- `body-md` (0.875rem): The standard for all long-form content and data tables.
- `label-sm` (0.6875rem): Used for "Industrial" metadata (e.g., Course Codes, timestamps).

## 4. Elevation & Depth

Depth is achieved through **Tonal Layering** rather than traditional structural lines.

- **The Layering Principle:** A `surface-container-lowest` card placed on a `surface-container-low` background creates a natural, soft lift. This is our primary method of containment.
- **Ambient Shadows:** For floating elements (Modals/Dropdowns), use an extra-diffused shadow: `box-shadow: 0 12px 40px rgba(26, 28, 28, 0.06);`. The shadow color is a tint of `on-surface`, never pure black.
- **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in a high-density data table), use `outline-variant` (#e2bfb9) at **15% opacity**. High-contrast, 100% opaque borders are strictly forbidden.

## 5. Components

### News & Event Cards

- **Structure:** No border. Use `surface-container-lowest` background.
- **Layout:** Use a vertical "stack" with `spacing-4` (1rem) between elements.
- **Detail:** Headlines in `headline-sm` (Newsreader). Metadata (dates/tags) in `label-md` (Public Sans) using the `tertiary` (#00137f) color for emphasis.

### The Industrial Calendar

- **Structure:** A structured grid layout where days are separated by white space (`spacing-px` or `spacing-0.5`) rather than lines.
- **Current Day:** Highlighted with a `primary-fixed` (#ffdad4) background and `on-primary-fixed` text.
- **Event Indicator:** Use a small `primary` circle. Do not use high-contrast boxes inside calendar cells.

### Grade & Data Tables

- **Header:** `surface-container-high` (#e8e8e8) with `title-sm` typography.
- **Rows:** Alternating background shifts (Zebra striping) using `surface` and `surface-container-low`.
- **Dividers:** Strictly forbidden. Use `spacing-2` (0.5rem) of padding to create visual separation.

### Buttons & Inputs

- **Primary Button:** `primary` (#570000) background, `on-primary` (#ffffff) text. Corner radius: `md` (0.375rem).
- **Secondary Button:** `secondary-container` (#e4e2e2) with `on-secondary-container` (#646464) text. No border.
- **Input Fields:** `surface-container-highest` (#e2e2e2) background with a `2px` bottom-only highlight in `primary` when focused.

## 6. Do’s and Don’ts

### Do:

- **Do** use `spacing-12` (3rem) or `spacing-16` (4rem) to separate major sections. Let the content breathe.
- **Do** use `Newsreader` for anything that feels like a "title" and `Public Sans` for anything that feels like "data."
- **Do** use `tertiary` (#00137f) sparingly as an accent color for interactive links or "Industrial" status tags.

### Don’t:

- **Don’t** use shadows on cards that are resting on the background. Use tonal shifts instead.
- **Don’t** use a border-radius larger than `lg` (0.5rem) except for "full" pill-shaped chips.
- **Don’t** use pure black (#000000) for text. Always use `on-surface` (#1a1c1c) to maintain a premium, ink-on-paper feel.
- **Don’t** use a standard "Calendar Grid" with heavy lines. Think of it as a clean, rhythmic distribution of numbers.
