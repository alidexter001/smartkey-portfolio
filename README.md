# Ali Alaoui — Portfolio

Futuristic luxury personal portfolio for **Ali Alaoui** (Smart Key) — Hybrid Software & Infrastructure Engineer, Founder & CEO of AK Streamers.

**Live:** [alidexter001.github.io/smartkey-portfolio](https://alidexter001.github.io/smartkey-portfolio/)

## Features

- Full-screen loading sequence with progress
- Ambient particles + floating orbs
- Profile card with 3D tilt interaction + PFP slot (GitHub avatar by default)
- Animated counters for key metrics
- Radar chart + skill bars (Chart.js)
- Traffic trend chart for AK Streamers
- Site logos loaded via favicon services
- Glassmorphism cards, gold/platinum accent system
- Responsive, reduced-motion friendly

## Replace profile picture

Edit `index.html` and change the `src` of `#profileImg`, or drop a local image (e.g. `avatar.jpg`) next to the HTML and set:

```html
<img id="profileImg" src="avatar.jpg" alt="Ali Alaoui profile" class="profile-img" />
```

## Stack

Static HTML / CSS / JS. Chart.js via CDN. No build step.

## Deploy

Push `index.html`, `styles.css`, `script.js` to the `main` branch of the GitHub Pages repo.
