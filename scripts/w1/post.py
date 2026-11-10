"""After board2jsx: scoped CSS with tokens, drop the board's globe placeholder, live land-title metric."""
import json, os, re, sys
W = sys.argv[1]; DS = sys.argv[2]
h = [l for l in open(f'{W}/desktop/D.helmet.css').read().split('\n') if l.strip()]
assert h[0] == 'html,body{overflow:hidden}', h[0]
h[1] = h[1].replace('body{margin:0;', '.w1{')
h[2] = h[2].replace('a{color', '.w1 a{color').replace('a:hover{', '.w1 a:not([data-pending]):hover{')
tk = json.load(open(f'{DS}/tokens.json'))
vs = [f"  --nl-{t['name']}: {t['value'] if not t['value'].startswith('{') else 'var(--nl-' + t['value'][1:-1] + ')'};"
      for g in ('color', 'spacing', 'radius', 'shadow', 'size') for t in tk[g]['tokens']]
open(f'{W}/w1.css', 'w').write('\n'.join([
    "/* W1 (nila.land home). Tokens from dev/nila-design/tokens.json; the rest is the board's own CSS",
    "   (nila-design/boards/LandHome.dc.html <helmet>), scoped to .w1. Regenerate, do not restyle by hand. */",
    ".w1 {", *vs, "}", *h[1:]]) + '\n')
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
