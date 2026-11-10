// From nila-design/boards/LandHow.dc.html (W4), ported once; hand-owned since 10 Nov (copy rewritten, Carst).

export default function DTop() {
  return (
    <section style={{position: 'relative', overflow: 'hidden', background: '#0E1014'}}><div style={{position: 'absolute', inset: '0', pointerEvents: 'none', opacity: '0.04', backgroundImage: 'linear-gradient(rgba(255,255,255,0.75) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.75) 1px, transparent 1px)', backgroundSize: '48px 48px'}}></div><div style={{position: 'relative'}}><div style={{maxWidth: '1152px', margin: '0 auto', padding: '64px 24px 8px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '12px'}}><span style={{fontSize: '12px', fontWeight: '700', lineHeight: '1.5', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94A3B8'}}>How it works</span><h1 style={{margin: '0', fontSize: '64px', fontWeight: '700', lineHeight: '1.1', letterSpacing: '-0.02em'}}>The crop plan,<br />and how we know it happened.</h1></div></div></section>
  );
}
