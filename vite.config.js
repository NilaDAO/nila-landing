import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { FAQ } from './src/w1/faq.js'

// FAQPage structured data from the same answers the home page shows (docs/LLMS_plan.md §5).
const faqJsonLd = () => ({
  name: 'faq-jsonld',
  transformIndexHtml(html) {
    const data = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
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
