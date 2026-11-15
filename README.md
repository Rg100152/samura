# SAMURA — The Way of the Warrior

An interactive gallery celebrating the samurai code of **Bushidō** — nine portraits, seven virtues, and one unbroken code. Forged in shadow, steel, and ember.

![Status](https://img.shields.io/badge/status-live-green)
![Made with](https://img.shields.io/badge/made%20with-HTML%20%7C%20CSS%20%7C%20JS-orange)
![Theme](https://img.shields.io/badge/theme-bushid%C5%8D-red)
![Hosted on](https://img.shields.io/badge/hosted%20on-GitHub%20Pages-black)

---

## 🖼️ Preview

![SAMURA — The Way of the Warrior](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHjP0CVow-hz0etdvagBM3oV-_9Qx3n6SFH6-yFAXEldwtpnQE4GzGTrs&s=10)

> 侍 · The Way of the Warrior · 武士道

---

## 🔗 Live Demo

👉 **[https://rg100152.github.io/samura/](https://rg100152.github.io/samura/)**

---

## 📖 About

**SAMURA** is an immersive, interactive gallery built around the seven virtues of **Bushidō** (武士道), the warrior's code. Each portrait is a silent vow — a meditation on honor, courage, and stillness.

> *"The blade is not the weapon. The stillness is."* — The Unwritten Scroll

---

## ✨ Features

- **Hero section** with Japanese calligraphy and thematic intro
- **Seven Virtues** section — each with a title, kanji, and philosophical description
- **Nine-portrait interactive gallery** with click-to-view detail
- **Cinematic, atmospheric design** — shadow, steel, and ember palette
- **Smooth interactions** with vanilla JavaScript
- **Responsive layout** built with plain HTML, CSS, and JavaScript

---

## ⚔️ The Seven Virtues of Bushidō

| Virtue | Kanji | Meaning |
|--------|-------|---------|
| **Gi** — Rectitude | 義 | Decide swiftly and justly. The straight path is the only one worth walking. |
| **Yū** — Courage | 勇 | Fear is a companion, never a master. |
| **Jin** — Benevolence | 仁 | Strength without compassion is butchery. |
| **Rei** — Respect | 礼 | Courtesy is the armor of the soul. |
| **Makoto** — Sincerity | 誠 | A word once given is a blade drawn. |
| **Meiyo** — Honor | 名誉 | Reputation is a shadow that outlives the man. |
| **Chūgi** — Loyalty | 忠義 | Devotion without condition. |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Markup | HTML5 |
| Styling | CSS3 |
| Interactivity | JavaScript (vanilla) |
| Hosting | GitHub Pages |
| Utilities | Shell script (`start.sh`) |

---

## 📁 Project Structure

```
samura/
├── index.html        # Main gallery page
├── css/              # Stylesheets
├── js/               # JavaScript (gallery interactions)
├── images/           # Portrait and asset images
├── start.sh          # Local server / launch script
├── LICENSE           # License file
└── README.md         # Project documentation
```

---

## 🚀 Getting Started

### View the live site

👉 **[https://rg100152.github.io/samura/](https://rg100152.github.io/samura/)**

### Run locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rg100152/samura.git
   cd samura
   ```

2. **Launch the site**
   ```bash
   ./start.sh
   ```
   Or open `index.html` directly in your browser.

   Alternatively, serve it manually:
   ```bash
   python -m http.server 8000
   ```
   Then visit `http://localhost:8000`

---

## 🎨 Customization

- **Portraits** — replace images in the `images/` directory and update references in `index.html`
- **Virtues** — edit the seven virtue entries directly in the HTML
- **Theme** — adjust the color palette and typography in the `css/` files
- **Interactions** — extend the gallery behavior in the `js/` files

---

## 🗺️ Roadmap

- [ ] Add portrait captions and historical context
- [ ] Implement lightbox / full-screen gallery view
- [ ] Add subtle ambient audio (optional)
- [ ] Improve accessibility (alt text, keyboard navigation)
- [ ] Add Japanese/English language toggle

---

## 🤝 Contributing

Feedback and suggestions are welcome. Feel free to open an issue or submit a pull request.

---

## 📬 Contact

- 🌐 Website: [https://rg100152.github.io/samura/](https://rg100152.github.io/samura/)
- 💻 GitHub: [@Rg100152](https://github.com/Rg100152)

---

## 📄 License

This project includes a `LICENSE` file in the repository. Please refer to it for usage terms.

---

<p align="center"><em>蒐集 · Nine portraits. One spirit.</em></p>

---

### ⚠️ Note on the preview image

The image URL you provided (`encrypted-tbn0.gstatic.com/...`) could not be fetched during this check. It appears to be a **Google-hosted cached thumbnail**, which may:

- Expire or change over time
- Be blocked in some environments (hotlink protection)
- Not render reliably in GitHub READMEs

**Recommendation:** Upload the image directly to your `samura` repository (e.g., save it as `images/preview.jpg`) and reference it locally in the README:

```markdown
![SAMURA — The Way of the Warrior](images/preview.jpg)
```

This guarantees the image will always load on GitHub.
