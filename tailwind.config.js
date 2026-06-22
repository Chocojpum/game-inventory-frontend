/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  // Preflight is disabled: the app already ships its own reset and 18 components
  // rely on hand-written CSS. Keeping Tailwind to utilities-only avoids base-reset
  // regressions while still letting us use the utility classes for reworked views.
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // Surfaces
        base: 'var(--c-base)',
        surface: 'var(--c-surface)',
        'surface-2': 'var(--c-surface-2)',
        'surface-3': 'var(--c-surface-3)',
        border: 'var(--c-border)',
        // Brand — channel-based so opacity modifiers (bg-brand/90 etc.) work.
        brand: {
          DEFAULT: 'rgb(var(--c-brand-rgb) / <alpha-value>)',
          strong: 'var(--c-brand-strong)',
          soft: 'var(--c-brand-soft)',
        },
        accent: 'rgb(var(--c-accent-rgb) / <alpha-value>)',
        // Text
        ink: 'var(--c-text)',
        'ink-muted': 'var(--c-text-muted)',
        'ink-subtle': 'var(--c-text-subtle)',
        // Semantic — channel-based so tints like bg-success/15 apply an alpha.
        success: 'rgb(var(--c-success-rgb) / <alpha-value>)',
        warning: 'rgb(var(--c-warning-rgb) / <alpha-value>)',
        danger: 'rgb(var(--c-danger-rgb) / <alpha-value>)',
        info: 'rgb(var(--c-info-rgb) / <alpha-value>)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 4px 16px rgba(0, 0, 0, 0.35)',
        'card-hover': '0 12px 32px rgba(0, 0, 0, 0.45)',
        pop: '0 8px 28px rgba(0, 0, 0, 0.5)',
        focus: '0 0 0 3px var(--c-focus-ring)',
      },
      fontFamily: {
        sans: [
          '"Lucida Sans"',
          '"Lucida Sans Regular"',
          '"Lucida Grande"',
          '"Lucida Sans Unicode"',
          'Geneva',
          'Verdana',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
