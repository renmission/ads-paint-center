"use client";

import { Button } from "@/shared/components/ui/button";
import { Printer, Download } from "lucide-react";

interface Props {
  id: string;
  transactionNumber: string;
}

export function InvoicePrintButton({ id, transactionNumber }: Props) {
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="mr-1.5 h-4 w-4" />
        Print
      </Button>
      <a
        href={`/api/invoice/${id}/pdf`}
        download={`invoice-${transactionNumber}.pdf`}
      >
        <Button variant="outline" size="sm">
          <Download className="mr-1.5 h-4 w-4" />
          Download PDF
        </Button>
      </a>
    </>
  );
}
