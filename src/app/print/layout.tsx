import { requireStaff } from "@/server/session";
import { PrintToolbar } from "./print-toolbar";

/**
 * Print shell — lives OUTSIDE the (app) shell so there is no sidebar or app
 * chrome. Renders a screen-only toolbar and a centered A4-ish white page that
 * fills the sheet cleanly when printed.
 */
export default async function PrintLayout({ children }: { children: React.ReactNode }) {
  await requireStaff();

  return (
    <div className="min-h-screen bg-muted/40 text-foreground print:bg-white">
      <PrintToolbar />
      <div className="mx-auto max-w-[820px] px-4 py-6 print:p-0">
        <div className="mx-auto w-full max-w-[800px] rounded-lg border border-border bg-white p-10 text-[13px] leading-relaxed text-slate-900 shadow-sm print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
          {children}
        </div>
      </div>
    </div>
  );
}
