import { ShopRegisterForm } from "./shop-register-form";

export const metadata = { title: "Create Account — ADS Paint Center" };

export default async function ShopRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  return (
    <div className="mx-auto max-w-sm py-16">
      <ShopRegisterForm redirectTo={redirect ?? "/shop"} />
    </div>
  );
}
