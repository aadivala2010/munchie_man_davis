# Taking ownership of your website

## 1. Get your own copy of the code

1. Create a free account at https://github.com if you don't already have one.
2. Go to github.com/aadivala2010/munchie_man_davis.
3. Click **Fork** in the top-right corner. This copies the entire project into
   your own GitHub account — you now own it.

## 2. Put it online

1. Create a free account at https://vercel.com. Choose "Continue with GitHub"
   so the two are linked.
2. Click **Add New → Project**.
3. Select the repo you just forked. Leave every setting on its default —
   there's nothing to configure.
4. Click **Deploy**. Your site will be live within a minute at a temporary
   `.vercel.app` address.

Click through all six pages there before moving on. Nothing points at your real
domain yet, so this is the safe moment to catch anything.

## 3. Connect munchiemandavis.com

1. In your Vercel project, go to **Settings → Domains**.
2. Type `munchiemandavis.com`, click **Add**, and pick the option that also adds
   the `www` version.
3. Vercel shows you two DNS records. Leave that screen open — copy the values
   from there, not from this document, since they change over time.
4. Log in to wherever you bought the domain, find **DNS Settings**, and enter
   those records exactly as shown.
5. Delete any existing record for `@` or `www` that points somewhere else —
   usually a leftover parking page. Two conflicting records is the #1 reason
   this appears not to work.
6. Don't touch anything labeled **MX**. That's your email.

Give it 10–60 minutes, then refresh Vercel's Domains screen until both show
green. The security certificate (the padlock) is issued automatically, free.

Check it in a private/incognito window: `munchiemandavis.com`,
`www.munchiemandavis.com`, and the padlock with no warning.

## 4. Updating the site

Every page is a plain HTML file in the repo — `index.html` for the home page,
`menu/index.html` for the menu, and so on. Any change saved to GitHub goes live
automatically within about 30 seconds. No uploading, no other steps.

Your developer will work in these files directly. If you want to fix a typo
yourself: open the file on GitHub, click the pencil icon, edit the text, and
click **Commit changes** at the bottom.

## 5. Worth knowing

- Turn on auto-renew for the domain (~$15/year). It's the only recurring cost,
  and a lapsed domain takes the whole site offline.
- Turn on two-factor authentication on GitHub, Vercel and Gmail. These accounts
  control what appears on your website.
- Hosting is free. Vercel's free plan is technically for non-commercial use, so
  they could ask you to upgrade (~$20/month). Cloudflare Pages and Netlify are
  free alternatives without that restriction — a 15-minute move for any
  developer.
- The contact form opens the visitor's email app addressed to
  `MunchieManDavis@gmail.com`. It doesn't store anything.
- Still needed from you whenever it's ready: the real menu (the Menu page says
  "coming soon"), and food photography.
- For your developer: it's plain HTML and CSS, no framework and no build step.
  `README.md` in the repo has the details, including running `python check.py`
  before pushing updates.
