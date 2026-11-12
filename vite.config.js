import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { FAQ } from './src/w1/faq.js'
import { PARTNERS } from './src/w1/partners.js'

// FAQPage structured data from the same answers the home page shows (docs/LLMS_plan.md §5).
const faqJsonLd = () => ({
  name: 'faq-jsonld',
  transformIndexHtml(html) {
    const data = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
    // Partners (src/w1/partners.js): a line in the plain-text block and their page in the Organization's sameAs.
    const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    html = html.replace('<!-- partners: one line per partner from src/w1/partners.js, injected at build (vite.config.js) -->',
      PARTNERS.map((p) => `<li>Integrated with ${esc(p.name)}: <a href="${p.href}">${esc(p.what)}</a></li>`).join('\n          '))
    html = html.replace('"https://github.com/NilaDAO"]', `"https://github.com/NilaDAO"${PARTNERS.map((p) => `, "${p.href}"`).join('')}]`)
    return html.replace('<!-- faq-jsonld: FAQPage from src/w1/faq.js, injected at build (vite.config.js) -->', `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`)
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    faqJsonLd(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-three':  ['three', 'globe.gl', 'react-globe.gl'],
          'vendor-ethers': ['ethers'],
        },
      },
    },
  },
})
