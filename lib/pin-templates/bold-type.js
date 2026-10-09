// lib/pin-templates/bold-type.js
// Style "Bold Type": teks raksasa, foto interior background.
// Koordinat X,Y absolute — posisi FIX.
// Batas kata:
//   - Angka: max 3 karakter
//   - Kata kunci: max 3 kata
//   - Kategori: max 4 kata
//   - Tahun: 4 karakter

export function renderBoldType({ title, imageDataUrl, category, plan }) {
  const p = plan || {};
  const hook = p.boldHook || {};

  // Helper: potong jumlah kata
  const limitWords = (str, maxWords) => {
    const words = String(str || '').trim().split(/\s+/);
    return words.slice(0, maxWords).join(' ');
  };

  // Helper: auto-shrink font kalau kepanjangan
  const autoSize = (str, baseSize, maxLen) => {
    const len = String(str || '').length;
    if (len <= maxLen) return baseSize;
    const factor = maxLen / len;
    return Math.max(Math.round(baseSize * factor), 60);
  };

  // Ambil data + batasi
  let angka = String(hook.angka || '10').trim();
  if (angka.length > 3) angka = angka.slice(0, 3);

  const kataKunciRaw = limitWords(hook.kataKunci || 'DEKORASI', 3).toUpperCase();
  const kategoriRaw = limitWords(hook.kategori || 'Ruang Tamu', 4);
  const tahun = String(hook.tahun || '2026').slice(0, 4);

  // Auto-shrink font
  const angkaSize = autoSize(angka, 200, 3);

  // Kata kunci: pecah jadi 2 baris kalau > 12 karakter ATAU > 2 kata
  const kataKunciWords = kataKunciRaw.split(' ');
  let kataKunciLines;
  if (kataKunciRaw.length <= 12 && kataKunciWords.length <= 2) {
    kataKunciLines = [kataKunciRaw];
  } else if (kataKunciWords.length >= 2) {
    // Bagi 2 baris per kata
    const mid = Math.ceil(kataKunciWords.length / 2);
    kataKunciLines = [
      kataKunciWords.slice(0, mid).join(' '),
      kataKunciWords.slice(mid).join(' '),
    ];
  } else {
    kataKunciLines = [kataKunciRaw];
  }
  const kataKunciMaxLen = Math.max(...kataKunciLines.map(l => l.length));
  const kataKunciSize = autoSize('x'.repeat(kataKunciMaxLen), 110, 10);

  const kategoriSize = autoSize(kategoriRaw, 90, 22);

  const ACCENT = '#c2410c';

  return {
    type: 'div',
    props: {
      style: {
        position: 'relative',
        display: 'flex',
        width: '1000px',
        height: '1500px',
        backgroundColor: '#f5f0e8',
        fontFamily: 'Plus Jakarta Sans',
        overflow: 'hidden',
      },
      children: [
        // Layer 1: Foto
        imageDataUrl
          ? {
              type: 'img',
              props: {
                src: imageDataUrl,
                style: {
                  position: 'absolute',
                  top: 0, left: 0,
                  width: '1000px', height: '1500px',
                  objectFit: 'cover',
                },
              },
            }
          : {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  top: 0, left: 0,
                  width: '1000px', height: '1500px',
                  backgroundColor: '#e8dccb',
                  display: 'flex',
                },
                children: '',
              },
            },

        // Layer 2: Overlay gelap
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0, left: 0,
              width: '1000px', height: '1500px',
              background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.6) 100%)',
              display: 'flex',
            },
            children: '',
          },
        },

        // Layer 3: ANGKA — Y: 320
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '320px', left: '0',
              width: '1000px',
              display: 'flex',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: angkaSize + 'px',
              lineHeight: 0.9,
              color: '#ffffff',
              letterSpacing: '-4px',
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
            },
            children: angka,
          },
        },

        // Layer 4: KATA KUNCI — Y: 520 (bisa 2 baris)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '520px', left: '0',
              width: '1000px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            },
            children: kataKunciLines.map((line, i) => ({
              type: 'div',
              props: {
                key: i,
                style: {
                  display: 'flex',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: kataKunciSize + 'px',
                  lineHeight: 1,
                  letterSpacing: '-2px',
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  marginBottom: '6px',
                },
                children: line,
              },
            })),
          },
        },

        // Layer 5: KATEGORI (italic serif) — Y: 700
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '780px', left: '0',
              width: '1000px',
              display: 'flex',
              justifyContent: 'center',
              fontFamily: 'Fraunces',
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: kategoriSize + 'px',
              lineHeight: 1,
              color: '#ffffff',
              textAlign: 'center',
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
            },
            children: kategoriRaw,
          },
        },

        // Layer 6: TAHUN BADGE — Y: 850
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '920px',
              left: '0',
              right: '0',
              display: 'flex',
              justifyContent: 'center',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    padding: '14px 40px',
                    backgroundColor: ACCENT,
                    color: '#ffffff',
                    fontSize: '42px',
                    fontWeight: 700,
                    borderRadius: '999px',
                    letterSpacing: '4px',
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  },
                  children: tahun,
                },
              },
            ],
          },
        },

        // Layer 7: SIGNATURE
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: '60px', left: '0',
              width: '1000px',
              display: 'flex',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '4px',
              opacity: 0.75,
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            },
            children: 'alfeto.vercel.app',
          },
        },
      ],
    },
  };
}
