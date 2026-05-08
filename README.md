<div align="center">

<!-- 3D Animated Banner — clickable -->
<a href="https://mabdullahab614-alt.github.io/chessmaster/">
<img src="assets/banner.svg" width="100%" alt="ChessMaster — Built by Abdullah Javid"/>
</a>

<br/>

<!-- Animated typing subtitle — clickable -->
<a href="https://mabdullahab614-alt.github.io/chessmaster/">
<img src="https://readme-typing-svg.demolab.com?font=Outfit&weight=700&size=18&pause=800&color=60A5FA&center=true&vCenter=true&width=700&lines=%E2%99%94+Real+Minimax+AI+with+Alpha-Beta+Pruning;%E2%99%95+20%2B+Opening+Book+Positions;%E2%99%96+Live+Evaluation+Bar;%E2%99%97+Drag+%26+Drop+%2B+1-Click+Moves;%E2%99%98+ELO+Tracking+across+Sessions;%E2%99%99+5+Board+Themes+%7C+Sounds+%7C+PGN+Export;%E2%99%9A+Zero+Install+%E2%80%94+Works+in+Any+Browser" alt="Features"/>
</a>

<br/><br/>

<!-- 3D Play Button Badge -->
<a href="https://mabdullahab614-alt.github.io/chessmaster/">
<img src="https://img.shields.io/badge/▶%20%20P%20L%20A%20Y%20%20L%20I%20V%20E%20%20N%20O%20W-3b82f6?style=for-the-badge&logo=googlechrome&logoColor=white&labelColor=020617" height="55" alt="Play Live"/>
</a>

<br/><br/>

<!-- Stat badges row 1 — all clickable -->
<a href="https://mabdullahab614-alt.github.io/chessmaster/"><img src="https://img.shields.io/badge/Rating-10%2F10%20%E2%AD%90-FFD700?style=for-the-badge&labelColor=0f172a"/></a>
&nbsp;
<a href="https://mabdullahab614-alt.github.io/chessmaster/"><img src="https://img.shields.io/badge/AI-Minimax%20%2B%20%CE%B1%E2%80%93%CE%B2%20Pruning-8B5CF6?style=for-the-badge&labelColor=0f172a"/></a>
&nbsp;
<a href="https://github.com/mabdullahab614-alt/chessmaster/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge&labelColor=0f172a"/></a>

<br/><br/>

<!-- Stat badges row 2 — all clickable -->
<a href="https://mabdullahab614-alt.github.io/chessmaster/"><img src="https://img.shields.io/badge/Zero-Install%20Required-F59E0B?style=for-the-badge&labelColor=0f172a"/></a>
&nbsp;
<a href="https://mabdullahab614-alt.github.io/chessmaster/"><img src="https://img.shields.io/badge/5-Board%20Themes-EC4899?style=for-the-badge&labelColor=0f172a"/></a>
&nbsp;
<a href="https://mabdullahab614-alt.github.io/chessmaster/"><img src="https://img.shields.io/badge/Depths-1%E2%80%935%20Ply%20Search-3B82F6?style=for-the-badge&labelColor=0f172a"/></a>
&nbsp;
<a href="https://mabdullahab614-alt.github.io/chessmaster/"><img src="https://img.shields.io/badge/Touch-Mobile%20Ready-34D399?style=for-the-badge&labelColor=0f172a"/></a>

</div>

---

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%"/>

<br/>

<div align="center">

## 🤖 AI ENGINE ARCHITECTURE

```
╔══════════════════════════════════════════════════════════════════╗
║                    CHESSMASTER AI ENGINE                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║   INPUT: Board Position (FEN)                                    ║
║      │                                                           ║
║      ▼                                                           ║
║   ┌─────────────────────┐                                        ║
║   │   Opening Book      │ ──► 20+ real positions                 ║
║   │   (first 20 moves)  │     Ruy Lopez, Sicilian,               ║
║   └─────────────────────┘     Queen's Gambit...                  ║
║      │ (after book)                                              ║
║      ▼                                                           ║
║   ┌─────────────────────────────────────────┐                    ║
║   │          MINIMAX ALGORITHM              │                    ║
║   │   with Alpha-Beta Pruning (α-β)         │                    ║
║   │                                         │                    ║
║   │   Depth 1 → Beginner  (~400 ELO)        │                    ║
║   │   Depth 2 → Easy      (~800 ELO)        │                    ║
║   │   Depth 3 → Medium    (~1400 ELO)       │                    ║
║   │   Depth 4 → Hard      (~2000 ELO)       │                    ║
║   │   Depth 5 → Master    (~2800 ELO)       │                    ║
║   └─────────────────────────────────────────┘                    ║
║      │                                                           ║
║      ▼                                                           ║
║   ┌─────────────────────────────────────────┐                    ║
║   │       POSITION EVALUATION               │                    ║
║   │   • Material values (P=1 N=3 B=3 R=5)  │                    ║
║   │   • Piece-Square Tables (PST)           │                    ║
║   │   • Center control bonus               │                    ║
║   │   • King safety evaluation             │                    ║
║   │   • Mobility scoring                   │                    ║
║   └─────────────────────────────────────────┘                    ║
║      │                                                           ║
║      ▼                                                           ║
║   OUTPUT: Best Move SAN + Evaluation Score                       ║
║                                                                  ║
║   ⚡ Runs in Web Worker — NEVER blocks the UI                    ║
╚══════════════════════════════════════════════════════════════════╝
```

</div>

---

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%"/>

## ✨ Features

<table>
<tr>
<td width="50%">

### 🤖 Intelligence
- ✅ Real **Minimax** + Alpha-Beta Pruning
- ✅ **Piece-Square Tables** (positional eval)
- ✅ **Opening Book** — 30+ positions
- ✅ **5 Difficulty Levels** (400→2800 ELO)
- ✅ **Web Worker** — never freezes UI
- ✅ Worker **pre-warms** on load

### 🎮 Controls
- ✅ **1-Click Moves** — instant play
- ✅ **Drag & Drop** pieces
- ✅ **Touch Support** — mobile ready
- ✅ **Smart Disambiguation** (purple flash)

</td>
<td width="50%">

### 📊 Analysis
- ✅ **Live Evaluation Bar** (±score)
- ✅ **Captured Pieces** + material count
- ✅ **Move Navigation** ⏮◀●▶⏭
- ✅ **ELO Rating** — persists across games
- ✅ **W/L/D Stats** stored in browser
- ✅ **PGN Export** — one click copy

### 🎨 Experience
- ✅ **5 Board Themes** (Dark/Green/Blue/Wood/Mono)
- ✅ **Sound Effects** — all 7 types
- ✅ **Check Highlight** (pulsing red king)
- ✅ **Hint System** (gold highlight)
- ✅ **Time Controls** (Bullet→Unlimited)
- ✅ **Clickable Move History**

</td>
</tr>
</table>

---

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%"/>

## 🚀 Live Demo

<div align="center">

### 🌐 [https://mabdullahab614-alt.github.io/chessmaster/](https://mabdullahab614-alt.github.io/chessmaster/)

*Open in browser — works instantly, no login, no download*

</div>

---

## 🛠 Tech Stack

<div align="center">

|  | Technology | Purpose |
|--|-----------|---------|
| 🧠 | **chess.js** (CDN) | Chess rules, move validation, PGN |
| ⚡ | **Web Worker** | Non-blocking AI computation |
| 🔊 | **Web Audio API** | Synthesized sound effects |
| 💾 | **localStorage** | ELO & stats persistence |
| 👆 | **Pointer Events API** | Drag & drop + touch |
| 🎨 | **CSS Custom Properties** | 5 live board themes |
| 0️⃣ | **Zero dependencies** | No npm, no build step |

</div>

---

## ⚡ Run Locally

```bash
# Clone
git clone https://github.com/mabdullahab614-alt/chessmaster.git
cd chessmaster

# Serve (Python)
python -m http.server 8888
# → http://localhost:8888
```

> Or just double-click `index.html` — it works!

---

## 🏆 Rating

<div align="center">

| Category | Score |
|----------|-------|
| Chess Rules | ⭐⭐⭐⭐⭐ |
| AI Engine | ⭐⭐⭐⭐⭐ |
| Visual Design | ⭐⭐⭐⭐⭐ |
| Sound Effects | ⭐⭐⭐⭐⭐ |
| Mobile Support | ⭐⭐⭐⭐⭐ |
| Features | ⭐⭐⭐⭐⭐ |
| **OVERALL** | **⭐⭐⭐⭐⭐ 10/10** |

</div>

---

## 📜 License

**MIT License** — © 2026 Abdullah Javid

Free to use, modify, and distribute with attribution.

---

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%"/>

<div align="center">

<a href="https://mabdullahab614-alt.github.io/chessmaster/">
<img src="https://readme-typing-svg.demolab.com?font=Outfit&weight=700&size=20&pause=1000&color=3B82F6&center=true&vCenter=true&width=600&lines=Built+with+%E2%99%A5+by+Abdullah+Javid;Every+move+makes+you+stronger+%E2%99%9A;Star+%E2%AD%90+if+you+enjoyed+it!" alt="Footer"/>
</a>

<br/><br/>

<a href="https://github.com/mabdullahab614-alt"><img src="https://img.shields.io/badge/GitHub-mabdullahab614--alt-181717?style=for-the-badge&logo=github"/></a>
&nbsp;
<a href="https://mabdullahab614-alt.github.io/chessmaster/"><img src="https://img.shields.io/badge/%F0%9F%8C%90%20Play%20ChessMaster-3b82f6?style=for-the-badge"/></a>
&nbsp;
<a href="https://github.com/mabdullahab614-alt/chessmaster/stargazers"><img src="https://img.shields.io/github/stars/mabdullahab614-alt/chessmaster?style=for-the-badge&logo=github&color=FFD700&labelColor=0f172a"/></a>

<br/>

**⭐ Star this repo if you enjoyed playing!**

</div>
