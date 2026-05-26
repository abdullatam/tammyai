# TAMMY — BRAND & DESIGN SYSTEM
### Visual identity · Color · Typography · Tone · Motion
> v0.3 — April 2026
> Purple foundation · three combinations · the oud recommended.

---

## WHAT I READ IN YOUR INSPIRATION

Across your references the thread that runs through all of them isn't a color. It's a posture.

Dark-first. Single vibrant accent. An ethereal orb as the product's avatar. Editorial restraint. Minimal chrome. Prose where others use chat bubbles. No SaaS clutter.

The shared feeling: a product that thinks. Not a product that chirps. That's the floor we design from.

### The three north stars

Three specific references you called out as the things to build toward. The rest of this document designs around them.

**North Star 1 — the Voice Assessment orb.** A translucent sphere on pure black with luminous, smoke-like forms flowing *inside* it — like wind caught in glass. The outer shell is barely there; the interior is what moves. This is Tammy's face. Spec in *Visual Language → The Orb*.

**North Star 2 — the refined floating sidebar.** Your own render — a slim glassy capsule on deep violet, icon-only, with an amber glow behind the active item. The user's initial sits below the pill in a warm violet-to-amber gradient circle. This is the desktop nav pattern. Spec in *Visual Language → Navigation*.

**North Star 3 — the mobile home screen.** Dark canvas, editorial greeting, hero card with a breathing 3D visual, horizontally scrolling mode pills, a list of recent sessions, floating bottom nav with the voice action highlighted at center. This is Tammy's Today screen. Spec in *Visual Language → Mobile home*.

---

## BRAND SOUL — BEFORE COLOR

Before any hex code, the brand decides what it feels like. For Tammy, five words:

**Intimate. Deep. Warm. Sharp. Cultural.**

Not soft — Tammy challenges. Not clinical — she's a friend. Not generic AI — she's from Amman. Not loud — she knows when to whisper.

Every color, font, and layout choice gets measured against those five.

---

## THREE PURPLE COMBINATIONS

Purple is the foundation — deep, interior, reflective, distinct from every other AI product on the market. The question is only what lives beside it. Below are three options, each a complete system.

---

### COMBO A — THE OUD (Recommended)
*Deep violet + amber gold*

The oud is a MENA native — a warm, dark, unmistakable scent. This palette is its visual equivalent: a violet so deep it reads almost black, pierced by amber gold at the moments that matter.

**Why it fits Tammy**
- Violet reads as interior life, introspection — exactly the work Tammy does.
- Amber is the warmth of a late Amman afternoon. It stops the violet from going cold or mystical.
- Zero overlap with other AI products. Instant differentiation.
- Both MENA traditions echo here: Arabic manuscript gold, Phoenician purple.

**Color system**

| Role | Name | Hex | Use |
|---|---|---|---|
| Ink | Ink | `#0E0817` | Outermost background |
| Base | Deep Violet | `#1F1138` | Cards, elevated surfaces |
| Mid | Iris | `#6B3FA0` | Button fills, active nav rail |
| Edge | Mauve | `#B29DD9` | Borders, secondary text |
| Accent | Amber | `#E8A24B` | CTAs, emphasis, active states |
| Accent high | Warm Gold | `#F4C77A` | Hover, breakthrough moments |
| Text | Ivory | `#F2EBDC` | Body text on dark |
| Muted | Dust | `#A89BB3` | Metadata, secondary |
| Growth | Sage | `#7BB896` | Milestones, positive delta |
| Tension | Sienna | `#D97757` | Warnings, avoidance flags |

---

### COMBO B — THE LILAC DAWN
*Deep violet + soft peach*

A softer cousin to The Oud. Trades amber's boldness for a warmer, more feminine-coded peach pink. The feeling: early morning light in Wadi Rum. Still serious, still dark, but gentler on the eye.

**Why it fits Tammy**
- Peach reads as empathy and emotional warmth — reinforces Tammy's friend-who-tells-truth identity.
- Still distinct in the AI market (no one is using peach as an accent).
- More approachable for users who would find amber too stark.

**Tradeoff**
- Slightly less sharp. Tammy's voice is direct; a softer accent slightly undersells her.
- Could skew too "lifestyle app" if not disciplined.

**Color system**

| Role | Name | Hex | Use |
|---|---|---|---|
| Ink | Ink | `#0E0817` | Background |
| Base | Deep Violet | `#1F1138` | Cards |
| Mid | Iris | `#6B3FA0` | Buttons, active |
| Edge | Mauve | `#B29DD9` | Borders |
| Accent | Peach | `#F4A896` | CTAs, emphasis |
| Accent high | Warm Peach | `#FBCABA` | Hover |
| Text | Ivory | `#F5EDE3` | Body |
| Muted | Dust | `#A89BB3` | Metadata |
| Growth | Sage | `#7BB896` | Milestones |
| Tension | Rose | `#E57A7A` | Warnings |

---

### COMBO C — THE PETRA
*Deep violet + terracotta clay*

The boldest of the three. Violet meets the warm stone color of Petra's cliffs — earthbound, architectural, unmistakably Jordanian.

**Why it fits Tammy**
- The most MENA-coded of the three combinations. Petra is the single strongest cultural visual in the region.
- Terracotta reads as grounded, weighty, built-to-last — matches Tammy's role as a long-term co-founder.
- Visually more striking than amber; harder to forget.

**Tradeoff**
- Terracotta is a warm red-orange. Tension/warning states are harder to color-code because they'd collide with the accent. Requires more careful state design.
- More male-coded than The Oud or Lilac Dawn.

**Color system**

| Role | Name | Hex | Use |
|---|---|---|---|
| Ink | Ink | `#0E0817` | Background |
| Base | Deep Violet | `#1F1138` | Cards |
| Mid | Iris | `#6B3FA0` | Buttons, active |
| Edge | Mauve | `#B29DD9` | Borders |
| Accent | Terracotta | `#C86B4A` | CTAs, emphasis |
| Accent high | Clay | `#E0946F` | Hover |
| Text | Ivory | `#F2EBDC` | Body |
| Muted | Dust | `#A89BB3` | Metadata |
| Growth | Olive | `#8BA05C` | Milestones (swapped from sage to harmonize) |
| Tension | Deep Rust | `#A54225` | Warnings (darker than accent) |

---

## TYPOGRAPHY

Tammy speaks bilingually. The typography has to make Arabic and English feel like siblings, not translations.

**Recommended stack (all free via Google Fonts)**

| Role | Font | Why |
|---|---|---|
| Body UI — English | IBM Plex Sans | Humanist, warm, matched Arabic sibling. Not Inter. |
| Body UI — Arabic | IBM Plex Sans Arabic | Designed as a family with the Latin version. Identical weights. |
| Display / editorial | Instrument Serif | For the moments Tammy speaks with weight. |
| Monospace | IBM Plex Mono | Technical moments, metadata timestamps. |

**The editorial move — the one thing to remember**

When Tammy delivers an insight, a milestone, or a heavy line, set it in **Instrument Serif** at generous size (28–42px), not in the UI sans. This single move — switching typefaces when she speaks with weight — is one of the most distinctive things in the whole system.

It tells the user: *this isn't an interface line, this is her.*

The surrounding UI stays in IBM Plex Sans. The contrast is the point.

---

## VISUAL LANGUAGE

### The Orb — Tammy's face

Tammy has an orb. Not optional — it's her presence.

**The exact aesthetic: the Voice Assessment sphere.** A translucent outer shell on pure black, with luminous smoke-like forms flowing *inside* it. Like wind trapped in glass. The outer sphere is barely there — you see it mostly by edge refraction. The interior is what moves.

Not a solid ball. Not a pulsing waveform. Not a rotating ring. A *fluid presence* that feels alive.

**Specs**
- Pure near-black canvas (`#0E0817`)
- Outer sphere: 1px stroke at ~20% accent-color opacity, subtle inner gradient for glass-refraction feel
- Interior: 3–5 flowing, overlapping organic forms (bezier curves or noise-displaced meshes) in the accent color at 40–70% opacity, heavily blurred (~4px Gaussian), moving independently
- Outer atmospheric glow via drop-shadow in accent color, 60–80px spread, ~40% opacity
- Ambient radial gradient behind the orb at ~5% accent opacity — the orb sits in its own pool of light

**Motion**
- Breathing: scale 0.95 → 1.05 over 5–6 seconds, ease-in-out, infinite
- Interior wisps: each moves on its own 12–20 second cycle, independent paths, so the form never repeats
- Never fully still, even when idle

**States — the orb is Tammy's emotional display**

| State | Visual |
|---|---|
| Listening | Slow breathe, wisps in signature accent |
| Thinking | Wisps contract inward, outer glow dims slightly |
| Speaking | Wisp amplitude pulses with speech cadence (tied to TTS envelope) |
| Dissonance detected | Brief 800ms hue shift toward tension accent, then return |
| Milestone | Warm gold flare from center, 1.2s — rare, symbolic |
| Dangerous quiet | Desaturated color, slower breathe — present but concerned |

**Build recommendation**
One component, reused everywhere. Web: Three.js custom fragment shader is the long-term answer. SVG with animated filter primitives gets 80% of the feel with zero GPU cost and works today. Start with SVG, graduate to WebGL. React Native: `@shopify/react-native-skia`.

---

### Navigation — the refined floating pill

Locked reference: your own render. Thin, elegant, not overbuilt.

**Proportions (desktop)**
- Width: **56–60px**. Narrow. Never 80px+.
- Height: ~60% of viewport. Floats vertically-centered.
- Fully rounded capsule; no sharp corners anywhere.
- Horizontal padding: 18px. Vertical rhythm between icons: **~62px**. Breathes.

**Surface**
- Semi-transparent violet tint: `rgba(31, 17, 56, 0.55)` layered over the ink canvas.
- `backdrop-filter: blur(14px)` — glass.
- 1px border: `rgba(178, 157, 217, 0.12)` — a whisper, not a line.
- Inset highlight on the top edge: `inset 0 1px 0 rgba(255, 255, 255, 0.04)`.
- Drop shadow: `0 20px 60px rgba(0, 0, 0, 0.4)` — lifts it off the canvas.

**Icons**
- 22px, monoline weight, warm ivory (`#F2EBDC`) at **55% opacity** when inactive.
- Hover: opacity rises to 85%.
- Active: icon sits inside a **solid amber disk** (`#E8A24B`), icon color flips to deep violet (`#1F1138`), and the disk has a **soft radial glow** extending ~20px in amber at 30% opacity. This is the moment that sells the whole component.

**The user's identity circle**
- Sits **~30px below the pill**, never inside it.
- A 48px circle filled with a warm gradient from iris to amber (`linear-gradient(135deg, #6B3FA0, #E8A24B)`).
- The user's first-name initial centered inside in **Instrument Serif italic** at ~20px, ivory color.
- Double border: 2px ink (blending it onto canvas) plus a hairline ivory ring at 8% opacity.
- The initial in italic serif is the single most human touch in the entire UI chrome. Keep it.

**The seven destinations**

| # | Glyph | Destination | Purpose |
|---|---|---|---|
| 1 | sunrise | Today | Morning read, home |
| 2 | chat-square | Chat | Conversation |
| 3 | activity | The Arc | Growth timeline, emotional arc |
| 4 | compass | Decisions | Decision log and follow-ups |
| 5 | sparkle | Insights | What Tammy has surfaced |
| 6 | archive | Memory | What she remembers |
| 7 | settings | Settings | Voice, language, subscription |

---

### Mobile home — the Today screen

Structural reference: the phone mockup. Dark canvas, editorial greeting, hero card with breathing visual, mode pills, recent sessions list, floating 3-icon bottom nav.

**Anatomy — top to bottom**

1. **Minimal top frame**
   - Top-left: small translucent square button (16px radius) — opens a drawer for secondary destinations (Decisions, Insights, Memory, Settings). Icon: a soft hamburger in ivory at 60%.
   - Top-right: circular profile avatar, 40px, with a subtle amber ring glow. Tap opens profile.
   - No logo, no app title. The screen is Tammy's.

2. **Greeting — small and intimate**
   - Muted, small, lowercase, `IBM Plex Sans` 14px at 55% opacity: `good morning,` or `late again,` or `welcome back.` or `been a minute.`
   - Phrase chosen by Tammy based on gap length and last emotional state — never hardcoded.
   - Followed by the user's first name on the same or next line, also muted.

3. **The hero line — her opening question**
   - `Instrument Serif`, ~38–42px, line-height 1.05, up to two lines.
   - Content is dynamic:
     - Gap under 12 hours: `ready to pick it up?`
     - Gap over 2 days: `where are we?`
     - Pending decision: `you have something waiting.`
     - Dangerous quiet detected: `i want to check on you.`
     - Default: `what's on your chest?`
   - **Never** `How can I assist you today?` That's a help desk. Tammy is not a help desk.

4. **Hero voice card — the primary action**
   - Full-width rounded card, ~24px radius.
   - Background: soft violet-to-amber gradient at low saturation (`linear-gradient(135deg, rgba(107, 63, 160, 0.35), rgba(232, 162, 75, 0.18))`).
   - **Right side**: a miniature breathing orb (same component, ~110px). This is the 3D element. Not decorative fabric — Tammy herself, breathing in the corner.
   - **Left side**:
     - Title: **`Talk to me`** in `Instrument Serif` 26px ivory. Not "Premium Plan."
     - Subtitle: one line of live context in `IBM Plex Sans` 13px mauve, e.g. *"You left off on the hiring question."* or *"Eight days since we last spoke."* or *"Decision from last Sunday is still open."*
     - CTA: amber pill button `#E8A24B`, padding 12×22px, deep violet text, label: `Start`.
   - Tap anywhere on the card → voice mode fills the screen.

5. **Mode pills — horizontal scroll**
   - Outlined pills with icon + label, each tinted in a different emotional hue. Outlined, not filled. Selected state: fills with the tint at 20% opacity plus a brighter border.

   | Pill | Tint | Purpose |
   |---|---|---|
   | `Morning check-in` | Sage | 2-minute voice intention |
   | `Decision thinking` | Amber | Opens with most recent tagged decision |
   | `Just dump` | Dust | No-reply mode — she listens, doesn't challenge |
   | `Brief me on…` | Iris | Pre-meeting briefing on a person or topic |
   | `Weekly review` | Gold | Surfaces the week's patterns |

   Tapping a pill pre-loads that frame into the session context before Tammy speaks.

6. **Recent sessions — "Where you've been"**
   - Section header: **`Where you've been`** in `IBM Plex Sans` 17px ivory, with a muted `See all →` on the right.
   - 4–5 cards, each:
     - Left: emotional-state tag as a small colored dot + one-word label (`restless` · `in-flow` · `heavy` · `clear` · `overwhelmed`), pulled from that session's saved state.
     - Center: one-line session title — Tammy's phrasing, not `Chat #247`. *"The real fear under the hiring delay"* · *"Why you keep delaying Rama's call"* · *"What you decided about the pricing page"*.
     - Right: time-ago in `IBM Plex Mono` at 11px mauve (`2d` · `1w` · `3w`).
     - Left edge accent border (2px amber at 40%) if the session contains an unresolved decision or a flagged milestone.
   - Tap a card → open that session's transcript.

7. **Floating bottom nav pill — three icons only**
   - Rounded capsule, centered horizontally, ~16px above the screen bottom edge.
   - Glass surface: `rgba(31, 17, 56, 0.65)` with `backdrop-filter: blur(16px)`.
   - 1px border in amber at ~10%.
   - **Three icons**:
     - `Today` (sunrise) — left
     - **`Voice`** (sparkle glyph) — center, always filled amber with soft glow, larger (52px vs 44px)
     - `The Arc` (activity) — right
   - Center voice button is permanent across every screen. Even from inside a conversation or the timeline, one tap starts voice.
   - All other destinations live in the top-left drawer. Mobile gets less, not more.

**What this screen rejects**

- `How can I assist you today?` — Tammy is not a help desk.
- Upgrade card as the hero. Tammy doesn't beg. Subscription lives inside Settings only.
- Suggested starter prompts (`Write me a poem` / `Summarize this PDF`) — that's ChatGPT's job.
- Streaks, points, badges, notification dots. No gamification.

**What this screen keeps from the reference**

- The calm dark canvas
- The editorial greeting hierarchy
- The hero card with a breathing visual element on the right
- The horizontally scrolling mode pills
- The floating bottom nav with a highlighted center action

The reference is the skeleton. Tammy's voice is the flesh.

---

### Emotional color mapping

Colors carry signal, not just decoration. Map Tammy's PAD model (Arousal × Valence × Dominance) onto hue:

| State | Hue shift | Surfaces on |
|---|---|---|
| High arousal + positive (excitement) | Warm Gold | Milestone, breakthrough |
| High arousal + negative (stress) | Sienna / tension accent | Tension surfaced |
| Low arousal + negative (dangerous quiet) | Desaturated violet | Check-in prompted |
| Neutral baseline | Brand primary | Default |
| In-control + positive (flow) | Sage undertone | Growth delta |

The orb color, the insight card border, and the arc chart all pull from this single map. This is how the product *looks* emotionally intelligent, not just reads that way.

---

### Ambient atmosphere

Background gradients feel like weather, not decoration. Soft radial gradients of the accent color at ~8% opacity, drifting slowly over 60-second cycles. Noise grain at ~2% opacity over everything — kills the "AI plastic" feeling.

---

## MOTION

- **Breathing orb**: 4–6 second cycle, never stops.
- **Page transitions**: slow crossfade, 400ms. No slides, no zooms.
- **Text streaming**: when Tammy streams a response, fade each word in at 30ms stagger. Elegant, not typewriter.
- **Interaction**: buttons glow outward in accent at ~20% opacity on hover. Never scale, never jiggle.
- **Emotional shift**: 800ms color transition. Always slow. Tammy is patient.

---

## THE DO / DON'T LIST

**Do**
- Dark-first. Light mode is a secondary courtesy, not the primary surface.
- Warm neutrals (ivory, dust) — never cool grays.
- One accent per screen. Accent is scarce.
- Let Tammy's words breathe. Typography is the UI.
- Arabic and English set at identical visual weight.

**Don't**
- Chat bubbles with tails. This is not iMessage.
- Gamification — no badges, streaks, points, levels.
- Emoji reactions or quick replies.
- Generic AI assistant iconography (robot heads, sparkles-everywhere).
- Pure white backgrounds.
- Translating Tammy's sharp lines into soft UI friendliness.

---

## RECOMMENDATION — COMBO A, THE OUD

I'd ship The Oud. Honest reasoning:

1. **Differentiation.** Every AI product on the market is blue or cyan. Tammy in violet + amber puts her in a category of one.

2. **Cultural fit.** Amber is the color of Arabic manuscript illumination, dates, desert light, traditional gold calligraphy borders. Deep violet echoes the Phoenician purple tradition of the Levant. Both have historical weight in this region.

3. **Emotional range.** Violet is already loaded with introspection; amber is loaded with warmth and breakthrough. The palette is pre-semantic — the colors already mean what the product needs them to mean.

4. **Voice-product fit.** The voice-first experience — orb-centric, dark screen, ethereal — lives its best life on a deep violet base. The amber accent is what tells the user *Tammy's about to say something that matters.*

5. **Founder audience.** Entrepreneurs drown in blue productivity tools. A violet + amber product on their phone looks different enough that it earns its own mental slot — not "another AI tool."

**If Oud feels too bold for your gut test**, Lilac Dawn is the safe alternative. Softer, more approachable, still purple-distinct. **If you want maximum MENA identity** and you're confident about a masculine-leaning aesthetic, Petra is the most unmistakably Jordanian of the three.

My pick stays Oud.

---

## NEXT STEPS

1. Decide A, B, or C.
2. Build the orb component once, reuse everywhere.
3. Load the fonts via Google Fonts CDN.
4. Lock the color system into a design tokens file (JSON) that Next.js and React Native both consume.
5. Design three hero screens first: **voice mode**, **mobile home (Today)**, **growth timeline**.

---

*The brand should feel like Tammy does in conversation: warm enough to trust, sharp enough to believe.*
