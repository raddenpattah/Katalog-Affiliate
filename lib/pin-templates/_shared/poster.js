// lib/pin-templates/_shared/poster.js
// Style "Poster": teks gede nutup 2/3 atas foto (overlay hitam transparan).
// Horizontal (dibaca normal), banyak baris → nutup dari atas ke bawah.

import { resolvePalette } from './palettes.js';

export function posterLayout({ title, imageDataUrl, category, plan }) {
  const p = plan || {};
  const palette = resolvePalette(p.palette || 'warm');
  const ctaCard = p.ctaCard || {};

  const judul = (title || '').toUpperCase();
  const narasi = ctaCard.fullText || ctaCard.narasi || 'Baca artikelnya, selengkapnya yuk';
  const judulWords = judul.split(' ').filter(Boolean);

  const accentColor = palette.accent || '#f3ece2';
  const darkColor = palette.to || '#1c1917';

  return {
    type: 'div',
    props: {
      style: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '1000px',
        height: '1500px',
        backgroundColor: '#1c1917',
        fontFamily: 'Plus Jakarta Sans',
        overflow: 'hidden',
      },
      children: [
        // Layer 1: Foto full-bleed
        {
          type: 'img',
          props: {
            src: imageDataUrl,
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '1000px',
              height: '1500px',
              objectFit: 'cover',
            },
          },
        },

        // Layer 2: Overlay hitam gradient (2/3 atas)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '1000px',
              height: '1050px',
              background: 'linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.78) 60%, rgba(0,0,0,0) 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'center',
              paddingTop: '100px',
              paddingLeft: '40px',
              paddingRight: '40px',
              paddingBottom: '40px',
              boxSizing: 'border-box',
            },
            children: [
              // Badge kategori
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    padding: '12px 30px',
                    backgroundColor: accentColor,
                    color: darkColor,
                    fontSize: '26px',
                    fontWeight: 700,
                    borderRadius: '999px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    marginBottom: '45px',
                  },
                  children: category || 'DEKORASI',
                },
              },

              // Judul GEDE (per-kata)
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignItems: 'baseline',
                    gap: '22px',
                    marginBottom: '45px',
                  },
                  children: judulWords.map((word, i) => ({
                    type: 'div',
                    props: {
                      key: i,
                      style: {
                        display: 'flex',
                        fontFamily: 'Plus Jakarta Sans',
                        fontWeight: 700,
                        fontSize: '100px',
                        lineHeight: 1.1,
                        color: '#ffffff',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                      },
                      children: word,
                    },
                  })),
                },
              },

              // Divider
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    width: '120px',
                    height: '5px',
                    backgroundColor: accentColor,
                    borderRadius: '999px',
                    marginBottom: '45px',
                  },
                },
              },

              // Narasi CTA
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: '52px',
                    fontWeight: 600,
                    lineHeight: 1.4,
                    color: accentColor,
                    textAlign: 'center',
                    maxWidth: '820px',
                  },
                  children: narasi,
                },
              },
            ],
          },
        },

        // Layer 3: Signature
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: '40px',
              right: '50px',
              display: 'flex',
              fontSize: '20px',
              fontWeight: 400,
              color: '#ffffff',
              opacity: 0.75,
            },
            children: 'alfeto.vercel.app',
          },
        },
      ],
    },
  };
}
