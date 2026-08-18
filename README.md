# Munchie Man — munchiemandavis.com

> Handing the site over to the client? See **[HANDOFF.md](HANDOFF.md)** —
> a step-by-step, non-technical procedure for transferring the GitHub
> repository, the Vercel hosting and the domain into their own accounts.

Static site. No build step, no dependencies, no framework. Open the `.html`
files in any text editor, save, re-upload. That's the whole workflow.

```
index.html                  Home
about/index.html            Our Story
menu/index.html             Menu — "coming soon" until the real menu lands
visit/index.html            Visit Us — address, hours, map
contact/index.html          Contact — email, Instagram, mailto form
hiring/index.html           Join Our Team
styles.css                  all styling
assets/logo.png             header mark, cropped to the ink
assets/coming-soon.png      hero artwork
assets/poster-*.webp        the four pop-up posters in the gallery
assets/paths.svg            animated hero background. Self-animating via CSS
                            inside the file — edit `stroke` there to recolour.
```

Each page is its own folder with an `index.html`, so URLs stay clean
(`/about/`, `/visit/`, etc.) and every one of them is permanent — link to any
of them and it keeps working as the site grows. There's no shared template:
the header/nav/footer are copy-pasted at the top and bottom of every page, so
adding a new page means copying an existing one and editing the middle.

The header nav is the same six links on every page, with the current page
marked via `aria-current="page"` (styled underlined). Below ~64rem wide it
collapses behind the hamburger button in the corner — that only happens once
JS has added `has-js` to `<html>`, so a page with JS disabled just wraps the
full nav onto multiple lines instead of hiding it.

The originals the client supplied (`Munchie Man Logo.png`, `coming soon.png`,
`img1-3.png`, `Screenshot ....png`) are left untouched alongside them. Keep
those — they're the full-resolution masters for print. The site only loads the
optimised copies above: 4.7 MB of raw images became 608 KB.

## The gallery

`index.html` and `about/index.html` both end in a static collage — four
`<li>` posters, hand-rotated with fixed `transform`s in `.collage li:nth-child()`
in `styles.css`. No script, no scroll, no WebGL; it's just an `<ul>`.

### Adding a poster

Optimise first — a 1.4 MB phone photo will make the page crawl on mobile.
Resize to about 1100px wide and save as `.webp`, then copy one `<li>` block
and change:

- `src` — the new file
- `width`/`height` — must match the real pixel size, or the page jumps as it loads
- `alt` — describe the poster for screen readers and search engines

A 5th poster needs a `.collage li:nth-child(5)` rule in `styles.css` (rotation
+ vertical offset) or it'll sit flat and unstaggered. Order in the file is the
order on screen. Change the list in both `index.html` and `about/index.html`
to keep them in sync.

## Editing content

There's no CMS — open the page's `.html` file and edit the text directly.

- **Open roles** — `hiring/index.html`, the `<ol class="roles">` list. Delete an `<li>` to pull a role, copy one to add a role.
- **Menu** — `menu/index.html`. Currently just a "coming soon" note; once there's a real menu, replace the `.spread__body` content with it.
- **Hours / address / phone** — appear on `index.html`, `visit/index.html`, and in both pages' JSON-LD `<script type="application/ld+json">` blocks. Update all of them together, plus the footer `.foot__where` on every page.
- **Contact email** — `MunchieManDavis@gmail.com` appears as a `mailto:` link on several pages and as the hardcoded recipient in the contact form's submit script in `contact/index.html`. Change all of them.
- **Instagram / Yelp** — search for `MunchieManDavis` / `yelp.to` (nav, hero, footer, metadata, across every page).
- **Christopher's story** — lives verbatim in both `hiring/index.html` (under `#about`) and `about/index.html`. It's meant to match exactly in both places — if you edit one, edit the other the same way.

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

## Still needed from the client

- Final menu (categories, dishes, descriptions, prices) — `menu/index.html` is a "coming soon" placeholder until then
- Food and restaurant photography
- Press articles, once they run, for the "As seen in" line on `visit/index.html`
- Any additional hand-drawn illustrations / past pop-up posters
