# design/ — nila.land spec (page 6 of the Nila PWA redesign)

Snapshot of page **6 Landing (nila.land)** from the Nila PWA redesign artifact
(https://claude.ai/artifact/EGPqzjmb9aJ4jAJP1S6scL), version `1794297821-1085`, taken 2026-11-10.
`dev/nila-design` (export v1580, 16–22 Oct) does not contain page 6 yet; when it is re-exported
(`nila-design/scripts/README.md`), that export becomes the source and this folder is deleted.

Do not edit by hand: a design change is made in the artifact and pulled again.

| Board file | Id | What |
|---|---|---|
| `boards/LandHome.dc.html` / `LandHomeMobile` | W1 | Home: hero, metrics bar (4 + audit), what Nila offers (nUSD coin, sourcing lot + trace), yield story, trust, FAQ |
| `boards/LandHow.dc.html` / `LandHowMobile` | W4 | How it works: AI-guided crop plan, one member's year, satellite, yield story |
| `boards/LandUnions.dc.html` / `LandUnionsMobile` | W3 | nUSD card, meet the unions, invest gate (wallet allowlist) `#denied` `#open` |
| `boards/LandHarvests.dc.html` | W2 | Harvests board, desktop: `#wallet #connected #bid #placing #placed #mine #lot #locked` |
| `boards/LandHarvestsMobile.dc.html` | W2m | Mobile: desktop-only notice |

- `notes-page6.md` — every canvas note on page 6 (open list, v9 spec, W2 spec). Read before building a section.
- `tokens.json` — the design-system tokens (same as the PWA).
- View: `cd boards && python3 -m http.server 8090`, open a board, add `#state`.
- Two images are `/_blob/…` references that the artifact file API does not serve: `4b8278e2…` is the nila logo
  (use `public/` copy), `a78055d8…` is a raster used on W2 / W4 — pull it from the artifact if needed.
