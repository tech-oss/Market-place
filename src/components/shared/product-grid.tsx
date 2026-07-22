import type { Product } from "@/types";
import { ProductCard } from "./product-card";
import { Reveal } from "./reveal";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product, i) => (
        <Reveal key={product.id} delay={Math.min(i, 8) * 0.04}>
          <ProductCard product={product} />
        </Reveal>
      ))}
    </div>
  );
}
