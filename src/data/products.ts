import { categoryLabels, isProductCategory, type ProductCategory } from './categories';

export { categoryLabels, productCategories, type ProductCategory } from './categories';

export interface Product {
  id: string;
  title: string;
  slug?: string;
  category: ProductCategory;
  image: string;
  shopeeUrl: string;
  badge?: string;
  description?: string;
}

interface ProductRouteSource {
  key: string;
  id: string;
  slug?: string;
}

export function resolveProductRouteSlugs(items: ProductRouteSource[]) {
  const orderedItems = [...items].sort((left, right) => left.key.localeCompare(right.key));
  const idCounts = new Map<string, number>();
  const reservedSlugs = new Set(
    orderedItems.map(({ slug }) => slug?.trim()).filter((slug): slug is string => Boolean(slug)),
  );
  const usedSlugs = new Set<string>();
  const routes = new Map<string, string>();

  for (const item of orderedItems) {
    idCounts.set(item.id, (idCounts.get(item.id) || 0) + 1);
  }

  for (const item of orderedItems) {
    const preferredSlug = item.slug?.trim();
    let routeSlug = preferredSlug || item.id;
    if (
      usedSlugs.has(routeSlug) ||
      (!preferredSlug && (idCounts.get(item.id)! > 1 || reservedSlugs.has(item.id)))
    ) {
      routeSlug = item.key;
    }
    if (usedSlugs.has(routeSlug)) {
      throw new Error(`Product route slug "${routeSlug}" is not unique.`);
    }
    usedSlugs.add(routeSlug);
    routes.set(item.key, routeSlug);
  }

  return routes;
}

const productFiles = import.meta.glob<Product>('./products/*.json', {
  eager: true,
  import: 'default',
});

const productFileEntries = Object.entries(productFiles);
const routeSlugs = resolveProductRouteSlugs(
  productFileEntries.map(([filePath, product]) => ({
    key: filePath.split('/').pop()!.replace(/\.json$/, ''),
    id: product.id,
    slug: product.slug,
  })),
);

export const products: Product[] = productFileEntries.map(([filePath, product], index) => {
  if (!isProductCategory(product.category)) {
    throw new Error(`Product ${index + 1} has an unsupported category "${product.category}".`);
  }

  const key = filePath.split('/').pop()!.replace(/\.json$/, '');
  return { ...product, slug: routeSlugs.get(key), category: product.category };
});
