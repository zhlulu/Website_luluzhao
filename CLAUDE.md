# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Lulu Zhao's personal academic site (luluzhao.com): Astro 5, static output,
deployed to GitHub Pages by `.github/workflows/deploy.yml` on push to `main`.
Pages are hand-written `.astro` files in `src/pages/`; layout `Base.astro`,
components `Nav.astro`/`Footer.astro`, styles in `src/styles/global.css`
(Newsreader display font, Inter text).

## Build and preview

```
npm run dev        # localhost:4321
npm run build      # static build into dist/ (verify before pushing)
```

Pushing to `main` deploys automatically.

## The notes section ("Random Walks", /notes)

- `src/pages/notes/index.astro` is a self-building index: it globs
  `./*.md`, so adding a note = dropping one Markdown file in
  `src/pages/notes/` with this frontmatter (nothing else to edit):

  ```yaml
  ---
  layout: ../../layouts/NoteLayout.astro
  title: "..."
  description: "one-liner for the index"
  date: "2026-08-04"     # ISO; sorting + display
  topic: "optional tag"
  ---
  ```

- `NoteLayout.astro` provides typography, the KaTeX stylesheet, and a
  CC BY 4.0 license footer (year taken from the note's date).
- Math renders server-side: `remark-math` + `rehype-katex` configured in
  `astro.config.mjs`. Standard $ / $$ TeX in the Markdown.
- Figures live in `public/notes/<note-slug>/figures/` and MUST be
  referenced by root-absolute URL (`/notes/<slug>/figures/x.png`) —
  relative paths make Astro try to resolve them as build imports and the
  build fails.

## IMPORTANT: note masters live in another repo

The physics notes are authored in the MITTENS repository:
`/Volumes/SSD_data1/SWMF_clean/PT/MITTENS/Doc/*.md` (relative figure paths
there). The website copies are GENERATED from those masters. To update a
note: edit the master, then regenerate the page by concatenating the
existing frontmatter with the master, rewriting figure paths:

```
{ head -7 src/pages/notes/<slug>.md ;                # frontmatter is EXACTLY 7 lines
  sed 's|](figures/|](/notes/<slug>/figures/|g' <master.md> ; } > src/pages/notes/<slug>.md
```

(`head -8` once duplicated the H1 title — the frontmatter block is 7 lines.)
Copy any new/updated figures into `public/notes/<slug>/figures/` as well.

Current note pairs (master -> page), a three-part series:
- `Doc/parker_to_sde_notes.md` -> `notes/parker-to-sde.md`
- `Doc/shock_grid_resolution_notes.md` -> `notes/shock-grid-resolution.md`
- `Doc/timestep_notes.md` -> `notes/sde-timestep.md`
