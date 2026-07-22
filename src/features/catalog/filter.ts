import type { Product } from "@/types";

export interface CatalogParams {
  q?: string;
  brand?: string;
  category?: string;
  condition?: string;
  sort?: string;
  min?: string;
  max?: string;
}

/** Pure filter + sort used by the /parts server page. */
export function filterProducts(products: Product[], params: CatalogParams): Product[] {
  let result = [...products];

  if (params.q) {
    const q = params.q.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brandName.toLowerCase().includes(q) ||
        p.oemNumbers.some((n) => n.toLowerCase().includes(q)) ||
        p.fitment.some((f) => `${f.brand} ${f.model}`.toLowerCase().includes(q)),
    );
  }

  if (params.brand) {
    const brands = params.brand.split(",");
    result = result.filter((p) =>
      brands.includes(p.brandName.toLowerCase().replace(/\s+/g, "-")),
    );
  }

  if (params.category) {
    const cats = params.category.split(",");
    result = result.filter((p) => cats.includes(p.categorySlug));
  }

  if (params.condition) {
    const conds = params.condition.split(",");
    result = result.filter((p) => conds.includes(p.condition));
  }

  if (params.min) {
    const min = Number(params.min) * 100;
    result = result.filter((p) => p.priceCents >= min);
  }
  if (params.max) {
    const max = Number(params.max) * 100;
    result = result.filter((p) => p.priceCents <= max);
  }

  switch (params.sort) {
    case "price-asc":
      result.sort((a, b) => a.priceCents - b.priceCents);
      break;
    case "price-desc":
      result.sort((a, b) => b.priceCents - a.priceCents);
      break;
    case "newest":
      result.sort((a, b) => +new Date(b.listedAt) - +new Date(a.listedAt));
      break;
    default:
      // "featured" — featured first, then newest
      result.sort(
        (a, b) =>
          Number(!!b.isFeatured) - Number(!!a.isFeatured) ||
          +new Date(b.listedAt) - +new Date(a.listedAt),
      );
  }

  return result;
}
