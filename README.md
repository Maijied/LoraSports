# ⚽ Lorapok WorldCup 26

> **The Tactician's Logbook** — FIFA World Cup 2026 in your Firefox toolbar.

![Version](https://img.shields.io/badge/version-1.0.0-00ff88?style=flat-square&labelColor=030711&color=00ff88)
![Firefox](https://img.shields.io/badge/Firefox-Manifest%20V2-ff6611?style=flat-square&labelColor=030711&logo=firefox-browser)
![License](https://img.shields.io/badge/license-MIT-00d4ff?style=flat-square&labelColor=030711)
![Lorapok Labs](https://img.shields.io/badge/by-Lorapok%20Labs-c44dff?style=flat-square&labelColor=030711)

A polished Firefox browser extension that puts the entire 2026 FIFA World Cup at your fingertips — live scores, schedules, squads, standings, and ELO-powered predictions — all wrapped in a dark logbook aesthetic with Lorapok neon accents.

---

## 🖥️ Preview

| Today's Matches | Schedule | Predictions |
|:-:|:-:|:-:|
| Live scores auto-refresh every 60s | Filter by group A–L | ELO win bars + predicted score |

**→ [Live Site](https://lorapok.github.io/worldcup26)**

---

## ✨ Features

| Panel | What it does |
|---|---|
| ⚽ **Today** | Live scores via ESPN API, auto-refreshes every 60 s with pulsing live badge |
| 📅 **Schedule** | All upcoming fixtures filterable by group |
| 🏴 **Squads** | All 48 national squads — search, browse 23-man rosters with positions & clubs |
| 📊 **Results** | Group standings for all 12 groups + recent match results |
| 🎯 **Predict** | ELO-based win probability, predicted scoreline, 16-team tournament odds |

---

## 🏗️ Project Structure

```
.
├── manifest.json          # Firefox Manifest V2
├── popup.html             # Main popup shell
├── css/
│   └── popup.css          # Logbook × neon design system
├── js/
│   ├── api.js             # ESPN API + hardcoded 2026 fallback data
│   ├── predictions.js     # ELO prediction engine
│   ├── popup.js           # Main controller (tabs, rendering, live refresh)
│   └── background.js      # 5-min background cache refresh
├── icons/
│   ├── icon-48.png
│   └── icon-96.png
├── .github/
│   └── workflows/
│       ├── build.yml          # Build + package on push, release on tag
│       ├── publish-amo.yml    # Sign & submit to Firefox Add-ons on tag
│       └── deploy-pages.yml   # Deploy docs/ to GitHub Pages
└── docs/
    └── index.html             # GitHub Pages landing site
```

---

## 🚀 Install

### From GitHub Releases (Developer Mode)
1. Download `lorapok-worldcup26-vX.X.X.zip` from [Releases](../../releases/latest)
2. Extract the zip
3. Open Firefox → `about:debugging` → **This Firefox** → **Load Temporary Add-on**
4. Select `manifest.json` from the extracted folder

### From Firefox Add-ons (AMO)
> Pending AMO review — link will be added here once approved.

---

## 🔁 CI/CD

| Workflow | Trigger | What it does |
|---|---|---|
| `build.yml` | Every push to `main` or PR | Lints, zips extension, uploads artifact |
| `build.yml` (release job) | `git tag v*` push | Creates GitHub Release with zip attached |
| `publish-amo.yml` | `git tag v*` push | Runs `web-ext sign`, submits to AMO |
| `deploy-pages.yml` | Every push to `main` | Deploys `docs/` to GitHub Pages |

### 🔑 Required Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Where to get it |
|---|---|
| `AMO_API_KEY` | [addons.mozilla.org/developers](https://addons.mozilla.org/developers/) → API Keys |
| `AMO_API_SECRET` | Same page as above |

### 🏷️ Releasing a New Version

```bash
# 1. Bump version in manifest.json
# 2. Commit, tag, and push

git add manifest.json
git commit -m "chore: bump version to 1.1.0"
git tag v1.1.0
git push origin main --tags
```

This automatically:
- Creates a GitHub Release with the `.zip` attached
- Signs and submits to Firefox AMO
- Redeploys the GitHub Pages site

---

## 🧠 ELO Prediction Engine

The Predict panel uses the classic ELO formula:

```
E(A) = 1 / (1 + 10^((rB - rA) / 400))
```

With a draw probability factor that scales with rating proximity:

```
drawFactor = 0.22 + 0.06 × (1 − |rA − rB| / 600)
```

Ratings are sourced from FIFA World Rankings (~2025) and stored in `js/api.js`.

---

## 🎨 Design System

The extension uses a **"Tactician's Logbook"** aesthetic:

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#030711` | Page background |
| `--green` | `#00ff88` | Lorapok primary, live elements |
| `--cyan` | `#00d4ff` | Lorapok secondary, links |
| `--gold` | `#d4a843` | Scores, headings, year callout |
| `--live-red` | `#ff3d5a` | Live match indicators |
| `--font-serif` | Playfair Display SC | Headings, section titles |
| `--font-mono` | Space Mono | Labels, stats, badges |
| `--font-body` | Lora | Match names, descriptions |

---

## 📡 Data Sources

- **Live scores**: ESPN Public API (`site.api.espn.com/apis/site/v2/sports/soccer/fifa.world`)
- **Fallback**: Hardcoded 2026 group-stage data in `js/api.js`
- **Squads**: Curated data for major nations, placeholder for remaining teams
- **ELO Ratings**: Based on FIFA World Rankings ~2025

---

## 🛠️ Development

```bash
# Clone the repo
git clone https://github.com/lorapok/worldcup26.git
cd worldcup26

# Load in Firefox
# about:debugging → This Firefox → Load Temporary Add-on → manifest.json

# Lint with web-ext
npm install -g web-ext
web-ext lint --source-dir=.

# Build zip locally
zip -r worldcup26.zip . --exclude "*.DS_Store"
```

---

## 🌐 Links

- **Landing page**: [lorapok.github.io/worldcup26](https://lorapok.github.io/worldcup26)
- **Lorapok Labs**: [lorapok.github.io](https://lorapok.github.io)
- **@Maijied**: [github.com/Maijied](https://github.com/Maijied)
- **@lorapok**: [github.com/lorapok](https://github.com/lorapok)

---

## 📄 License

MIT © 2026 [Lorapok Labs](https://lorapok.github.io)

---

<div align="center">
  <strong>◈ LORAPOK LABS</strong><br/>
  <em>Building the Future. One Line at a Time.</em>
</div>
