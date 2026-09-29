import React from 'react';

// Data produk katalog Alfeto Decor
const products = [
  {
    id: 1,
    title: 'Lampu Tidur Meja Kristal Berlian LED',
    price: 'Rp35.000',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500', 
    affiliateUrl: 'https://shope.ee/xxxxxx', 
  },
  {
    id: 2,
    title: 'Rak Dinding Hexagonal Minimalis Kayu',
    price: 'Rp45.000',
    image: 'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?w=500',
    affiliateUrl: 'https://shope.ee/yyyyyy',
  },
  {
    id: 3,
    title: 'Tanaman Hias Media Air + Vas Kaca Transparan',
    price: 'Rp20.000',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500',
    affiliateUrl: 'https://shope.ee/zzzzzz',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 py-8 px-4 max-w-md mx-auto">
      {/* Profil Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-stone-200 overflow-hidden border-2 border-emerald-600 shadow-sm flex items-center justify-center font-bold text-stone-600 text-xl">
          AD
        </div>
        <h1 className="text-xl font-bold text-stone-800 tracking-tight">Alfato Decor 🌿</h1>
        <p className="text-xs text-stone-500 mt-1">Spill Dekorasi Kamar & Desk Setup Minimalis</p>
      </div>

      {/* Grid Katalog Produk (Tampilan 2 Kolom) */}
      <div className="grid grid-cols-2 gap-3">
        {products.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden flex flex-col">
            <div className="relative aspect-[2/3] w-full bg-stone-100">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="p-3 flex flex-col flex-1 justify-between">
              <div>
                <h2 className="text-xs font-semibold text-stone-800 line-clamp-2 leading-snug">{item.title}</h2>
                <p className="text-xs font-bold text-emerald-600 mt-1.5">{item.price}</p>
              </div>
              <a
                href={item.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block w-full text-center bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-semibold py-2 rounded-lg transition"
              >
                Beli di Shopee
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
