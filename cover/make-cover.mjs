/**
 * Builds the 1000x420 DEV cover image page.
 *
 * The dish artwork is lifted straight out of index.html's SVG sprite rather
 * than redrawn, so the cover cannot drift away from the plates on the site.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2] ?? '.';
const OUT = path.join(ROOT, 'cover');
fs.mkdirSync(OUT, { recursive: true });

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// The sprite is the last <svg> in the body.
const sprite = html.match(
  /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" style="display:none"[\s\S]*<\/svg>/,
)?.[0];

if (!sprite) {
  console.error('Could not find the dish sprite in index.html.');
  process.exit(1);
}

const page = `<!doctype html>
<html lang="en-NG">
<head>
<meta charset="utf-8">
<title>Iya Bashirat Restaurant — cover</title>
<style>
  /* The page IS the image: exactly 1000x420, no margin, no scrollbars. */
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1000px; height: 420px; overflow: hidden; }

  :root {
    --clay-700: #7a2e18;
    --clay-600: #a8391f;
    --ember: #e4572e;
    --gold: #d8912b;
    --gold-300: #f2c46b;
    --leaf: #2f7a4f;
    --cream: #fff9f1;
    --sand: #f2e2cd;
    --ink: #241a13;
    --ink-soft: #6a5341;
    --font-display: "Iowan Old Style", "Palatino Linotype", Palatino,
      "Book Antiqua", Georgia, ui-serif, serif;
    --font-body: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }

  body {
    position: relative;
    display: grid;
    grid-template-columns: 545px 455px;
    align-items: center;
    background:
      radial-gradient(circle at 12% 18%, rgba(216,145,43,.16) 0, transparent 42%),
      radial-gradient(circle at 92% 8%,  rgba(168,57,31,.14) 0, transparent 38%),
      var(--cream);
    font-family: var(--font-body);
    color: var(--ink);
  }

  /* Aso-oke stripe, the same motif that tops the hero. */
  body::before {
    content: "";
    position: absolute;
    inset: 0 0 auto 0;
    height: 9px;
    background: repeating-linear-gradient(
      90deg,
      var(--clay-600) 0 34px,
      var(--gold) 34px 56px,
      var(--leaf) 56px 68px,
      transparent 68px 100px
    );
  }

  .copy { padding: 0 0 0 56px; }

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: var(--clay-600);
    margin-bottom: 18px;
  }
  .eyebrow::before {
    content: "";
    width: 30px; height: 2px;
    background: currentColor;
  }

  h1 {
    font-family: var(--font-display);
    font-size: 62px;
    line-height: 1.02;
    letter-spacing: -.02em;
    font-weight: 700;
  }
  h1 .sub {
    display: block;
    font-size: 27px;
    letter-spacing: .30em;
    text-transform: uppercase;
    font-family: var(--font-body);
    font-weight: 700;
    color: var(--clay-600);
    margin-top: 12px;
  }

  .tagline {
    margin-top: 20px;
    font-family: var(--font-display);
    font-size: 22px;
    font-style: italic;
    line-height: 1.35;
    color: var(--ink-soft);
    max-width: 26ch;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 26px;
    font-size: 14.5px;
    font-weight: 600;
    color: var(--ink-soft);
  }
  .pin { width: 17px; height: 17px; fill: none; stroke: var(--clay-600); stroke-width: 2; }

  /* --- the plate cluster --- */
  .plate {
    position: relative;
    width: 455px;
    height: 420px;
  }
  /* A soft warm pool of light rather than a hard donut — a conic ring with a
     cream centre reads as two unrelated circles at thumbnail size. */
  .glow {
    position: absolute;
    top: 50%; left: 50%;
    width: 410px; height: 410px;
    margin: -205px 0 0 -205px;
    border-radius: 50%;
    background: radial-gradient(circle,
      rgba(216,145,43,.30) 0%,
      rgba(216,145,43,.12) 46%,
      rgba(168,57,31,.05) 66%,
      transparent 72%);
  }
  .ring {
    position: absolute;
    top: 50%; left: 50%;
    width: 312px; height: 312px;
    margin: -156px 0 0 -156px;
    border-radius: 50%;
    border: 1.5px dashed rgba(168,57,31,.30);
  }

  .dish { position: absolute; filter: drop-shadow(0 14px 22px rgba(59,31,20,.24)); }
  /* Kept clear of all four edges and above the ribbon at y=384. */
  .d-main { width: 236px; height: 236px; top: 88px;  left: 110px; }
  .d-a    { width: 122px; height: 122px; top: 22px;  left: 290px; }
  .d-b    { width: 112px; height: 112px; top: 248px; left: 24px;  }
  .d-c    { width: 98px;  height: 98px;  top: 262px; left: 322px; }

  /* Small ribbon, bottom-left, echoing the site's marquee. */
  /* Full bleed, or it looks like a truncated block rather than a ribbon. */
  .ribbon {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 36px;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 56px;
    background: var(--clay-700);
    color: var(--cream);
    font-family: var(--font-display);
    font-size: 16px;
    letter-spacing: .04em;
  }
  .ribbon b { color: var(--gold-300); font-weight: 400; }
  .ribbon .right { margin-left: auto; font-family: var(--font-body); font-size: 13px;
                   font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
                   color: var(--gold-300); }
</style>
</head>
<body>

  <div class="copy">
    <p class="eyebrow" lang="yo">Ẹ káàbọ̀</p>
    <h1>Iya Bashirat<span class="sub">Restaurant</span></h1>
    <p class="tagline">Nigerian home cooking from a Lagos kitchen that never closed.</p>
    <p class="meta">
      <svg class="pin" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21s-7.5-5.2-7.5-10.5a7.5 7.5 0 0 1 15 0C19.5 15.8 12 21 12 21z"/>
        <circle cx="12" cy="10.5" r="2.6"/>
      </svg>
      56 Ajayi Crowther Street · Victoria Island, Lagos
    </p>
  </div>

  <div class="plate">
    <div class="glow"></div>
    <div class="ring"></div>
    <svg class="dish d-main" viewBox="0 0 120 120"><use href="#dish-jollof"></use></svg>
    <svg class="dish d-a"    viewBox="0 0 120 120"><use href="#dish-suya"></use></svg>
    <svg class="dish d-b"    viewBox="0 0 120 120"><use href="#dish-chapman"></use></svg>
    <svg class="dish d-c"    viewBox="0 0 120 120"><use href="#dish-puffpuff"></use></svg>
  </div>

  <p class="ribbon">
    <span>Firewood jollof <b>◆</b> Abula <b>◆</b> Suya off the coals <b>◆</b> Cold Chapman</span>
    <span class="right">Victoria Island · Lagos</span>
  </p>

${sprite}
</body>
</html>
`;

fs.writeFileSync(path.join(OUT, 'cover.html'), page, 'utf8');
console.log(`cover/cover.html written — ${(Buffer.byteLength(page) / 1024).toFixed(1)} KB`);
console.log(`sprite symbols embedded: ${(sprite.match(/<symbol id=/g) || []).length}`);
