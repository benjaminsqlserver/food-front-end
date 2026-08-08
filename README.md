# Iya Bashirat Restaurant

A landing page for a fictional Nigerian restaurant on Ajayi Crowther Street,
Victoria Island, Lagos — built for the
[DEV Frontend Challenge: Comfort Food Edition](https://dev.to/challenges/frontend-2026-07-29)
(Perfect Landing prompt).

**No framework. No build step. No network requests.** Vanilla HTML, CSS and
ES modules, served straight from disk.

---

## Running it

**Double-click `Open in browser.cmd`.**

That is the whole thing. It serves this folder and opens your browser. **Nothing
is installed** — it uses only PowerShell, which ships with Windows. Close the
console window when you are done.

> **Do not open `index.html` directly.** Browsers refuse ES modules on `file://`
> addresses, so no JavaScript runs and the menu and guest book render empty. The
> page detects this and shows a banner explaining it rather than leaving you with
> blank sections — but the fix is to serve it.

<details>
<summary>Other ways to serve it</summary>

```powershell
# PowerShell, with options
.\serve.ps1                 # http://localhost:8000, opens a browser
.\serve.ps1 -Port 3000      # a specific port
.\serve.ps1 -NoBrowser      # no browser window
```

`serve.ps1` steps up to the next free port automatically if the one it wants is
taken, refuses to serve anything outside this folder, and sends `no-store` so you
never see a stale file while editing.

If you would rather use a tool you already have, any static server works:

```bash
npx serve .                 # Node
python -m http.server 8000  # Python
php -S localhost:8000       # PHP
```

</details>

---

## What is in here

```
index.html                 markup, JSON-LD, and the inline SVG dish sprite
Open in browser.cmd        double-click to view the site
serve.ps1                  dependency-free local server (PowerShell only)
site.webmanifest
assets/
  icon.svg
  css/
    base.css               design tokens, reset, typography, utilities
    components.css         buttons, chips, cards, forms, dialogs, toasts, carousel
    sections.css           header, hero, story, menu, reviews, reserve, visit, footer
  js/
    main.js                entry point — boots each feature, wires page-level glue
    data/
      menu.js              17 dishes: prices, heat, diet tags, allergens
      restaurant.js        address, phone, opening hours, socials
      testimonials.js      guest reviews
    lib/
      dom.js               qs/qsa, HTML escaping, event delegation, motion query
      format.js            Naira, pluralisation, 12-hour clock
      storage.js           localStorage that degrades to memory instead of throwing
      modal.js             animated wrapper around native <dialog>
    modules/
      nav.js               drawer, condensed header, scroll-spy, back-to-top
      theme.js             light/dark with OS following and an explicit override
      hours.js             "open now" computed in Africa/Lagos
      menu.js              card rendering, filtering, search, sort, detail dialog
      tray.js              the order tray and its WhatsApp hand-off
      reservation.js       booking form with progressive validation
      testimonials.js      review carousel
      reveal.js            scroll reveals and counting statistics
      toast.js             transient status messages
```

---

## Features

**The menu.** Seventeen dishes rendered from a single data file. Filter by
course, filter by dietary need, search across name/description/allergens, and
sort by price or heat. Every card opens a detail dialog with serving size,
allergens and heat.

**The order tray.** Add dishes, change quantities, pick pickup or delivery, add
a note. The tray survives a page reload. Checkout composes a readable order and
opens WhatsApp with it pre-filled — which is how a Lagos restaurant actually
takes orders. No payment is taken and nothing is sent anywhere.

**Live opening hours.** "Open now", "Closing soon" or "Closed" is computed in
`Africa/Lagos` regardless of the visitor's timezone, and the hours table marks
today. Booking times are generated from the same data, so you cannot request a
table for a night the kitchen is shut.

**Reservations.** Validation runs on blur first and only goes live once a field
is known to be bad, so the form does not shout at you mid-typing. Errors are
announced via `aria-invalid` and `aria-describedby`.

**All artwork is hand-drawn SVG.** Every dish, the portrait, the map and the
icons are inline vectors. That means no image requests, no layout shift, no
third-party map embed, and perfect sharpness at any size.

---

## Accessibility

Accessibility was a build constraint, not a pass at the end.

- **Landmarks and headings.** One `<main>`, a skip link, a single `<h1>`, and no
  heading-level jumps. Every section carries an accessible name.
- **Native dialogs.** All three modals are `<dialog>` + `showModal()`, so focus
  trapping, Escape-to-close, background inertness and the top layer come from
  the platform rather than from hand-written ARIA. Focus returns to whichever
  control opened the dialog.
- **Filters are real form controls.** Radios and checkboxes styled as chips, so
  grouping, arrow-key navigation and state announcement are free. They are
  clipped rather than given the focus-revealing `.visually-hidden` treatment,
  and the focus ring is drawn on the label.
- **Live regions.** Filter results, tray changes and form errors are announced
  politely; a failed submit uses `role="alert"`.
- **Motion.** `prefers-reduced-motion` stops the marquee, the floating hero
  plates, the counters, the reveals, smooth scrolling and carousel autoplay.
- **Carousel autoplay** never starts under reduced motion, pauses on hover and
  on focus, stops in a background tab, and always has a visible pause control
  (WCAG 2.2.2).
- **Anchor links move focus,** not just the viewport, so the next Tab continues
  from where the eye is.
- **Colour.** Every foreground/background pair in both themes meets WCAG AA —
  including the WhatsApp button, which uses a darkened green because the
  official brand colour gives white text 2.2:1.
- **Themes.** Light, dark and OS-following. The OS preference is followed until
  the visitor makes an explicit choice.
- **`forced-colors`** is respected: shadows drop out and checked chips gain a
  border style that survives when the palette is replaced.
- **No-JS.** Content, address, hours and phone number are all in the static
  HTML; the reveal animations only arm themselves once JS is running, so
  nothing is ever trapped invisible. If the modules fail to boot at all, a
  `role="alert"` banner explains why instead of leaving empty sections.

---

## Design notes

The palette comes from a Lagos kitchen: palm oil, clay pot, jollof smoke, ugu
leaf, and the indigo of adire cloth. The page ground is a faint two-point
gradient wash; the hero is topped with an aso-oke stripe built from a repeating
gradient. Type is a system stack — a Palatino-ish serif for display, system-ui
for text — so there is not a single font request.

Colour is defined once as a semantic token layer (`--bg`, `--text`, `--brand`,
…) with the complete light palette on bare `:root`, and only those tokens
redefined for dark. CSS lives in `@layer reset, tokens, base, utilities,
components, sections` so specificity never needs an `!important`.

---

## Verification

Built and checked with:

- a selector audit — every `#id`, `data-*` hook, `aria-*` reference and
  `<use href>` in the JS and HTML resolves;
- a jsdom runtime suite — 62 assertions covering boot, rendering, filtering,
  sorting, the tray and its totals, reservation validation, the carousel, the
  hours table, theming and contact hydration, with zero console errors;
- 19 timezone assertions pinning the Africa/Lagos open/closed logic to fixed
  UTC instants;
- a structural accessibility audit — landmarks, heading order, control names,
  field labels, `aria-describedby` targets, dialog names, duplicate ids;
- a WCAG contrast check across every token pair in both themes.

---

## A note on the content

Iya Bashirat Restaurant is fictional. The address, phone number, social handles,
reviews and history are invented for this challenge. Nothing on the page
contacts a real business: the WhatsApp links compose a message and open the app,
and the forms confirm locally without sending anything anywhere.

## Licence

MIT — see [LICENSE](LICENSE).
