"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/shared/lib/utils";

interface Tab {
  value: string;
  label: string;
}

const TABS: Tab[] = [
  { value: "jobs", label: "Service Jobs" },
  { value: "catalog", label: "Catalog" },
];

export function ServicesTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "jobs";

  function handleTabChange(value: string) {
    const params = new URLSearchParams();
    if (value !== "jobs") params.set("tab", value);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex gap-1 border-b">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => handleTabChange(tab.value)}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
            activeTab === tab.value
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
