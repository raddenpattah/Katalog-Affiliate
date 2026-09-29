import Image from "next/image";

interface Product {
  id: string;
  title: string;
  price: string;
  image: string;
  affiliateUrl: string;
}

const products: Product[] = [
  {
    id: "1",
    title: "Lampu Meja Minimalis Hitam (Matte Black)",
    price: "Rp185.000",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80",
    affiliateUrl: "https://shopee.co.id",
  },
  {
    id: "2",
    title: "Karpet Geometris Kamar Modern",
    price: "Rp210.000",
    image: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=500&q=80",
    affiliateUrl: "https://shopee.co.id",
  },
  {
    id: "3",
    title: "Rak Kayu Gantung Serbaguna (Set of 4)",
    price: "Rp99.000",
    image: "https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?w=500&q=80",
    affiliateUrl: "https://shopee.co.id",
  },
  {
    id: "4",
    title: "Riser Monitor Kayu Multifungsi",
    price: "Rp130.000",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80",
    affiliateUrl: "https://shopee.co.id",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fcfbf9] text-gray-800 py-10 px-4 font-sans">
      <div className="max-w-md mx-auto">
        {/* Header Profil */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-emerald-600 shadow-sm">
            <Image
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=200&q=80"
              alt="Alfato Decor Logo"
              fill
              className="object-cover"
            />
          </div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
            Alfato Decor 🌿
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Spill Dekorasi Kamar & Desk Setup Minimalis
          </p>
        </div>

        {/* Grid Produk */}
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-square w-full bg-gray-50">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-3 flex flex-col flex-1 justify-between">
                <div>
                  <h2 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug mb-1">
                    {product.title}
                  </h2>
                  <p className="text-xs font-bold text-emerald-600 mb-3">
                    {product.price}
                  </p>
                </div>

                <a
                  href={product.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-stone-900 hover:bg-black text-white text-[11px] font-medium py-2 rounded-lg text-center block transition-colors"
                >
                  Beli di Shopee
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
