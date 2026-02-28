# TriageAI — Frontend & Design System

> React 18 + Vite + Tailwind CSS + shadcn/ui — Dark theme, Linear-inspired dashboard

## Design Philosophy

- **Dark theme** — professional, trustworthy healthcare aesthetic
- **Data density done right** — CHC coordinator understands today's calls in < 30 seconds
- **Voice-first context** — callers never see UI; dashboard is for clinic staff only
- **Responsive** — desktop-first, tablet sidebar collapse, mobile bottom tab bar

## Color Palette

| Token | Hex | Usage |
|:------|:----|:------|
| `neutral-950` | `#0a0a0a` | Sidebar, deep backgrounds |
| `neutral-900` | `#171717` | Page backgrounds |
| `neutral-800` | `#262626` | Cards, inputs |
| `neutral-700` | `#404040` | Borders |
| `neutral-500` | `#737373` | Secondary text |
| `neutral-300` | `#d4d4d4` | Body text |
| `neutral-100` | `#f5f5f5` | Headings |
| `neutral-50` | `#fafafa` | Primary text |
| `primary-500` | `#22c55e` | CTA, active states, success |
| `primary-400` | `#4ade80` | Hover states |
| `primary-900` | `#14532d` | Active backgrounds |

### CTAS Level Colors

| Level | Background | Text | Border |
|:------|:-----------|:-----|:-------|
| L1 | `#450a0a` | `#ef4444` | `rgba(239,68,68,0.3)` |
| L2 | `#431407` | `#f97316` | `rgba(249,115,22,0.3)` |
| L3 | `#451a03` | `#f59e0b` | `rgba(245,158,11,0.3)` |
| L4 | `#042f2e` | `#14b8a6` | `rgba(20,184,166,0.3)` |
| L5 | `#052e16` | `#22c55e` | `rgba(34,197,94,0.3)` |

## Typography

| Token | Size | Weight | Line Height | Use |
|:------|:-----|:-------|:------------|:----|
| `display` | 56px | 800 | 1.05 | Hero headline |
| `h1` | 32px | 700 | 1.2 | Page titles |
| `h2` | 24px | 700 | 1.3 | Section headers |
| `h3` | 20px | 600 | 1.4 | Card titles |
| `body-lg` | 18px | 400 | 1.6 | Subheadlines |
| `body` | 15px | 400 | 1.5 | Default text |
| `body-sm` | 13px | 400 | 1.5 | Labels, nav |
| `caption` | 11px | 500 | 1.4 | Badges, timestamps |

**Fonts:** Inter Variable (sans), JetBrains Mono (mono)

## Screen Inventory

| ID | Screen | Route | Priority |
|:---|:-------|:------|:---------|
| SCR-01 | Landing Page | `/` | Sprint 7 |
| SCR-04 | Login Page | `/login` | Sprint 8 |
| SCR-05 | Dashboard Overview | `/dashboard` | Sprint 9 |
| SCR-06 | Sessions List | `/dashboard/sessions` | Sprint 9 |
| SCR-07 | Session Detail | `/dashboard/sessions/:id` | Sprint 10 |

## Key Components

### CTASBadge

```
display: inline-flex, align-items: center, gap: 6px
padding: 3px 8px, border-radius: 4px
font: caption (11px, 600), uppercase, letter-spacing: 0.06em
icon: AlertTriangle (10px) for L1/L2, Circle (10px) for L3–L5
```

### StatCard (Dashboard)

```
bg: neutral-800, border: 1px neutral-700, border-radius: 12px
padding: 20px 24px, hover: border-neutral-600 (200ms)
Label: caption uppercase, Value: h1 (32px, 800)
Trend: primary-500 + ArrowUp / #ef4444 + ArrowDown
```

### InputField States

| State | Border | Background | Extra |
|:------|:-------|:-----------|:------|
| Default | neutral-700 | neutral-800 | — |
| Hover | neutral-600 | neutral-800 | 150ms transition |
| Focus | primary-500 | neutral-800 | box-shadow: primary glow |
| Error | red-500 | red-950/20 | + error message below |
| Disabled | neutral-800 | neutral-900 | cursor: not-allowed |

## Responsive Breakpoints

| Breakpoint | Sidebar | Stats Grid | Behavior |
|:-----------|:--------|:-----------|:---------|
| ≥1440px | 240px full | 4 columns | Full layout |
| ≥1200px | 240px full | 4 columns | Full layout |
| ≥1024px | 72px icon-only | 4 columns | Text labels fade out |
| ≥768px | Hidden | 2 columns | Bottom tab bar appears |
| <768px | Hidden | 1 column | Stacked mobile layout |

## Animation Catalog

| Element | Trigger | Duration | Easing |
|:--------|:--------|:---------|:-------|
| Primary Button hover | Hover | 150ms | ease-out |
| Table row highlight | Hover | 100ms | ease-out |
| Page transition | Route change | 200ms | ease-in-out |
| Modal open | Open | 250ms | ease-out |
| Toast notification | Appear | 300ms | spring |
| Skeleton shimmer | Loading | 1.5s loop | ease-in-out |
| Donut chart segments | Mount | 600ms | ease-out |
| Stat card count-up | Data load | 800ms | ease-out |

## Accessibility (WCAG 2.1 AA)

- All text contrast ≥ 4.5:1 against background
- Focus indicators: 2px primary-500 outline
- Keyboard navigable: all interactive elements
- Screen reader: semantic HTML, ARIA labels on icons
- Reduced motion: respect `prefers-reduced-motion` media query
