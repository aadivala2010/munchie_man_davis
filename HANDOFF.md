# Taking ownership of munchiemandavis.com

This document hands the website over to Munchie Man. It is written for a
non-technical reader — no coding knowledge is needed for any step. Follow the
parts in order and set aside about an hour, plus up to two days of waiting at
the end while the internet catches up with the domain change.

---

## 1. What the website is made of

Four separate things have to work together. Right now the first two are in the
outgoing developer's name; the last two are already yours.

| Piece | What it does | Who holds it today |
| --- | --- | --- |
| **The code** (GitHub) | The actual files of the website, and their full edit history | Outgoing developer |
| **The hosting** (Vercel) | Puts those files on the internet and keeps them there | Outgoing developer |
| **The domain** (`munchiemandavis.com`) | The address people type in | **You** |
| **Email / Instagram / Yelp** | `MunchieManDavis@gmail.com`, `@MunchieManDavis`, Yelp listing | **You** |

The website is a *static* site: plain files, no database, no logins, no server
code, no monthly software to keep patched. That is deliberate — it means very
little can break on its own, and any web developer can pick it up. The contact
form does not store anything; it opens the visitor's own email app with the
message pre-filled and sends it to `MunchieManDavis@gmail.com`.

**How updates work today:** the developer edits a file, saves it to GitHub, and
Vercel notices within seconds and republishes the site automatically. Nobody
"uploads" anything by hand. Your next developer will work the same way.

---

## 2. Before you start: create two free accounts

Do these first. Use a **business email address you will keep for years** —
`MunchieManDavis@gmail.com` is the right choice. Do **not** use a personal
address belonging to an employee.

- [ ] **GitHub account** — go to [github.com/signup](https://github.com/signup).
      Free. This will hold the website's files. Write down the username you
      choose; you will need to give it to the outgoing developer.
- [ ] **Vercel account** — go to [vercel.com/signup](https://vercel.com/signup)
      and choose **"Continue with GitHub"** so the two accounts are linked from
      the start. This is the hosting.
- [ ] **Turn on two-factor authentication** on both accounts, and on the Gmail
      account. This is the single most important security step — these accounts
      control what appears on your website.
- [ ] **Confirm you can log in to your domain registrar** — the company you
      bought `munchiemandavis.com` from (GoDaddy, Namecheap, Squarespace
      Domains, Google Domains/Squarespace, etc.). You will need this login in
      Part 5. If nobody remembers the password, recover it *now*, not on the
      day you go live.

> **Store all of this in one place** — a password manager, or at minimum a
> sealed document the owner keeps. Losing the registrar login is the one
> mistake that is genuinely painful to undo.

---

## 3. Take ownership of the code (GitHub)

The outgoing developer does this part; you just click Accept.

**Outgoing developer:**
- [ ] Open the repository at `github.com/aadivala2010/munchie_man_davis`
- [ ] Go to **Settings → General → Danger Zone → Transfer ownership**
- [ ] Enter the client's new GitHub username and confirm

**Client:**
- [ ] Check `MunchieManDavis@gmail.com` for an email from GitHub titled
      something like *"…invited you to accept the transfer of…"* and click the
      link to **accept**. (The invitation expires after a few days — accept it
      promptly.)
- [ ] Once accepted, confirm the address bar reads
      `github.com/<your-username>/munchie_man_davis`

✅ **You now own every file and every revision of the site.** Even if everything
else went away, the website could be rebuilt from this in minutes.

---

## 4. Take ownership of the hosting (Vercel)

The cleanest approach is that **you create your own copy of the hosting from the
code you now own**, rather than the developer handing over an existing one. It
takes about three minutes and leaves nothing tangled between the two accounts.

- [ ] Log in to [vercel.com](https://vercel.com) with the account from Part 2
- [ ] Click **Add New… → Project**
- [ ] Vercel asks for permission to see your GitHub repositories — click
      **Install** / **Configure GitHub App** and grant it access to the
      `munchie_man_davis` repository
- [ ] Find `munchie_man_davis` in the list and click **Import**
- [ ] Leave every setting on its default. There is no build step and no
      "environment variables" to enter — if Vercel asks about a framework,
      **Other** / **No framework** is correct
- [ ] Click **Deploy** and wait for the confetti
- [ ] Click the preview thumbnail. You should see the real website at a
      temporary address ending in `.vercel.app`

**Check the temporary site before going any further.** Click through every page
— Home, Our Story, Menu, Visit Us, Contact, Join Our Team — on a computer *and*
on a phone. Nothing is pointed at your real domain yet, so this is the safe
moment to find problems.

- [ ] All six pages load, images appear, the menu button works on mobile
- [ ] The Contact form opens your email app addressed to
      `MunchieManDavis@gmail.com`

> *Alternative:* Vercel can also transfer the developer's existing project to
> you directly (Project Settings → Transfer). It preserves the deployment
> history, which you don't need. Importing fresh is simpler and less likely to
> stall — use it unless your next developer asks otherwise.

---

## 5. Point your domain at the new hosting

Only do this once Part 4 is verified. This is the step that changes what the
public sees.

**In Vercel:**
- [ ] Open your project → **Settings → Domains**
- [ ] Type `munchiemandavis.com` and click **Add**
- [ ] When asked, choose the option that also adds `www.munchiemandavis.com`
      and redirects it to the main address, so both spellings work
- [ ] Vercel now shows you a short list of **DNS records** — usually one "A"
      record for the bare domain and one "CNAME" record for `www`. **Leave this
      screen open.** Those exact values are the ones to use; do not copy values
      from a blog post or from this document, because they change over time.

**At your domain registrar:**
- [ ] Log in and find **DNS**, **DNS Management**, **Manage DNS**, or
      **Advanced DNS** for `munchiemandavis.com`
- [ ] Enter the records exactly as Vercel displays them — the record type, the
      name/host, and the value. Where Vercel shows the name as `@`, some
      registrars want it left blank or written as the domain itself; both mean
      "the domain on its own"
- [ ] **Delete or replace any existing A or CNAME record for `@` and `www`**
      that points somewhere else — usually a parking page from the registrar.
      Two conflicting records are the most common reason a handover appears to
      "not work"
- [ ] **Do not touch MX records.** Those route email. Your email is on Gmail,
      so leaving them alone keeps mail flowing
- [ ] Save

**Then wait.** DNS changes usually take 10–60 minutes and occasionally up to 48
hours to reach everyone.

- [ ] Back in Vercel's **Domains** screen, refresh until both
      `munchiemandavis.com` and `www.munchiemandavis.com` show a green
      **Valid Configuration**
- [ ] Vercel issues the HTTPS security certificate automatically, at no cost —
      no action needed

---

## 6. Final checks before you call it done

Open a **private/incognito window**, or check on a phone using mobile data
rather than office Wi-Fi, so you are not seeing a cached copy.

- [ ] `https://munchiemandavis.com` loads the site
- [ ] `https://www.munchiemandavis.com` also loads it
- [ ] `http://munchiemandavis.com` (no "s") redirects to the secure version
- [ ] A **padlock icon** appears in the address bar with no warning
- [ ] Every page in the top navigation opens: Home, Our Story, Menu, Visit Us,
      Contact, Join Our Team
- [ ] The address and hours on **Visit Us** are current
- [ ] **Get Directions** opens the correct location in Maps
- [ ] The Instagram and Yelp links go to the right accounts
- [ ] The Contact form opens an email addressed to `MunchieManDavis@gmail.com`
- [ ] Search Google for `munchiemandavis.com` in a week and confirm the correct
      site is listed

---

## 7. Close out the outgoing developer's access

Do this once Part 6 passes, and not before — keeping the old setup alive until
the new one is proven is your safety net.

**Client:**
- [ ] GitHub → repository → **Settings → Collaborators** — remove anyone who is
      no longer working on the site
- [ ] Vercel → **Settings → Members** — confirm you are the only member
- [ ] Change the Gmail password if the developer ever had it, and re-check
      two-factor authentication on all accounts

**Outgoing developer:**
- [ ] Delete the old Vercel project so it can never serve a stale copy
- [ ] Confirm in writing that no other copies of the site are being hosted
      anywhere

**Both:**
- [ ] Fill in and keep the ownership record in Part 10 below

---

## 8. What this will cost you to run

| Item | Cost | Notes |
| --- | --- | --- |
| Domain `munchiemandavis.com` | ~$12–20 / year | Paid to your registrar. **Turn on auto-renew.** A lapsed domain takes the whole site down and can be bought by someone else |
| Vercel hosting | $0 on the Hobby plan | Free tier is generous for a site this size |
| Certificate (HTTPS) | $0 | Issued and renewed automatically |
| Code storage (GitHub) | $0 | Free for public and private repositories |

⚠️ **One thing to raise with your next developer:** Vercel's free Hobby plan is
intended for non-commercial use. A restaurant marketing site is a grey area and
sites like this run on it every day without issue, but Vercel can ask you to
upgrade to the Pro plan (currently about $20/month). Budget for the possibility
rather than being surprised by it. Cloudflare Pages and Netlify are equivalent
free alternatives with no such restriction, and moving this site to either is a
15-minute job for a developer.

**Total realistic annual cost: roughly $15/year, worst case ~$255/year.**

---

## 9. Handing this to your long-term developer

Give them this document plus these facts. Everything else they need is in
`README.md` inside the repository.

- Plain HTML and CSS. **No framework, no build step, no dependencies, no
  package manager, no database, no environment variables, no server code.**
- Each page is its own folder with an `index.html` (`/about/`, `/menu/`,
  `/visit/`, `/contact/`, `/hiring/`), so URLs are clean and permanent.
- The header, navigation and footer are copy-pasted into each page rather than
  shared from a template. A new page means duplicating an existing one. If they
  want a shared template or a CMS so non-developers can edit content, that is a
  reasonable first project — not a defect to fix urgently.
- `python check.py` verifies every image, stylesheet and internal link still
  resolves. Run it before each deploy.
- Preview locally with `python -m http.server 8777`.
- Images were optimised from 4.7 MB down to 608 KB. The full-resolution
  originals are kept in `assets/` for print use — do not delete them, and do
  not put unoptimised photos on the site.
- Christopher's story appears **verbatim in two places** (`about/index.html`
  and `hiring/index.html`) and must be edited in both.
- The address, hours and phone number appear in the page text, in the footer of
  every page, *and* inside the structured-data block that Google reads. All of
  them need updating together.
- The contact form is a `mailto:` link, not a real form. If you want messages to
  arrive without opening the visitor's email app, that is a small paid add-on
  (a form service such as Formspree, or a Vercel serverless function).

**Content still owed to the site, whenever you have it:**
- The real menu — categories, dishes, descriptions, prices. `/menu/` says
  "coming soon" until then
- Food and interior photography
- Press coverage for the "As seen in" line on Visit Us
- Any further hand-drawn posters for the gallery

---

## 10. Ownership record — fill this in and keep it

| Account | Login email | Who holds the password | 2FA on? |
| --- | --- | --- | --- |
| Domain registrar (____________) | | | |
| GitHub | | | |
| Vercel | | | |
| Gmail (`MunchieManDavis@gmail.com`) | | | |
| Instagram `@MunchieManDavis` | | | |
| Yelp business listing | | | |

**Signed off**

- Client: ________________________  Date: __________
- Outgoing developer: ________________________  Date: __________

Handover is complete when Parts 3 through 7 are all ticked and the site loads
over HTTPS at `munchiemandavis.com` from a device that has never visited it
before.
