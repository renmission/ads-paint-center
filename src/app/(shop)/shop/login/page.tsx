import { ShopLoginForm } from "./shop-login-form";

export const metadata = { title: "Sign In — ADS Paint Center" };

export default async function ShopLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  return (
    <div className="mx-auto max-w-sm py-16">
      <ShopLoginForm redirectTo={redirect ?? "/shop"} />
    </div>
  );
}
