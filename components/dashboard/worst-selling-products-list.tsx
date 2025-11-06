import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function WorstSellingProductsList({ products }: { products: Product[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Worst Selling Products</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="flex items-center gap-4">
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                {product.category} • {formatCurrency(product.sell_price, "BDT")}
              </p>
            </div>
            <div className="ml-auto font-medium">{formatCurrency(product.sell_price, "BDT")}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
