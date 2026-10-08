// lib/board-mapper.js
// Auto-route pin ke board Pinterest berdasarkan keyword di judul + subtitle.
// Logika: keyword scoring + weighted, fallback ke board default.

// Mapping board -> keyword relevan + weight
// Weight lebih tinggi = prioritas lebih besar kalau match
const BOARD_MAP = {
  "Rak & Ambalan": {
    weight: 3,
    keywords: ["rak", "ambalan", "dinding", "gantung", "shelf", "floating"],
  },
  "Lampu & Pencahayaan": {
    weight: 3,
    keywords: ["lampu", "meja", "tidur", "cahaya", "lighting", "lamp", "led"],
  },
  "Dekorasi Kamar": {
    weight: 2,
    keywords: ["dekorasi", "kamar", "aesthetic", "cozy", "bedroom", "ruang tidur"],
  },
  "Tanaman & Hijau": {
    weight: 2,
    keywords: ["tanaman", "hias", "bunga", "hijau", "plant", "monstera", "kaktus"],
  },
  "Wall Panel & Dinding": {
    weight: 2,
    keywords: ["wall", "panel", "pvc", "wallpaper", "wpc", "wallboard"],
  },
  "Meja & Kursi": {
    weight: 2,
    keywords: ["meja", "kursi", "table", "chair", "desk", "ergonomis"],
  },
  "Karpet & Alas": {
    weight: 2,
    keywords: ["karpet", "alas", "rug", "mat", "permadani"],
  },
  "Storage & Organizer": {
    weight: 2,
    keywords: ["storage", "organizer", "kotak", "box", "penyimpanan", "lemari"],
  },
  "Dapur & Dinning": {
    weight: 2,
    keywords: ["dapur", "kitchen", "dining", "piring", "gelas", "mug"],
  },
  "Kamar Mandi": {
    weight: 2,
    keywords: ["kamar mandi", "bathroom", "shower", "toilet", "wastafel"],
  },
};

// Board default kalau nggak ada keyword yang match
const DEFAULT_BOARD = "Inspirasi Ruang";

/**
 * Assign board berdasarkan judul + subtitle.
 * @param {string} title - Judul artikel
 * @param {string} subtitle - Subtitle / kategori / deskripsi
 * @returns {string} - Nama board
 */
export function assignBoard(title, subtitle) {
  const text = ((title || '') + ' ' + (subtitle || '')).toLowerCase();

  if (!text.trim()) {
    return DEFAULT_BOARD;
  }

  let bestBoard = DEFAULT_BOARD;
  let bestScore = 0;

  for (const [boardName, config] of Object.entries(BOARD_MAP)) {
    let score = 0;
    for (const keyword of config.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += config.weight;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestBoard = boardName;
    }
  }

  return bestBoard;
}

/**
 * Dapatkan semua board yang tersedia (untuk UI / dropdown).
 * @returns {string[]}
 */
export function getAllBoards() {
  return Object.keys(BOARD_MAP);
}

/**
 * Dapatkan board default.
 * @returns {string}
 */
export function getDefaultBoard() {
  return DEFAULT_BOARD;
}
