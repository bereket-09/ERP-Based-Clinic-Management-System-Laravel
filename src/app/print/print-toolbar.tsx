"use client";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Screen-only toolbar for the print pages. Hidden in print via `.no-print`.
 * The Print button triggers the browser print dialog; Back returns in history.
 */
export function PrintToolbar() {
  return (
    <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur">
      <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
        <ArrowLeft /> Back
      </Button>
      <Button variant="primary" size="sm" onClick={() => window.print()}>
        <Printer /> Print
      </Button>
    </div>
  );
}
