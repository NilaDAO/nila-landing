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

# Home "How it works" cards → the three /how tabs, topic not process (Carst, 10 Nov).
PEOPLE = '<circle cx="9" cy="8" r="3"></circle><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"></path><circle cx="17" cy="9" r="2.5"></circle><path d="M16 14.2c2.9.4 5 2.8 5 5.8"></path>'
CARDS = [
    ('The AI-guided crop plan', 'What goes in, what comes out, and one member’s year.', 'Impact', 'Members, repayments, and what we can’t measure yet.'),
    ('Satellite on every field', 'Land titles, food tokens and soils, seen every five days.', 'Technical', 'Chains, signatures, AI and satellite.'),
    ('Why yields turn around', 'Predictable, regenerative, done together in the SHG.', 'Climate', 'Soil, seasons and land that recovers.'),
]
for f in ('desktop/DHow.jsx', 'mobile/MHow.jsx'):
    s = open(f'{W}/{f}').read()
    for t0, b0, t1, b1 in CARDS:
        if f'label="{t0} {b0}"' in s:
            s = s.replace(f'label="{t0} {b0}"', f'label="{t1} {b1}"').replace(f'>{t0}</span>', f'>{t1}</span>').replace(f'>{b0}</span>', f'>{b1}</span>')
    crosshair = '<path d="M12 3v3M12 18v3M3 12h3M18 12h3"></path><rect x="7" y="7" width="10" height="10" rx="2"></rect><path d="M10 10h4v4h-4z"></path>'
    if crosshair in s and 'label="Impact ' in s:
        assert s.count(crosshair) == 1, f
        s = s.replace(crosshair, PEOPLE)
    open(f'{W}/{f}', 'w').write(s)

# Footer tagline (Carst, 10 Nov): "credit unions", not "women-led unions".
for f in ['src/w1/desktop/DFooter.jsx', 'src/w1/mobile/MFooter.jsx']:
    s = open(f).read()
    n = s.replace('harvests for women-led unions in Tamil Nadu', 'harvests for credit unions in Tamil Nadu')
    if n != s: open(f, 'w').write(n)

# nUSD stack (Carst, 11 Nov): name the layers around nUSD, so it reads as one layer in an investor's yield stack.
PLAB = "nl-plab\" style={{fontSize: '12px', fontWeight: '400', letterSpacing: '0.04em', color: '#1F2733'}}>Layer"
PLAB_NEW = ["nl-plab\" style={{fontSize: '13px', fontWeight: '700', letterSpacing: '0.04em', color: '#94A3B8'}}>Crypto yield",
            "nl-plab\" style={{fontSize: '13px', fontWeight: '700', letterSpacing: '0.04em', color: '#94A3B8'}}>Treasury yield"]
for f in ['src/w1/desktop/DOffers.jsx', 'src/w1/mobile/MOffers.jsx']:
    s = open(f).read()
    if s.count(PLAB) == 2:
        s = s.replace(PLAB, PLAB_NEW[0], 1).replace(PLAB, PLAB_NEW[1], 1)
        s = s.replace('aria-label="nUSD, target yield 3 to 5 percent a year; one layer in a yield stack"',
                      'aria-label="nUSD, target yield 3 to 5 percent a year: the farm layer between crypto yield and treasury yield in an investor\'s stack"')
        open(f, 'w').write(s)

# Backed-by marquee (Carst, 11 Nov): "innovation grant", without "MIT".
for f in ['src/w1/desktop/DBacked.jsx', 'src/w1/mobile/MBacked.jsx']:
    s = open(f).read(); n = s.replace('Dutch government · MIT innovation grant', 'Dutch government · innovation grant')
    if n != s: open(f, 'w').write(n)

# Footer (Carst, 11 Nov): no CSV link (the season ledger / loan tape is dropped from the site).
CSV = "<A k='#' label=\"Season ledger (CSV)\" style={{fontSize: '14px', lineHeight: '1.5'}}>Season ledger (CSV)</A>"
for f in ['src/w1/desktop/DFooter.jsx', 'src/w1/mobile/MFooter.jsx']:
    s = open(f).read(); n = s.replace(CSV, '')
    if n != s: open(f, 'w').write(n)

# FAQ answers (Carst, 11 Nov): the board's question links become the FaqList accordion (src/w1/FaqList.jsx, text in faq.js).
for f in ['src/w1/desktop/DFaq.jsx', 'src/w1/mobile/MFaq.jsx']:
    s = open(f).read()
    if 'FaqList' not in s:
        i = s.index('<A k='); j = s.rindex('</A>') + 4
        s = s[:i] + '<FaqList />' + s[j:]
        s = s.replace('import { A } from "../links.jsx";', 'import FaqList from "../FaqList.jsx";')
        open(f, 'w').write(s)
