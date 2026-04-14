"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AutoPrintInvoice() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
      router.push("/pos");
    }, 500);

    return () => clearTimeout(timer);
  }, [router]);

  return null;
}
