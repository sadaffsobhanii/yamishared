# Ready to copy into garard-cpu/yami-website

These files are the Nov 12 update, already merged with Liz's sign-in setup.
Copy them into the yami-website repo at the same paths and push to main:

| From this folder | To yami-website |
|---|---|
| `index.html` | `index.html` (new homepage) |
| `scan.mp4`, `groc.mp4`, `os.mp4`, `dash.mp4` | repo root, next to `index.html` |
| `app/index.html` | `app/index.html` (latest app, with logins) |

Nothing else in yami-website changes. `app/account.js`, `app/firebase-config.js`,
`app/meals/`, `netlify/` and `netlify.toml` stay as they are.

The homepage sign-up form is the Netlify form named `waitlist`
(fields: `email`, `source`). Sign-ups show up in Netlify under Forms.
