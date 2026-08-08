# Publishing this to CodePen

**Published:** <https://codepen.io/Benjamin-Fadina/pen/gbgEGyy>


CodePen gives you one HTML pane, one CSS pane and one JS pane. This project is
17 JavaScript modules wired by 40 relative imports plus three cascade-layered
stylesheets, so pasting it in would normally mean flattening everything into a
single script — stripping every `import`/`export` and hand-ordering the
dependency graph.

That is not necessary. The repository is public, so **jsDelivr serves it as a
CDN with the right MIME types and `Access-Control-Allow-Origin: *`**. The Pen
loads the real files, and `main.js` resolves its own relative imports
(`./lib/dom.js`, `./modules/menu.js`, …) against the CDN exactly as it does when
served locally. Nothing is bundled, minified or rewritten.

---

## Steps

1. Go to <https://codepen.io/pen/> to start a new Pen.
2. Open **`html-pane.html`** from this folder, copy all of it, paste it into the
   **HTML** pane.
3. Leave the **CSS** and **JS** panes empty. (`css-pane.css` and `js-pane.js`
   hold explanatory comments you can paste in if you would rather they were not
   blank — they change nothing.)
4. Click **Settings → Behavior** and turn **Auto-Save** on, or just save.
5. Name the Pen *Iya Bashirat Restaurant*.
6. Save, then copy the Pen URL into your DEV post:

   ```
   {% codepen https://codepen.io/your-username/pen/xxxxxxx %}
   ```

Check that the menu shows **17 dishes** and the guest book shows **10 reviews**.
If either is empty, the modules did not load — see Troubleshooting below.

---

## Pinning

The URLs are pinned to the **`v1.0`** git tag, not to `main`. jsDelivr treats a
tag as immutable and caches it permanently, so the Pen can never break because
of a later commit, and it never serves a stale half-updated mix.

If you change the site and want the Pen to follow, cut a new tag and regenerate:

```bash
git tag v1.1 && git push origin v1.1
node codepen/make-panes.mjs . v1.1
```

Then re-paste `html-pane.html`. Regenerating from source is the point — it means
the Pen and the repository cannot quietly disagree.

---

## What was removed

Only the `file://` diagnostic banner and the small classic script that triggers
it. Those exist so that opening `index.html` from a file manager explains itself
instead of showing blank sections; inside a Pen the modules always arrive over
https, so they have nothing to do.

Everything else is the page as shipped, including the inline SVG dish sprite,
the skip link and the JSON-LD.

---

## Troubleshooting

**The menu and guest book are empty.** The modules did not load. Open the
browser console. A CORS or 404 error means the `v1.0` tag is missing from
GitHub — check with:

```bash
git ls-remote --tags origin
```

**Styling is missing but content is there.** The three `<link>` tags at the top
of the HTML pane did not resolve. Same cause, same check.

**A brand-new tag 404s for a minute.** jsDelivr fetches a tag the first time it
is asked for. Load the raw URL once in a browser tab, then retry the Pen.
