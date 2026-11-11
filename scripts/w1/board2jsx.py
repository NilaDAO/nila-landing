"""Port a dc board (static HTML, inline styles) into React section components.

Usage: python3 board2jsx.py <board.dc.html> <out_dir> <Prefix> <section names comma-separated>
Writes <out_dir>/<Prefix><Name>.jsx per top-level child, big SVGs into <out_dir>/../art/<hash>.svg,
and prints the helmet CSS to <out_dir>/<Prefix>.helmet.css.
Anchors become <A k="key"> so links are wired in one place (links.jsx).
"""
import re, sys, os, hashlib, html as H
from html.parser import HTMLParser

SRC, OUT, PREFIX, NAMES = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4].split(',')
ART = os.path.join(OUT, '..', 'art')
os.makedirs(OUT, exist_ok=True); os.makedirs(ART, exist_ok=True)
t = open(SRC).read()
helmet = re.search(r'<helmet>([\s\S]*?)</helmet>', t).group(1)
css = re.search(r'<style>([\s\S]*?)</style>', helmet).group(1)
open(os.path.join(OUT, PREFIX + '.helmet.css'), 'w').write(css)
body = t.split('</helmet>')[1].split('</x-dc>')[0]
body = re.sub(r'<!--[\s\S]*?-->', '', body)

# big svgs -> files
arts = {}
def take_svg(m):
    s = m.group(0)
    if len(s) < 4000: return s
    h = hashlib.sha1(s.encode()).hexdigest()[:10]
    open(os.path.join(ART, h + '.svg'), 'w').write(s)
    arts[h] = 1
    return f'<art-ref h="{h}"></art-ref>'
body = re.sub(r'<svg[\s\S]*?</svg>', take_svg, body)

VOID = {'img', 'br', 'input', 'hr', 'meta', 'link', 'stop', 'path', 'rect', 'circle', 'line', 'ellipse', 'polyline', 'polygon'}
ATTR = {'class': 'className', 'for': 'htmlFor', 'viewbox': 'viewBox', 'preserveaspectratio': 'preserveAspectRatio',
        'pathlength': 'pathLength', 'xlink:href': 'xlinkHref', 'xmlns:xlink': 'xmlnsXlink', 'checked': 'defaultChecked',
        'tabindex': 'tabIndex', 'radialgradient': 'radialGradient'}

def camel(n):
    if n in ATTR: return ATTR[n]
    if n.startswith('data-') or n.startswith('aria-'): return n
    return re.sub(r'-([a-z])', lambda m: m.group(1).upper(), n)

def style_obj(s):
    parts = []
    for decl in re.split(r';(?![^(]*\))', s):
        if ':' not in decl: continue
        k, v = decl.split(':', 1); k = k.strip(); v = v.strip()
        if not k: continue
        key = k if k.startswith('--') else re.sub(r'-([a-z])', lambda m: m.group(1).upper(), k)
        parts.append((key, f'{repr(key) if key.startswith("--") else key}: {repr(H.unescape(v))}'))
    last = {k: s for k, s in parts}  # a repeated property: the last one wins, as in CSS
    seen, out = set(), []
    for k, _ in reversed(parts):
        if k not in seen: seen.add(k); out.append(last[k])
    return '{{' + ', '.join(reversed(out)) + '}}'

def text_jsx(d):
    d = H.unescape(d)
    if not d.strip(' \t\n\r'): return d if '\n' not in d else ' ' if d.startswith(' ') or d.endswith(' ') else ''
    out = d.replace('{', "{'{'}").replace('}', "{'}'}").replace('<', '{"<"}').replace('>', '{">"}')
    out = re.sub('[\u00a0\u2000-\u200b\u202f\u205f\u3000]', lambda m: "{'\\u%04x'}" % ord(m.group(0)), out)
    # keep leading / trailing spaces explicit
    if out[:1] == ' ': out = "{' '}" + out.lstrip(' ')
    if out[-1:] == ' ': out = out.rstrip(' ') + "{' '}"
    return out

class P(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=False); s.d = 0; s.secs = []; s.buf = None; s.svg = 0; s.raw = ''
    def emit(s, x):
        if s.buf is not None: s.buf.append(x)
    def handle_starttag(s, tag, attrs):
        tag_l = tag
        if tag == 'svg': s.svg += 1
        if s.d == 1 and tag != 'art-ref': s.buf = []
        a = dict(attrs)
        if tag == 'art-ref':
            s.emit(f'<Art svg={{art_{a["h"]}}} />'); s.d += 1; return
        if s.svg:  # restore svg camelCase tag names
            tag_l = {'radialgradient': 'radialGradient', 'lineargradient': 'linearGradient', 'clippath': 'clipPath'}.get(tag, tag)
        if tag == 'a':
            label = a.get('aria-label') or ''
            s.emit('<A' + (f' k={repr(a.get("href", "#"))}' ) + ' label={null}')
            s.alabel = len(s.buf) - 1 if s.buf is not None else None
            tag_l = 'A'; a.pop('href', None)
        else:
            s.emit('<' + tag_l)
        for k, v in a.items():
            if k == 'style': s.emit(f' style={style_obj(v)}'); continue
            n = camel(k.lower() if not s.svg else k)
            if v is None: s.emit(f' {n}'); continue
            s.emit(f' {n}={repr(H.unescape(v)).replace(chr(39), chr(34)) if chr(34) not in v else repr(H.unescape(v))}')
        if tag in VOID and tag not in ('path', 'rect', 'circle', 'line', 'ellipse', 'polyline', 'polygon', 'stop'):
            s.emit(' />')
            if s.d == 1: s.flush()
            return
        s.emit('>'); s.d += 1
    def handle_startendtag(s, tag, attrs):
        s.handle_starttag(tag, attrs)
        if tag not in VOID or tag in ('path', 'rect', 'circle', 'line', 'ellipse', 'polyline', 'polygon', 'stop'):
            s.handle_endtag(tag)
    def handle_endtag(s, tag):
        if tag in VOID and tag not in ('path', 'rect', 'circle', 'line', 'ellipse', 'polyline', 'polygon', 'stop'): return
        s.d -= 1
        if tag == 'art-ref': return
        if tag == 'svg': s.svg -= 1
        name = {'a': 'A', 'radialgradient': 'radialGradient', 'lineargradient': 'linearGradient', 'clippath': 'clipPath'}.get(tag, tag)
        s.emit(f'</{name}>')
        if s.d == 1: s.flush()
    def flush(s):
        if s.buf: s.secs.append(''.join(s.buf))
        s.buf = None
    def handle_data(s, d): s.emit(text_jsx(d))
    def handle_entityref(s, n): s.emit(text_jsx(H.unescape('&' + n + ';')))
    def handle_charref(s, n): s.emit(text_jsx(H.unescape('&#' + n + ';')))

p = P(); p.feed(body)
secs = p.secs
assert len(secs) == len(NAMES), (len(secs), NAMES)
# label each anchor by its visible text for link wiring
def label_links(jsx):
    def rep(m):
        inner = re.sub(r'<[^>]+>', ' ', m.group(2)); inner = re.sub(r"\{'[^']*'\}|\{\"[^\"]*\"\}", ' ', inner)
        lab = re.sub(r'\s+', ' ', inner).strip()
        al = re.search(r'aria-label="([^"]*)"', m.group(1))
        if al: lab = al.group(1)
        return m.group(1).replace('label={null}', 'label=' + repr(lab).replace("'", '"') if '"' not in lab else 'label=' + repr(lab)) + '>' + m.group(2) + '</A>'
    prev = None
    while prev != jsx:
        prev = jsx
        jsx = re.sub(r'(<A k=[^>]*label=\{null\}[^>]*)>((?:(?!<A ).)*?)</A>', rep, jsx, flags=re.S)
    return jsx

for name, jsx in zip(NAMES, secs):
    jsx = label_links(jsx)
    used = sorted(set(re.findall(r'art_([0-9a-f]{10})', jsx)))
    imports = ''.join(f'import art_{h} from "../art/{h}.svg?raw";\n' for h in used)
    hdr = '// Generated from nila-design/boards/' + os.path.basename(SRC) + ' (W1). Re-generate, do not restyle by hand.\n'
    hdr += 'import { A' + (', Art' if used else '') + ' } from "../links.jsx";\n' + imports
    if '<A ' not in jsx: hdr = hdr.replace('import { A, Art }', 'import { Art }').replace('import { A } from "../links.jsx";\n', '')
    open(os.path.join(OUT, PREFIX + name + '.jsx'), 'w').write(hdr + f'\nexport default function {PREFIX}{name}() {{\n  return (\n    {jsx}\n  );\n}}\n')
print('sections', len(secs), 'art', len(arts))
