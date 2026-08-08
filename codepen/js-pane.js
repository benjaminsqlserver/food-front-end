/* ---------------------------------------------------------------------------
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
