# DOPPEL Design System & Token Architecture

The DOPPEL interface is built on a restrained, human-engineered design language that avoids generic templates and AI-generator tropes (excessive glowing neon gradients, floating cards without hierarchy, buzzwords).

---

## 🎨 Color Palette & Semantic Tokens

All UI elements draw strictly from a semantic palette defined in `globals.css` and `tailwind.config.js`.

### Surface & Background Tokens
| Token | Hex Value | Purpose |
|---|---|---|
| `--bg-main` / `bg-surface-main` | `#090C10` | Primary app canvas |
| `--surface-main` / `bg-surface-card` | `#0F141C` | Standard content card surface |
| `--surface-elevated` | `#161B26` | Interactive & elevated modules |
| `--surface-border` | `#1E2638` | Subtle structural division |
| `border-surface-subtle` | `#131924` | Internal card separators |

### Content Tokens
| Token | Hex Value | Purpose |
|---|---|---|
| `text-content-primary` | `#F8FAFC` | Headings and high-contrast labels |
| `text-content-secondary` | `#94A3B8` | Body paragraphs and descriptions |
| `text-content-muted` | `#64748B` | Timestamps, metadata, technical annotations |

### Accent & Feedback Tokens
| Token | Hex Value | Usage |
|---|---|---|
| `brand-cyan` | `#00D8E6` | Primary action buttons, active tabs, telemetry highlights |
| `brand-cyanHover` | `#00B8C4` | Primary hover state |
| `status-success` | `#10B981` | Verification passes, enrolled status, high match confidence |
| `status-warning` | `#F59E0B` | Paused discovery, suboptimal lighting warning |
| `status-danger` | `#EF4444` | Face rejection, account deletion, block/report actions |

---

## 🔠 Typography System

- **Primary Typeface**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Monospace Typeface**: System Mono (used for latency metrics, rankings, coordinates, and vector IDs)
- **Hierarchy**:
  - `h1`: 32px – 40px, font-extrabold, tracking-tight
  - `h2`: 20px – 24px, font-bold
  - `h3`: 14px – 16px, font-semibold
  - `body`: 13px – 14px, line-height 1.5
  - `micro / meta`: 10px – 12px, font-mono, uppercase tracking-wider

---

## 📐 Spacing & Layout Rhythm

- **Scale**: `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `40px`, `48px`, `64px`
- **Border Radii**:
  - Buttons / Badges: `8px` (`rounded-lg`)
  - Content Cards: `12px – 16px` (`rounded-xl` / `rounded-2xl`)
  - Modals: `20px` (`rounded-2xl`)
- **Elevation**:
  - `shadow-panel`: `0 4px 16px -2px rgba(0, 0, 0, 0.4)`
  - `shadow-panelHover`: `0 8px 24px -4px rgba(0, 0, 0, 0.5)`

---

## 🧩 Component Concept Architecture

Components directly mirror core domain models:
- **`MatchCard`**: Ranked card showing visual twin avatar, cosine similarity, location, and bio.
- **`SimilarityMeter`**: Mathematical cosine distance bar with manifold coordinate telemetry.
- **`ComparisonViewer`**: Clean side-by-side portrait inspector with enrollment badge.
- **`QualityChecklist`**: Live biometric verification feedback (face count, Laplacian sharpness, illumination).
- **`Navbar` / `Footer`**: Accessible navigation with consent status indicator.
