# Task: Unify the ValeCasa design system in code (tokens, buttons, components)

You are working in the ValeCasa codebase: a real estate portal for Guaratinguetá and the Vale do Paraíba region (Brazil). Stack observed on the staging site (hlg.valecasa.com.br): **Next.js (App Router) + Tailwind CSS v4 + shadcn/ui**, Geologica font via `next/font`, icons currently from `lucide-react`.

The visual identity is already defined (brand book + design system). The code has not caught up: the shadcn theme is still the factory default, colors come from ~18 loose Tailwind palettes and hardcoded hex values, and buttons are styled ad hoc with long inline class strings. Your job is to **consolidate everything into one token layer and one set of reusable components, without breaking any existing behavior**, and then document it.

All user-facing text stays in **Brazilian Portuguese**. Code, comments, and the final documentation are in English unless a string is UI copy.

---

## 0. Ground rules (read before touching anything)

1. **Do not change business logic.** Keep every `onClick`, `onSubmit`, `href`, router call, data fetch, state hook, analytics event, form validation, and conditional rendering exactly as it is. You are changing *how things look and how styles are organized*, not *what they do*.
2. **Keep component public APIs backward compatible.** If you change a component's props, keep the old props working (map them to the new variant) or update every call site in the same change.
3. **Do not delete files outside the scope of this task.** If something looks unused, list it in the report instead of removing it.
4. **Work in phases (below) and stop after Phase 1 to present the plan.** Do not start Phase 2 until the plan is approved.
5. **After every phase:** run the type checker, linter, and production build (`tsc --noEmit`, `next lint` or the project's lint script, `next build`). All must pass before moving on. If a test suite exists, run it too.
6. **Visual parity first, then improvement.** When you replace an inline-styled button with the shared `Button`, the result should look the same or closer to the brand spec below. Never leave a screen visually broken.
7. Prefer small, reviewable commits grouped by concern (tokens → button → other primitives → page migrations → docs).
8. If something is ambiguous, write the question in the report and choose the most conservative option.

---

## 1. Phase 1 — Audit and plan (no code changes yet)

Produce a written report (in the chat, not a file yet) covering:

### 1.1 Find the styling sources
- Locate the global stylesheet (likely `app/globals.css` or `src/app/globals.css`; the user calls it "global.css").
- Check whether a `tailwind.config.(js|ts)` exists. This project uses **Tailwind v4**, where tokens normally live in CSS via `@theme`. If a config file exists (or `@config` is used), report how both are wired. **Recommendation: keep tokens CSS-first in `@theme` inside globals.css; only keep `tailwind.config` for plugins or content paths if it is actually needed.**
- Locate `components.json` (shadcn config) and the shadcn UI folder (usually `components/ui/`).
- Locate the main components folder (e.g. `components/` or `src/components/`). This is where the final documentation file will be saved.

### 1.2 Inventory
List, with file paths and counts:
- Every **button-like element**: `<button>`, `<a>` styled as a button, shadcn `<Button>` with `className` overrides, `Link` with button classes, icon buttons, toggle buttons (Comprar/Alugar), filter pills, tabs that look like buttons (e.g. "Todos / Casas / Apartamentos / Loteamentos" on /lancamentos).
- Group them into **visual patterns** (e.g. "green pill CTA", "outline pill", "ghost header link", "icon circle on photo"). Show how many call sites each pattern has and which ones use long inline class strings or hardcoded colors.
- Every **hardcoded color**: arbitrary values like `bg-[#4d00af]`, `from-[#4d00af] to-[#6a00ff]`, inline `style={{ color: ... }}`, and raw Tailwind palette classes (`purple-900`, `orange-600`, `zinc-400`, `emerald-*`, `violet-*`, `gray-*`, etc.).
- Arbitrary radii and font sizes (`rounded-[14px]`, `text-[13px]`, etc.).
- Other repeated UI patterns that should become components: property card, launch card, contact/price card, advertiser card (broker / agency / builder), neighborhood card, badges, chips/filter pills, segmented toggle, search bar, attribute stats (quartos/banheiros/vagas/área), amenities list, empty states, image placeholder.
- Icon usage: every `lucide-react` import.

### 1.3 Proposed plan
- The final token layer (section 2 below, adapted to what you found).
- The final `Button` variant/size matrix and the mapping from each existing pattern to a variant.
- The list of new subcomponents you will create (section 4), their props, and which files will adopt them.
- A migration table: `old classes / pattern → new token or component`.
- Risks and any place where you are unsure the change is purely visual.

**Stop here and wait for approval.**

---

## 2. Phase 2 — Tokens (globals.css)

Replace the factory shadcn theme with the ValeCasa tokens. Keep the existing custom names working so nothing breaks.

Current state found on staging:
- `--primary: #171717` (shadcn default, black), `--border: #e5e5e5`, `--ring: #a1a1a1`.
- Only brand tokens: `--color-valecasa-green-primary: #08FFA0` (wrong; the official green is `#03FE9F`) and `--color-valecasa-green-secondary: #00B997` (not in the brand book).
- No purple token. Footer uses `bg-purple-900` (#59168B). Tabs on /lancamentos use `from-[#4d00af] to-[#6a00ff]` (this IS the official gradient, it just needs to become a token).
- Neighborhood label uses `text-orange-600` (#F54900).

Apply this token layer (merge with whatever else globals.css needs; keep `@import "tailwindcss"`, plugins, `@custom-variant dark`, and any existing base layer rules):

```css
@theme inline {
  --font-sans: var(--font-geologica-sans), ui-sans-serif, "Segoe UI", system-ui, sans-serif;

  /* Green · action (official = 500) */
  --color-vc-green-50: #E6FFF5;
  --color-vc-green-100: #BDFFE6;
  --color-vc-green-300: #6BFFC8;
  --color-vc-green-500: #03FE9F;
  --color-vc-green-600: #1FCC8A;   /* backgrounds/illustration only (2.1:1 on white) */
  --color-vc-green-700: #007F50;   /* green TEXT on white (4.9:1) */
  --color-vc-green-ink: #00331F;   /* text ON green 500 */

  /* Purple · institutional (official = 600) */
  --color-vc-purple-50: #F3ECFF;
  --color-vc-purple-100: #E2C9F8;
  --color-vc-purple-400: #8A4DF0;
  --color-vc-purple-500: #6514D6;
  --color-vc-purple-600: #4D00AF;
  --color-vc-purple-700: #3D008C;
  --color-vc-purple-900: #22004F;

  /* Yellow · tertiary (accent and illustration, never text on white) */
  --color-vc-sun-50: #FBF3E7;
  --color-vc-sun-500: #FFDA00;
  --color-vc-sun-700: #E09200;

  /* Support */
  --color-vc-coral: #E5483B;       /* official "location" color: neighborhood + category label only */
  --color-vc-star: #F5B400;
  --color-vc-link: #1F6FE0;

  /* Neutrals (slight violet bias) */
  --color-vc-ink: #140E1B;
  --color-vc-ink-2: #4E4A5E;
  --color-vc-ink-3: #817C93;
  --color-vc-line: #E3E0EC;
  --color-vc-line-strong: #C9C5D6;
  --color-vc-surface-2: #F1EFF7;
  --color-vc-bg: #F7F6FB;

  /* Official gradients — use as bg-[image:var(--gradient-vc-purple)] or a utility */
  --gradient-vc-purple: linear-gradient(135deg, #4D00AF, #6A00FF);
  --gradient-vc-green: linear-gradient(135deg, #1FCC8A, #03FE9F);
  --gradient-vc-lilac: linear-gradient(135deg, rgb(77 0 175 / .45), rgb(3 254 159 / .55));

  /* Backward compatibility — existing classes keep working, now with correct values */
  --color-valecasa-green-primary: var(--color-vc-green-500);
  --color-valecasa-green-secondary: var(--color-vc-green-700);

  /* Radius scale from --radius (10px): sm 6 · md 8 · lg 10 · xl 14 */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  /* shadcn semantic mapping */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
}

:root {
  --radius: 0.625rem;
  --background: #FFFFFF;
  --foreground: #140E1B;
  --card: #FFFFFF;
  --card-foreground: #140E1B;
  --popover: #FFFFFF;
  --popover-foreground: #140E1B;
  --primary: #03FE9F;            /* default button = green pill CTA */
  --primary-foreground: #00331F;
  --secondary: #F3ECFF;
  --secondary-foreground: #4D00AF;
  --muted: #F1EFF7;
  --muted-foreground: #4E4A5E;
  --accent: #F3ECFF;
  --accent-foreground: #4D00AF;
  --destructive: #DC2626;
  --border: #E3E0EC;
  --input: #C9C5D6;
  --ring: #6514D6;
}

.dark {
  --background: #121019;
  --foreground: #F3F1F8;
  --card: #1B1824;
  --card-foreground: #F3F1F8;
  --popover: #1B1824;
  --popover-foreground: #F3F1F8;
  --primary: #03FE9F;
  --primary-foreground: #00331F;
  --secondary: #2A1A55;
  --secondary-foreground: #E2C9F8;
  --muted: #24202F;
  --muted-foreground: #C4BFD3;
  --accent: #2A1A55;
  --accent-foreground: #E2C9F8;
  --destructive: #F87171;
  --border: #302B3D;
  --input: #463F57;
  --ring: #8A4DF0;
}
```

**Side effect to handle in this phase:** `--primary` changes from black to green. Search for every `text-primary`, `bg-primary`, `border-primary`, `ring-primary`, `selection:bg-primary` usage and confirm each still makes sense. Known case: the category icons on /lancamentos tabs use `text-primary` and must become `text-vc-purple-600` (green icons on white fail contrast).

Contrast rules to enforce:
- Never white text on `vc-green-500` → use `text-vc-green-ink`.
- Green text on white → `text-vc-green-700` only.
- `vc-green-600` and `vc-sun-500` are background/illustration colors, never text on white.
- White text on `vc-purple-600` is fine (11:1).

---

## 3. Phase 3 — One Button to rule them all

Extend the existing shadcn `components/ui/button.tsx` (it uses `cva`). **Do not create a second button component.** Add variants and sizes so that every button pattern in the app maps to `<Button variant=… size=…>` with at most layout classes (`w-full`, margins) in `className`.

Brand spec:
- Primary CTA: green pill. "Anunciar imóvel", "Entrar em contato", "Contatar anunciante", search submit.
- Secondary: outline pill, dark border, white surface. "Chamar no WhatsApp", "Salvar imóvel", "Compartilhar", "Enviar para alguém".
- Brand: purple, used in brand areas (broker search, hero search on purple).
- Ghost: header links ("Entrar", "Criar conta").
- Link: blue text link ("Viu algo errado neste anúncio? Avisa a gente.").
- Icon: circular icon button over photos (favorite heart, share), 44×44 px hit area minimum.

Suggested matrix (adjust names to what already exists, keeping old names as aliases):

| variant | classes (intent) |
|---|---|
| `default` / `primary` | `bg-primary text-primary-foreground hover:bg-vc-green-300 rounded-full font-semibold` |
| `outline` | `border-[1.5px] border-foreground bg-background text-foreground hover:bg-muted rounded-full` |
| `brand` | `bg-vc-purple-600 text-white hover:bg-vc-purple-700 rounded-md uppercase tracking-wide` |
| `brandGradient` | `bg-[image:var(--gradient-vc-purple)] text-white` (tabs like "Todos") |
| `ghost` | `hover:bg-muted text-foreground` |
| `link` | `text-vc-link underline-offset-4 hover:underline p-0 h-auto` |
| `destructive` | keep shadcn default, now using the new `--destructive` |
| `icon` (variant or size) | `rounded-full bg-white/90 text-vc-ink shadow-sm size-11` |

| size | intent |
|---|---|
| `sm` | 32px height, 12px text |
| `default` | 40px height, 14px text |
| `lg` | 48px height, 16–18px text (current header CTA) |
| `icon` | 44×44 |

States: `disabled` (opacity-50, no pointer), `focus-visible` ring using `--ring`, `aria-pressed="true"` styling for toggles. Also support `asChild` (already in shadcn) so `Link` buttons stop duplicating classes.

Then **migrate every button call site** found in Phase 1:
- Replace long inline class strings with `variant`/`size`.
- Remove hardcoded colors.
- Keep handlers, `type`, `href`, `disabled`, `aria-*`, and `data-*` attributes untouched.
- Report any button you could not migrate safely and why.

---

## 4. Phase 4 — Subcomponents

Create these (or refactor existing equivalents) in the components folder, composing shadcn primitives where possible (`Badge`, `Card`, `Tabs`, `ToggleGroup`, `Toggle`, `Input`, `Carousel`). Each must use only tokens, no hex values.

1. **`Badge` variants** (extend shadcn badge): `rent` (green-100 bg, green-700 text), `sale` (purple-50 bg, purple-700 text), `launch` (purple-600 bg, white), `new` (coral bg, white), `owner` (outline, small caps), `photoCount` (white bg over photo).
2. **`FilterChip`**: pill with chevron, `aria-pressed` active state = green-100 bg + green-600 border. Plus "Limpar filtros" text button.
3. **`SegmentedToggle`** (Comprar / Alugar): based on shadcn `ToggleGroup`; active item = green-500 bg + green-ink text.
4. **`SearchBar`**: input + segmented toggle + submit `Button`. One component for home hero, listing page, and /lancamentos.
5. **`PropertyCard`**: photo (carousel optional) → neighborhood (`text-vc-coral`) → total price (`R$ 2.150/mês total`) → breakdown → title (2 lines max) → attributes row. Props for `business: "rent" | "sale"`, `layout: "vertical" | "compact"`, `photos: string[]` with an **empty-photo placeholder** state.
6. **`LaunchCard`**: badge "Lançamento", builder logo, name, "A partir de R$ 799.000", attributes. Props `layout: "vertical" | "horizontal" | "showcase"`, `status: "na-planta" | "em-obras" | "pronto"`.
7. **`ContactCard`** (sidebar on property page): price header, breakdown list, advertiser block, primary CTA "Entrar em contato", outline "Chamar no WhatsApp", link "Viu algo errado neste anúncio? Avisa a gente.". Props `business: "sale" | "rent" | "both"` (both = tabs), `advertiser: { type: "owner" | "broker" | "agency" | "builder", name, creci?, photo?, logo? }`. **The advertiser badge must come from `advertiser.type`** (today a real-estate agency is labeled "PROPRIETÁRIO").
8. **`AdvertiserCard`**: broker (photo) / agency (logo) / builder (logo) + "25 imóveis" pill.
9. **`NeighborhoodCard`**: photo with purple overlay, name, optional average price.
10. **`AttributeStat`** and **`AttributeRow`**: icon + value + label (quartos, suítes, banheiros, vagas, área). Area formatting helper: `formatArea(67) → "67 m²"`.
11. **`AmenityList`**: renders amenities with the ValeCasa amenity icons (see section 5), falling back to a check icon when no icon exists.
12. **`EmptyState`**: illustration + title + text + optional action. Used for: no search results, no launches, no favorites, 404, generic error.
13. **`PriceText`** / `formatBRL`: one formatter for all prices (`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })`). The Figma has "R$ 799,000" (wrong separator); the code must always output "R$ 799.000".

Keep each component small; split into subcomponents (e.g. `PropertyCard.Media`, `PropertyCard.Price`) only if it simplifies reuse.

---

## 5. Phase 5 — Icons

- The brand uses **Heroicons v2, outline, 24px, stroke 1.5**. Install `@heroicons/react` and migrate `lucide-react` usages one screen at a time (map each lucide icon to its Heroicons equivalent; list any without equivalent).
- ValeCasa has a custom amenity icon set (150 icons on the same grid). The package `comodidades-valecasa-v1.0.zip` contains `svg/`, `comodidades-sprite.svg` (symbols `vc-<id>`), and `comodidades.json` (id, Portuguese name, category, aliases, plus `etiquetas` = items that render as text tags, not icons). Ask the user for the zip if it is not in the repo; place the sprite in `public/icons/` and create an `AmenityIcon` component that resolves an amenity name (or alias, accent-insensitive) to its sprite id.
- Do not remove lucide-react until no imports remain; report the remaining ones.

---

## 6. Phase 6 — Known bugs from the staging audit (fix only if purely visual)

1. **Header overflows at 1024px** (page becomes 1046px wide, "Anunciar" is clipped). Switch the desktop nav to show from `lg` instead of `md`, or reduce text size between `md` and `lg`.
2. **Duplicated area unit** on cards: "64m² m²". Use `formatArea`.
3. **Map loader overlay** on the property page: a white panel with a spinner stays on top of the map after it loads. Hide it on the map's load event or replace with a map-sized skeleton. If this depends on map library logic you are not sure about, report instead of changing.
4. **Card without photos** shows a grey box with carousel dots. Use the `PropertyCard` empty-photo placeholder.
5. **Neighborhood color**: `text-orange-600` → `text-vc-coral`.
6. **Footer**: `bg-purple-900` → `bg-vc-purple-600`.
7. **Tap targets**: carousel dots and favorite buttons need ≥ 44×44 px hit areas on mobile (keep the visual size, add padding).

Do **not** change data rules (e.g. how the advertiser type is computed on the server) — only make the UI read the field correctly and report if the field is missing.

---

## 7. UI copy (Portuguese, brand voice: warm, direct, local, never corporate)

Apply only where you are already editing the component:

| Where | Current | New |
|---|---|---|
| Header CTA | Anunciar | Anunciar imóvel |
| Contact card CTA | Contato / Contatar anunciante | Entrar em contato |
| Report link | Denunciar Anúncio (red) / Algo de errado com este anúncio? Nos informe | Viu algo errado neste anúncio? Avisa a gente. (blue link) |
| Search placeholder | Busque por Bairro, Rua ou CEP | Bairro, rua ou CEP |
| Empty search | — | Nada com esses filtros no bairro. Tira o filtro de preço ou olha os bairros vizinhos. |
| Empty launches | — | Nenhum lançamento em Guará agora. Quer receber um aviso quando sair o próximo? |
| No photos | — | Sem fotos ainda |

---

## 8. Phase 7 — Documentation

When all phases are done, create **`DESIGN-SYSTEM.md` in the main components folder** (the same folder that contains `ui/`, e.g. `components/DESIGN-SYSTEM.md` or `src/components/DESIGN-SYSTEM.md`). It is the reference for anyone (human or AI) building new screens. Include:

1. **Principles**: tokens only (no hex, no raw Tailwind palettes), one Button, Heroicons outline 1.5, Portuguese UI copy in brand voice.
2. **Tokens**: table of every color token with hex, role, and allowed usage (text vs background), gradients, radius scale, font.
3. **Contrast rules** (section 2).
4. **Button**: full variant × size matrix with a code example for each, plus "which variant for which action" guidance.
5. **Components catalog**: for each component in section 4 → purpose, import path, props table, minimal usage example, do/don't.
6. **Icons**: how to use Heroicons and `AmenityIcon`, sizes (16 lists, 20 cards, 24 actions, 28 amenity blocks).
7. **Formatting helpers**: `formatBRL`, `formatArea`, date/“Publicado há”.
8. **Recipes**: how to compose a new listing page, a property detail sidebar, and an empty state using only these components.
9. **Migration notes**: what was replaced, legacy aliases still supported (`valecasa-green-primary`, old button props), and anything left to migrate.
10. **Checklist for new screens**: tokens only, Button variants only, focus states, 44px tap targets, mobile at 375px without horizontal scroll, copy reviewed against the voice guide.

---

## 9. Definition of done

- `tsc`, lint, and `next build` pass.
- No arbitrary hex colors (`\[#`) and no raw palette color classes (`purple-`, `violet-`, `emerald-`, `orange-`, `zinc-`, `gray-`, etc.) remain in components, except inside globals.css tokens. Provide the grep command and its output.
- Every button in the app uses `Button` (or a documented exception).
- All screens checked at 375px, 768px, 1024px, and 1440px: no horizontal scroll, no visual regressions.
- `DESIGN-SYSTEM.md` exists in the components folder and matches the code.
- Final report lists: files changed, components created, call sites migrated, anything skipped and why, open questions.
