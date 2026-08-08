# DEV.to submission draft

Copy the body below into the DEV editor. Tags: `devchallenge`, `frontendchallenge`,
`webdev`, `javascript`. The Pen is already published and linked below — nothing
left to fill in.

---

_This is a submission for [Frontend Challenge - Comfort Food Edition, Perfect Landing](https://dev.to/challenges/frontend-2026-07-29)_

## What I Built

**Iya Bashirat Restaurant** — a landing page for a fictional Nigerian restaurant
at 56 Ajayi Crowther Street, Victoria Island, Lagos.

Iya Bashirat has been cooking on the same street since 1998. Victoria Island grew
up around her — glass towers, banks, traffic that does not move — and she is still
pounding yam by hand at 6am because a machine makes it gummy. That is the comfort
food I wanted: not a trend, just a woman who never changed the recipe.

The menu is seventeen real Nigerian dishes — party jollof, abula, ofada and
ayamase, egusi with pounded yam, suya, asun, catfish pepper soup, moi moi, puff
puff, chapman, zobo, kunu aya — each with its Yoruba name, a heat rating,
allergens and dietary tags.

**Built with vanilla HTML, CSS and ES modules. No framework, no build step, and
not a single network request** — no CDN, no web font, no analytics, no map embed,
no images. Every dish, the portrait of Iya Bashirat at the fire, and the
neighbourhood map are hand-drawn inline SVG.

What it does:

- **A menu that actually works as a tool.** Filter by course, filter by dietary
  need, search across names/descriptions/allergens, sort by price or by heat.
  Every dish opens a detail dialog with serving size, allergens and heat level.
- **An order tray that hands off to WhatsApp** — because that is how a Lagos
  restaurant genuinely takes orders. Quantities, pickup or delivery, a note for
  the kitchen, and it survives a page reload. No payment, no backend, no
  pretending.
- **Opening hours computed in `Africa/Lagos`**, not in your timezone. The badge
  says "Open now", "Closing soon" or "Closed", the hours table marks today, and
  the reservation form generates its time slots from that same data — so you
  physically cannot request a table for a night the kitchen is shut.
- Reservation form with progressive validation, a review carousel, scroll-spy
  navigation, light/dark theming, and toasts.

## Demo

{% codepen https://codepen.io/Benjamin-Fadina/pen/gbgEGyy %}

**Source:** <https://github.com/benjaminsqlserver/food-front-end> (MIT licensed)

> The **Order on WhatsApp** buttons open a new tab, which CodePen's sandboxed
> preview sometimes blocks. Open the Pen in its own tab to try the full
> hand-off — the order message is composed either way.

The Pen is not a flattened copy. CodePen gives you one JS pane, and this is 17
modules wired by 40 relative imports — so instead of stripping every
`import`/`export` and hand-ordering the dependency graph, the Pen loads the real
files from the repository over jsDelivr, pinned to a git tag. `main.js` resolves
its own relative imports against the CDN exactly as it does when served locally.
Nothing is bundled, minified or rewritten.

## Journey

I went in treating **accessibility as a build constraint rather than an audit at
the end**, and it changed most of my architecture decisions.

**Native `<dialog>` instead of a hand-rolled modal.** All three modals use
`showModal()`, which gives focus trapping, Escape-to-close, background inertness
and the top layer for free — every one of which I would have got subtly wrong by
hand. The only thing it does not give you is an exit animation, since `close()`
pulls the element out of the top layer instantly. So I drive an `.is-open` class
and defer the real `close()` until the transition ends.

**The filter chips are real radios and checkboxes.** I nearly built them as
`aria-pressed` buttons. Using real form controls meant grouping, arrow-key
navigation and state announcement all came from the platform. But it exposed a
trap I had not thought about: the common `.visually-hidden` utility has a
`:not(:focus)` guard so skip links can reveal themselves — which means a hidden
radio *pops back into the layout* the moment someone tabs to it. Hidden form
controls need unconditional clipping, with the focus ring drawn on the label.

**Contrast checking caught the thing I was proudest of.** I wrote a script to
check every foreground/background pair in both themes. Everything passed except
my WhatsApp buttons: white on WhatsApp's own `#25D366` is **2.2:1**, nowhere near
AA. Their brand colour is inaccessible as a button fill. I darkened it to
`#12803f` — still obviously WhatsApp, 5.0:1 with white, and still clears 3:1 as a
shape against both page backgrounds.

**Autoplay you can actually defend.** The review carousel never starts under
`prefers-reduced-motion`, pauses on hover *and* on focus, stops in a background
tab, and always shows a visible pause control. The scrolling ribbon under the
hero stops dead and reflows to a static wrapped list when reduced motion is on.

**Anchor links move focus, not just the viewport.** Clicking "Menu" scrolls you
there and hands focus to the section, so the next Tab continues from where your
eye already is. It is three lines of code and almost nobody does it.

Since I had no browser automation available, I verified by writing tests: a
selector audit that proves every `#id`, `data-*` hook, `aria-describedby` target
and `<use href>` resolves; a **62-assertion jsdom suite** that boots the real
modules and drives filtering, sorting, the tray totals, reservation validation and
the carousel; **19 assertions pinning the Lagos timezone logic** to fixed UTC
instants; a structural accessibility audit; and the contrast check. All green.

The part I am happiest with is the artwork. Drawing seventeen dishes as SVG by
hand took longer than anything else, but it means zero image requests, zero layout
shift, perfect sharpness at any size — and the whole page still weighs less than
one photograph of a plate of jollof.

Iya Bashirat is fictional. The address, phone number, handles and reviews are
invented for this challenge, and nothing on the page contacts a real business.

Code is MIT licensed.
