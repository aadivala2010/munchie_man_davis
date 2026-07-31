# Munchie Man — munchiemandavis.com

Static site. No build step, no dependencies, no framework. Open the `.html`
files in any text editor, save, re-upload. That's the whole workflow.

```
index.html                  Join Our Team (the only live page in August)
styles.css                  all styling
gallery.js                  CircularGallery (React Bits), running without React
vendor/ogl.js               the WebGL library it needs — vendored, don't edit
assets/logo.png             header mark, cropped to the ink
assets/coming-soon.png      hero artwork
assets/poster-*.webp        the four pop-up posters in the gallery
assets/paths.svg            animated hero background. Self-animating via CSS
                            inside the file — edit `stroke` there to recolour.
```

The originals the client supplied (`Munchie Man Logo.png`, `coming soon.png`,
`img1-3.png`, `Screenshot ....png`) are left untouched alongside them. Keep
those — they're the full-resolution masters for print. The site only loads the
optimised copies above: 4.7 MB of raw images became 608 KB.

## The gallery

`gallery.js` is the CircularGallery component from React Bits, with its React
wrapper removed — the drawing code underneath was already plain JavaScript, so
the site needs no framework and no build step. It renders a curved, draggable,
infinitely-looping carousel on a WebGL canvas.

It reads the posters out of the plain `<ul class="gallery__track">` in
`index.html`, then hides that list. **The list is still the thing you edit** —
it's also what visitors see if JavaScript is off, WebGL is unavailable, or the
visitor has asked their system to reduce motion.

### Adding a poster

Optimise first — a 1.4 MB phone photo will make the page crawl on mobile.
Resize to about 1100px wide and save as `.webp`, then copy one `<li>` block
inside the list and change:

- `src` — the new file
- `width`/`height` — must match the real pixel size, or the page jumps as it loads
- `alt` — describe the poster for screen readers and search engines
- `data-label` — the **short** caption drawn under the card in the carousel;
  keep it to a word or two, long text renders as a very wide strip
- the `<p>` — the longer caption used in the fallback list

Order in the file is the order on screen.

### Rebuilding vendor/ogl.js

You shouldn't need to. If you ever do:

```
npm pack ogl && tar xzf ogl-*.tgz
echo "export { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from './package/src/index.js';" > entry.js
npx esbuild --bundle --format=esm --minify --outfile=vendor/ogl.js entry.js
```

ogl is Unlicense (public domain).

## Editing content

Everything is in `index.html`. Places to change are marked `EDIT ME`:

- **Open roles** — the `<ol class="roles">` list. Delete an `<li>` to pull a role, copy one to add a role.
- **Hiring email** — appears twice: the `mailto:` link and the visible text next to it. Change both.
- **Instagram** — search for `MunchieManDavis` (appears in several places: nav, hero, footer, metadata).

## Before you deploy

```
python check.py
```

Confirms every image, stylesheet and in-page link still resolves. Takes a
second and catches the one mistake that would actually embarrass us — a dead
link on the hiring page.

To preview locally: `python -m http.server 8777`, then open
<http://localhost:8777>.

## Deploying

Any static host works. Recommended, in order of least effort:

**Netlify (drag and drop)**
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag this whole folder onto the page. It's live in ~10 seconds.
3. Site settings → Domain management → Add `munchiemandavis.com`, then follow Netlify's DNS instructions at the domain registrar.

**Cloudflare Pages / Vercel** — same idea, connect a Git repo or upload the folder.

**Traditional host (cPanel, FTP)** — upload the contents of this folder to `public_html`.

## DNS

Point the domain at the host and let it issue the HTTPS certificate — do not
skip HTTPS, browsers flag plain HTTP as insecure.

## September (phase 2)

The site becomes multi-page: `index.html` (home), `about.html`, `menu.html`,
`contact.html`, `join.html`. The header nav in each file gets those links plus
a mobile hamburger. Shared styles already live in `styles.css`.

Still needed from the client before that work starts:

- Final menu (categories, dishes, descriptions, prices)
- Food and restaurant photography
- Street address, phone, opening hours
- Christopher's About copy
- Any additional hand-drawn illustrations / past pop-up posters
