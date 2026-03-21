# Traversable

Browser tool to paste JSON, pick a path (wizard, tree, or key search), choose a language, and copy traversal syntax — plus safe-access and runtime parse examples.

**Run locally:** open [`json-traversal-wizard/index.html`](json-traversal-wizard/index.html) in a browser (double-click or “Open with Live Server”).

**Author / links**

- Site: [squaregoddess.uk](https://squaregoddess.uk)
- GitHub: [@NejLee](https://github.com/NejLee)

---

## Publish as a public GitHub repository

Your workspace is ready to version with Git. Follow these steps once (from this folder: `traversable`).

### 1. Create the repo on GitHub (public)

1. Sign in at [github.com](https://github.com) as **NejLee**.
2. Click **+** → **New repository**.
3. **Repository name:** e.g. `traversable` (or `json-traversable` — any public name you like).
4. **Description:** e.g. *Generate language-specific JSON traversal syntax from pasted JSON.*
5. Set visibility to **Public**.
6. **Do not** add a README, `.gitignore`, or license on GitHub if you already have files locally (avoids merge hassle). You can add a license later.
7. Click **Create repository**.

GitHub will show you commands; you can use the ones below instead.

### 2. Initialise Git and push (Windows / PowerShell)

In PowerShell, from the `traversable` project root:

```powershell
cd "c:\Users\admin\Squaregoddess\__sQg_Projects\traversable"

git init
git add .
git commit -m "Initial commit: Traversable web tool"

# Use YOUR new repo name if different from traversable:
git branch -M main
git remote add origin https://github.com/NejLee/traversable.git
git push -u origin main
```

If GitHub created the repo with `master` as default, either rename the default branch to `main` in the repo **Settings → General**, or use `git push -u origin master` instead.

**Authentication:** GitHub no longer accepts account passwords for `git push`. Use one of:

- **GitHub Desktop** (easiest): [desktop.github.com](https://desktop.github.com) — add the folder, publish to GitHub.
- **HTTPS + Personal Access Token** when prompted for password: [Creating a fine-grained or classic PAT](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).
- **SSH:** set up keys and use `git@github.com:NejLee/traversable.git` as `origin`.

### 3. Optional: point the site footer at the repo

After the repo exists, you can change the footer link in `json-traversal-wizard/index.html` from your **profile** to the **repository** URL, e.g. `https://github.com/NejLee/traversable`, with link text like “Traversable source”.

### 4. Versioning (tags)

When you want a “release”:

```powershell
git tag -a v1.0.0 -m "First public release"
git push origin v1.0.0
```

On GitHub: **Releases → Create a new release** from that tag and paste notes (what changed).

Optional: add a `CHANGELOG.md` and update it each release.

---

## Project layout

| Path | Purpose |
|------|--------|
| `json-traversal-wizard/` | Static app (`index.html`, `styles.css`, `script.js`) |
| `branding/trvlogo.png` | Logo (referenced from the app) |
| `brief/` | Project notes |

No build step required for the static tool.
