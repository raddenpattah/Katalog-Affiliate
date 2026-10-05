export const productCategories = ['dinding', 'tanaman', 'lampu', 'aksesoris'] as const;

export type ProductCategory = (typeof productCategories)[number];

export interface Product {
  id: string;
  title: string;
  category: ProductCategory;
  price: string;
  imageUrl: string;
  shopeeUrl: string;
  badge?: string;
}

export const categoryLabels: Record<ProductCategory, string> = {
  dinding: 'Dinding & Panel',
  tanaman: 'Tanaman & Pot',
  lampu: 'Lampu & Cermin',
  aksesoris: 'Aksesoris Ruang',
};

export const products: Product[] = [
  {
    id: 'wpc-wood-wall-panel',
    title: 'WPC Wood Wall Panel',
    category: 'dinding',
    price: 'Rp22.000',
    imageUrl: '/images/products/wpc-wood-wall-panel.jpg',
    shopeeUrl: 'https://s.shopee.co.id/BULBzDdYN',
    badge: 'Terjual 10k+',
  },
  {
    id: 'wall-panel-3d-pvc-geometris',
    title: 'Wall Panel 3D PVC Geometris',
    category: 'dinding',
    price: 'Rp7.500',
    imageUrl:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
    shopeeUrl: 'https://shopee.co.id/search?keyword=Wall%20Panel%203D%20PVC%20Geometris',
    badge: 'Bisa DIY',
  },
  {
    id: 'calathea-lutea-indoor',
    title: 'Tanaman Hias Calathea Lutea Indoor',
    category: 'tanaman',
    price: 'Rp35.000',
    imageUrl:
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
    shopeeUrl: 'https://shopee.co.id/search?keyword=Tanaman%20Hias%20Calathea%20Lutea%20Indoor',
    badge: 'Aesthetic',
  },
  {
    id: 'pot-keramik-minimalis-bergaris',
    title: 'Pot Keramik Minimalis Bergaris',
    category: 'tanaman',
    price: 'Rp28.000',
    imageUrl:
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80',
    shopeeUrl: 'https://shopee.co.id/search?keyword=Pot%20Keramik%20Minimalis%20Bergaris',
    badge: 'Minimalis',
  },
  {
    id: 'lampu-dinding-sorot-warm-white',
    title: 'Lampu Dinding Sorot Warm White Up-Down',
    category: 'lampu',
    price: 'Rp45.000',
    imageUrl:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80',
    shopeeUrl:
      'https://shopee.co.id/search?keyword=Lampu%20Dinding%20Sorot%20Warm%20White%20Up-Down',
    badge: 'Hemat Listrik',
  },
  {
    id: 'cermin-dinding-gantung-aesthetic',
    title: 'Cermin Dinding Gantung Aesthetic',
    category: 'aksesoris',
    price: 'Rp55.000',
    imageUrl: '/images/products/cermin-dinding-gantung-aesthetic.jpg',
    shopeeUrl: 'https://s.shopee.co.id/50ZawwX0oO',
    badge: 'Terlaris',
  },
];
