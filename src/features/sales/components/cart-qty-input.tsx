"use client";

import { useEffect, useState } from "react";

interface CartQtyInputProps {
  quantity: number;
  productId: string;
  productName: string;
  onCommit: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export function CartQtyInput({
  quantity,
  productId,
  productName,
  onCommit,
  onRemove,
}: CartQtyInputProps) {
  const [val, setVal] = useState(String(quantity));

  useEffect(() => {
    setVal(String(quantity));
  }, [quantity]);

  return (
    <input
      type="number"
      min="1"
      aria-label={`Quantity for ${productName}`}
      value={val}
      onChange={(e) => {
        setVal(e.target.value);
        const n = parseInt(e.target.value, 10);
        if (n > 0) onCommit(productId, n);
      }}
      onBlur={() => {
        const n = parseInt(val, 10);
        if (!n || n <= 0) onRemove(productId);
        else {
          setVal(String(n));
          onCommit(productId, n);
        }
      }}
      onFocus={(e) => e.target.select()}
      className="w-10 text-center text-sm font-semibold tabular-nums bg-transparent border rounded px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}
