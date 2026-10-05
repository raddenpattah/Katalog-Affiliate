export const productCategories = ['dinding', 'tanaman', 'lampu', 'aksesoris'] as const;

export type ProductCategory = (typeof productCategories)[number];

export const categoryLabels: Record<ProductCategory, string> = {
  dinding: 'Dinding & Panel',
  tanaman: 'Tanaman & Pot',
  lampu: 'Lampu & Cermin',
  aksesoris: 'Aksesoris Ruang',
};
