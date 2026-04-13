import { getShopProducts } from "@/features/orders/queries";
import { ShopCatalogClient } from "./shop-catalog-client";

export const metadata = { title: "Shop — ADS Paint Center" };

export default async function ShopPage() {
  const products = await getShopProducts();
  return <ShopCatalogClient products={products} />;
}
