/**
 * Generates the three CodePen panes from the real source, so the Pen cannot
 * drift away from the repo. Run it again after any change and re-paste.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
const TAG = process.argv[3] || 'v1.0';
const CDN = `https://cdn.jsdelivr.net/gh/benjaminsqlserver/food-front-end@${TAG}`;
const OUT = path.join(ROOT, 'codepen');

fs.mkdirSync(OUT, { recursive: true });

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

/* ---------------------------------------------------------------- HTML pane */

let body = html.match(/<body>([\s\S]*)<\/body>/)[1];

// The file:// diagnostic banner and its classic loader script are meaningless
// inside a Pen, where the modules always arrive over https.
body = body.replace(
  /\n  <!-- Shown only when[\s\S]*?<div class="boot-warning"[\s\S]*?\n  <\/div>\n/,
  '\n',
);

const htmlPane = `<!--
  Iya Bashirat Restaurant
  Source: https://github.com/benjaminsqlserver/food-front-end  (MIT)

  Stylesheets and ES modules are loaded straight from the repository via
  jsDelivr, pinned to the ${TAG} tag. Nothing is bundled, minified or flattened:
  these are the same files the repo serves, and main.js still resolves its own
  relative imports (./lib/dom.js and friends) against the CDN.
-->
<link rel="stylesheet" href="${CDN}/assets/css/base.css">
<link rel="stylesheet" href="${CDN}/assets/css/components.css">
<link rel="stylesheet" href="${CDN}/assets/css/sections.css">
<script type="module" src="${CDN}/assets/js/main.js"></script>
${body.trimEnd()}
`;

fs.writeFileSync(path.join(OUT, 'html-pane.html'), htmlPane);

/* ----------------------------------------------------------------- CSS pane */

const cssPane = `/* ---------------------------------------------------------------------------
   Leave this pane EMPTY in CodePen.

   The three stylesheets are linked from the HTML pane so that CodePen renders
   exactly what the repository serves, cascade layers and all:

       @layer reset, tokens, base, utilities, components, sections;

   Concatenating them here would work too, but the linked version cannot drift
   out of sync with the source. To read them:

   ${CDN}/assets/css/base.css
   ${CDN}/assets/css/components.css
   ${CDN}/assets/css/sections.css
   --------------------------------------------------------------------------- */
`;

fs.writeFileSync(path.join(OUT, 'css-pane.css'), cssPane);

/* ------------------------------------------------------------------ JS pane */

const jsPane = `/* ---------------------------------------------------------------------------
   Leave this pane EMPTY in CodePen.

   The entry point is loaded as a real ES module from the HTML pane:

       <script type="module" src=".../assets/js/main.js"></script>

   It is deliberately not pasted here. This project is 17 modules wired by 40
   relative imports, and CodePen gives you one JS pane — flattening them into it
   would mean stripping every import/export and hand-ordering the dependency
   graph, which is precisely the structure worth showing.

   Read the source instead:
   https://github.com/benjaminsqlserver/food-front-end/tree/main/assets/js

       main.js                 boots each feature
       lib/dom.js              qs/qsa, HTML escaping, delegation, motion query
       lib/format.js           Naira, pluralisation, 12-hour clock
       lib/storage.js          localStorage that degrades instead of throwing
       lib/modal.js            animated wrapper around native <dialog>
       data/                   menu, restaurant details, testimonials
       modules/menu.js         filtering, search, sort, detail dialog
       modules/tray.js         order tray and its WhatsApp hand-off
       modules/hours.js        "open now", computed in Africa/Lagos
       modules/reservation.js  progressive form validation
       modules/nav.js          drawer, scroll-spy, back-to-top
       modules/testimonials.js accessible carousel
       modules/theme.js        light/dark
       modules/reveal.js       scroll reveals and counters
       modules/toast.js        live-region status messages
   --------------------------------------------------------------------------- */
`;

fs.writeFileSync(path.join(OUT, 'js-pane.js'), jsPane);

/* ------------------------------------------------------------------ report */

const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(1)} KB`;
console.log(`tag pinned:      ${TAG}`);
console.log(`html-pane.html   ${kb(htmlPane)}`);
console.log(`css-pane.css     ${kb(cssPane)}`);
console.log(`js-pane.js       ${kb(jsPane)}`);
console.log(`boot banner removed: ${!/boot-warning/.test(htmlPane)}`);
console.log(`sprite retained:     ${/<symbol id="dish-jollof"/.test(htmlPane)}`);
console.log(`cdn refs:            ${(htmlPane.match(/cdn\.jsdelivr\.net/g) || []).length}`);
