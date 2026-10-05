export const productCategories = ['dinding', 'tanaman', 'lampu', 'aksesoris'] as const;

export type ProductCategory = (typeof productCategories)[number];

export interface Product {
  id: string;
  title: string;
  category: ProductCategory;
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

const productFiles = import.meta.glob<Product>('./products/*.json', {
  eager: true,
  import: 'default',
});

function isProductCategory(value: string): value is ProductCategory {
  return productCategories.some((category) => category === value);
}

export const products: Product[] = Object.values(productFiles).map((product, index) => {
  if (!isProductCategory(product.category)) {
    throw new Error(`Product ${index + 1} has an unsupported category "${product.category}".`);
  }

  return { ...product, category: product.category };
});
