export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              ADS Paint Center
            </h1>
            <p className="text-xs text-slate-500">Online Store</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      <footer className="border-t bg-white py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} ADS Paint Center. All rights reserved.
      </footer>
    </div>
  );
}
