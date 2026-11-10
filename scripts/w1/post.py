"""After board2jsx: scoped CSS with tokens, drop the board's globe placeholder, live land-title metric."""
import json, os, re, sys
W = sys.argv[1]; DS = sys.argv[2]
h = [l for l in open(f'{W}/desktop/D.helmet.css').read().split('\n') if l.strip()]
assert h[0] == 'html,body{overflow:hidden}', h[0]
h[1] = h[1].replace('body{margin:0;', '.w1{')
h[2] = h[2].replace('a{color', '.w1 a{color').replace('a:hover{', '.w1 a:not([data-pending]):hover{')
# Changes Carst asked for on top of the board (kept here so a regenerate keeps them).
OVERRIDES = [
    "/* Overrides (scripts/w1/post.py), not in the board: nUSD coin more visible (Carst, 10 Nov). */",
    ".w1 .nl-part{background:#161B23}.w1 .nl-rim{border-color:#3A4556}.w1 .nl-coin:hover .nl-part{box-shadow:inset 0 0 0 1px #3A4556}",
]
tk = json.load(open(f'{DS}/tokens.json'))
vs = [f"  --nl-{t['name']}: {t['value'] if not t['value'].startswith('{') else 'var(--nl-' + t['value'][1:-1] + ')'};"
      for g in ('color', 'spacing', 'radius', 'shadow', 'size') for t in tk[g]['tokens']]
open(f'{W}/w1.css', 'w').write('\n'.join([
    "/* W1 (nila.land home). Tokens from dev/nila-design/tokens.json; the rest is the board's own CSS",
    "   (nila-design/boards/LandHome.dc.html <helmet>), scoped to .w1. Regenerate, do not restyle by hand. */",
    ".w1 {", *vs, "}", *h[1:], *OVERRIDES]) + '\n')
for f in ('desktop/D.helmet.css', 'mobile/M.helmet.css', 'desktop/DGlobe.jsx', 'mobile/MGlobe.jsx'):
    os.remove(f'{W}/{f}')
for f in ('desktop/DMetrics.jsx', 'mobile/MMetrics.jsx'):
    s = open(f'{W}/{f}').read()
    assert s.count('>60</span>') == 1, f
    s = s.replace('>60</span>', '><LandTitles fallback="60" /></span>')
    s = s.replace('import { A } from "../links.jsx";', 'import { A } from "../links.jsx";\nimport LandTitles from "../LandTitles.jsx";')
    open(f'{W}/{f}', 'w').write(s)
print('post ok')
import glob
for f in glob.glob(f'{W}/*/*.jsx'):
    s = open(f).read(); n = s.replace('src="assets/', 'src="/w1/')
    if n != s: open(f, 'w').write(n)

# Hero "Lock in a harvest" (primary) gets the same arrow as the other buttons (Carst, 10 Nov; not on the board).
ARROW = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#121212" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>'
for f in ('desktop/DHero.jsx', 'mobile/MHero.jsx'):
    s = open(f'{W}/{f}').read()
    if ARROW not in s:
        assert s.count('>Lock in a harvest</A>') == 1, f
        s = s.replace('>Lock in a harvest</A>', '>Lock in a harvest' + ARROW + '</A>')
        open(f'{W}/{f}', 'w').write(s)

# Home "How it works" heading: "Sow in season." (Avvaiyar) replaces "The deep explanation." and its subline (Carst, 10 Nov).
HOW_OLD_H = '>The deep explanation.</h2>'
HOW_OLD_P = 'For the ones who want to see the engine: the crop plan, the AI that drafts it and the satellite that checks it.'
HOW_NEW_P = '<span lang="ta">பருவத்தே பயிர் செய்</span> · Avvaiyar'
for f in ('desktop/DHow.jsx', 'mobile/MHow.jsx'):
    s = open(f'{W}/{f}').read()
    if HOW_OLD_H in s:
        assert s.count(HOW_OLD_P) == 1, f
        s = s.replace(HOW_OLD_H, '>Sow in season.</h2>').replace(HOW_OLD_P, HOW_NEW_P)
        open(f'{W}/{f}', 'w').write(s)
