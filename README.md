# Tessellate Duel

A Litema pattern battle card game for 2–4 players: call Complexity, Rarity, Symmetry or Structure and take the table.

```bash
npm install
npm run dev      # play locally
npm test         # engine + reducer tests (vitest)
npm run build    # production build in dist/ (relative paths, runs from any sub-path)
```

## Holo plate finish

Each plate's finish follows its rarity grade:

| Rarity | Finish | What it does |
| --- | --- | --- |
| Common (1) | Matte print | Soft specular glare that follows the pointer |
| Rare (3) | Gold foil | Gold leaf on the plate's ink lines, moving with the light |
| Limited (5) | Prismatic foil | Spectrum foil + sparkle on the ink, light sweep and chime on reveal |

The foil is masked to each plate's own linework, so it reads like a foil-stamped print rather than a sheen over paper. Cards tilt on a spring under the pointer (and with device orientation in the inspect view on phones); the loop sleeps when nothing moves. Winning a round knocks ochre pigment dust off the plate. All motion respects `prefers-reduced-motion`.

### Card assets

The master PNG plates in `public/cards/*.png` stay the source of truth. Web copies and foil masks are generated from them:

```bash
python3 scripts/build_card_assets.py   # writes public/cards/web/*.webp and public/cards/foil/*.webp
```

Re-run it whenever a master plate changes. The web set is about 5.6 MB versus 12.8 MB of PNGs, and all of it is preloaded behind the "Pressing the plates" screen so no flip reveals a blank face.

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
