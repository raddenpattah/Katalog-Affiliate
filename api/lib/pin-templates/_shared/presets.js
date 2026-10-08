// api/lib/pin-templates/_shared/presets.js
// Layout preset per style. Dipakai kalau AI Planner gagal / return null.

export const PRESETS = {
  warm: {
    layout: 'photo-bottom',
    textCard: {
      position: 'top',
      width: 820,
      padding: 40,
      theme: 'warm',
      fontSize: 64,
      subtitle: 'Hemat tempat di meja, tampil lebih rapi & estetik setiap hari.',
    },
    image: { maskFrom: 45, maskTo: 80 },
    gradient: { from: 'transparent', to: '#7a5a3e', startAt: '55%' },
    cta: { text: 'alfeto.vercel.app', bgColor: '#7a5a3e', textColor: '#f3ece2' },
  },

  minimalis: {
    layout: 'photo-bottom',
    textCard: {
      position: 'top',
      width: 820,
      padding: 40,
      theme: 'light',
      fontSize: 64,
      subtitle: 'Pilihan terbaik untuk ruangan aesthetic kamu.',
    },
    image: { maskFrom: 50, maskTo: 85 },
    gradient: { from: 'transparent', to: '#fafaf9', startAt: '60%' },
    cta: { text: 'alfeto.vercel.app', bgColor: '#c2410c', textColor: '#ffffff' },
  },

  bold: {
    layout: 'photo-bottom',
    textCard: {
      position: 'top',
      width: 820,
      padding: 40,
      theme: 'bold',
      fontSize: 68,
      subtitle: 'Statement piece untuk ruangan berkarakter.',
    },
    image: { maskFrom: 40, maskTo: 75 },
    gradient: { from: 'transparent', to: '#1c1917', startAt: '50%' },
    cta: { text: 'alfeto.vercel.app', bgColor: '#c2410c', textColor: '#ffffff' },
  },

  editorial: {
    layout: 'photo-bottom',
    textCard: {
      position: 'top',
      width: 820,
      padding: 40,
      theme: 'light',
      fontSize: 62,
      subtitle: 'Inspirasi ruang pilihan editor.',
    },
    image: { maskFrom: 45, maskTo: 80 },
    gradient: { from: 'transparent', to: '#292524', startAt: '55%' },
    cta: { text: 'alfeto.vercel.app', bgColor: '#292524', textColor: '#fafaf9' },
  },
};

// Ambil preset berdasarkan style, fallback ke warm
export function getPreset(style) {
  return PRESETS[style] || PRESETS.warm;
}
